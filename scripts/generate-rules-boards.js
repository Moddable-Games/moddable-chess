import { writeFileSync, readFileSync, readdirSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { renderBoardSVG } from '../js/svg-renderer.js';
import { positionFromFEN, positionFromPlacement } from '../js/position-parser.js';
import { loadManifestPieceDefs } from '../js/piece-loader.js';
import { XIANGQI_PIECES_TRAD, XIANGQI_PIECES_WEST } from '../js/xiangqi-pieces.js';
import { SHOGI_PIECES } from '../js/shogi-pieces.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const MANIFESTS_DIR = join(ROOT, 'assets', 'pieces', 'manifests');
const SETS_DIR = join(ROOT, 'assets', 'pieces', 'sets');
const RULES_ROOT = join(ROOT, '..', 'moddable-rules', 'games');

// --- Piece set resolution ---

function resolvePieces(board) {
  if (!board.pieceSet) return undefined;
  if (board.pieceSet.type === 'manifest') {
    // Try co-located manifest (new format) before legacy manifests/ dir
    const inSetPath = join(SETS_DIR, board.pieceSet.id, 'manifest.json');
    const legacyPath = join(MANIFESTS_DIR, board.pieceSet.id + '.json');
    const manifestPath = existsSync(inSetPath) ? inSetPath : legacyPath;
    return loadManifestPieceDefs(manifestPath, SETS_DIR);
  }
  if (board.pieceSet.type === 'sprite') {
    return board.pieceSet.defs;
  }
  return undefined;
}

// --- Position resolution ---

function resolvePosition(board) {
  if (!board.position) return {};
  const p = board.position;
  if (p.type === 'fen') {
    return positionFromFEN(p.fen, board.rows, board.cols, p.opts);
  }
  if (p.type === 'placement') {
    return positionFromPlacement({
      rows: board.rows,
      cols: board.cols,
      pieceRows: p.pieceRows,
      style: p.style,
    });
  }
  return {};
}

// --- Terrain resolution (Dungeon Chess) ---

function resolveTerrainFromDCMap(map) {
  const { grid, rows, cols, players } = map;
  const terrain = [];
  const spawnRows = new Set();
  const spawnCols = new Set();

  const topRows = [];
  for (let r = 0; r < rows && topRows.length < 2; r++) {
    if (grid[r].filter(c => c !== null).length >= 4) topRows.push(r);
  }
  const bottomRows = [];
  for (let r = rows - 1; r >= 0 && bottomRows.length < 2; r--) {
    if (grid[r].filter(c => c !== null).length >= 4) bottomRows.push(r);
  }
  topRows.forEach(r => spawnRows.add(r));
  bottomRows.forEach(r => spawnRows.add(r));

  if (players >= 4) {
    const leftCols = [];
    for (let c = 0; c < cols && leftCols.length < 2; c++) {
      const colCells = grid.map(row => row[c]).filter(v => v !== null);
      if (colCells.length >= 4) leftCols.push(c);
    }
    const rightCols = [];
    for (let c = cols - 1; c >= 0 && rightCols.length < 2; c--) {
      const colCells = grid.map(row => row[c]).filter(v => v !== null);
      if (colCells.length >= 4) rightCols.push(c);
    }
    leftCols.forEach(c => spawnCols.add(c));
    rightCols.forEach(c => spawnCols.add(c));
  }

  for (let r = 0; r < rows; r++) {
    const row = [];
    for (let c = 0; c < cols; c++) {
      const cell = grid[r][c];
      if (cell === null) {
        row.push(null);
      } else if (cell === 'w') {
        row.push('water');
      } else if (players >= 4 && (spawnRows.has(r) || spawnCols.has(c))) {
        row.push('spawn-a');
      } else if (players < 4 && topRows.includes(r)) {
        row.push('spawn-b');
      } else if (players < 4 && bottomRows.includes(r)) {
        row.push('spawn-a');
      } else {
        row.push('floor');
      }
    }
    terrain.push(row);
  }
  return terrain;
}

// --- Board config discovery ---

function discoverChessBoards() {
  const variantsDir = join(ROOT, 'js', 'variants');
  const rulesDir = join(RULES_ROOT, 'moddable-chess', 'content', 'variants');
  const files = readdirSync(variantsDir).filter(f => f.endsWith('.js') && f !== 'index.js');
  const boards = [];

  const SLUG_MAP = { 'chess960': 'fischer-random', 'teleport-chess': 'teleportation' };

  for (const file of files) {
    const content = readFileSync(join(variantsDir, file), 'utf8');
    const keyMatch = content.match(/registerVariant\(['"]([^'"]+)/);
    if (!keyMatch) continue;

    const fenMatch = content.match(/fen:\s*['"]([^'"]+)/);
    const rowsMatch = content.match(/rows:\s*(\d+)/);
    const colsMatch = content.match(/cols:\s*(\d+)/);
    const labelMatch = content.match(/label:\s*['"]([^'"]+)/);
    const titleMatch = content.match(/title:\s*['"]([^'"]+)/);

    const fileStem = file.replace('.js', '');
    let slug = SLUG_MAP[fileStem] || fileStem;
    if (!existsSync(join(rulesDir, slug + '.md'))) {
      const stripped = slug.replace(/-chess$/, '');
      if (existsSync(join(rulesDir, stripped + '.md'))) slug = stripped;
    }

    const rows = rowsMatch ? parseInt(rowsMatch[1]) : 8;
    const cols = colsMatch ? parseInt(colsMatch[1]) : 8;
    const name = titleMatch ? titleMatch[1] : (labelMatch ? labelMatch[1] : keyMatch[1]);
    const fen = fenMatch ? fenMatch[1] : 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

    boards.push({
      slug,
      title: `${name} — starting position`,
      provider: 'checkered',
      rows,
      cols,
      tileSize: 40,
      position: { type: 'fen', fen },
      outputDir: join(RULES_ROOT, 'moddable-chess', 'diagrams', 'svg'),
    });
  }

  const MANUAL = [
    { slug: 'chaturanga', name: 'Chaturanga', fen: 'rnefkenr/pppppppp/8/8/8/8/PPPPPPPP/RNEFKENR', rows: 8, cols: 8 },
    { slug: 'shatranj', name: 'Shatranj', fen: 'rnekfenr/pppppppp/8/8/8/8/PPPPPPPP/RNEKFENR', rows: 8, cols: 8 },
    { slug: 'diana', name: 'Diana Chess', fen: 'rbbkr1/pppppp/6/6/PPPPPP/RBBKR1', rows: 6, cols: 6 },
    { slug: 'petty', name: 'Petty Chess', fen: 'rnbqk/ppppp/5/5/PPPPP/RNBQK', rows: 6, cols: 5 },
  ];

  for (const m of MANUAL) {
    const existing = boards.findIndex(b => b.slug === m.slug);
    const entry = {
      slug: m.slug,
      title: `${m.name} — starting position`,
      provider: 'checkered',
      rows: m.rows,
      cols: m.cols,
      tileSize: 40,
      position: { type: 'fen', fen: m.fen },
      outputDir: join(RULES_ROOT, 'moddable-chess', 'diagrams', 'svg'),
    };
    if (existing >= 0) boards[existing] = entry;
    else boards.push(entry);
  }

  return boards;
}

// --- Static board configs ---

const DRAUGHTS_BOARDS = [
  { slug: 'english', name: 'English Draughts', rows: 8, cols: 8, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,2,5,6,7] } },
  { slug: 'international', name: 'International Draughts', rows: 10, cols: 10, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,2,3,6,7,8,9] } },
  { slug: 'canadian', name: 'Canadian Draughts', rows: 12, cols: 12, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,2,3,4,7,8,9,10,11] } },
  { slug: 'frisian', name: 'Frisian Draughts', rows: 10, cols: 10, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,2,3,6,7,8,9] } },
  { slug: 'lasca', name: 'Lasca', rows: 7, cols: 7, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,2,4,5,6] } },
  { slug: 'turkish', name: 'Turkish Draughts', rows: 8, cols: 8, provider: 'mono-grid', position: { type: 'placement', style: 'turkish', pieceRows: [1,2,5,6] } },
  { slug: 'thai', name: 'Thai Draughts', rows: 8, cols: 8, provider: 'checkered', position: { type: 'placement', style: 'checkered', pieceRows: [0,1,6,7] } },
  { slug: 'alquerque', name: 'Alquerque', rows: 5, cols: 5, provider: 'alquerque', position: { type: 'placement', style: 'alquerque' } },
].map(d => ({
  ...d,
  title: `${d.name} — starting position`,
  tileSize: 40,
  outputDir: join(RULES_ROOT, 'draughts', 'diagrams', 'svg'),
}));

const GO_BOARDS = [9, 13, 19].map(size => ({
  slug: `go-${size}x${size}`,
  title: `Go — ${size}×${size} board (empty)`,
  provider: 'go',
  rows: size,
  cols: size,
  tileSize: 20,
  outputDir: join(RULES_ROOT, 'go', 'diagrams', 'svg'),
}));

const MORRIS_BOARDS = [
  { slug: 'three-mens-morris', name: "Three Men's Morris", providerOpts: { rings: 1, diagonals: true } },
  { slug: 'six-mens-morris', name: "Six Men's Morris", providerOpts: { rings: 2, diagonals: false } },
  { slug: 'nine-mens-morris', name: "Nine Men's Morris", providerOpts: { rings: 3, diagonals: false } },
  { slug: 'twelve-mens-morris', name: "Twelve Men's Morris", providerOpts: { rings: 3, diagonals: true } },
  { slug: 'morabaraba', name: 'Morabaraba', providerOpts: { rings: 3, diagonals: true } },
  { slug: 'lasker-morris', name: 'Lasker Morris', providerOpts: { rings: 3, diagonals: false } },
  { slug: 'shax', name: 'Shax', providerOpts: { rings: 3, diagonals: false } },
].map(m => ({
  ...m,
  title: `${m.name} board`,
  provider: 'morris',
  tileSize: 40,
  showLabels: false,
  outputDir: join(RULES_ROOT, 'morris', 'diagrams', 'svg'),
}));

const XIANGQI_FEN = 'rneakaenr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNEAKAENR';
const JANGGI_FEN = 'rneakaenr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNEAKAENR';

const XIANGQI_BOARDS = [
  {
    slug: 'xiangqi-start',
    title: 'Xiangqi — starting position (Chinese)',
    provider: 'xiangqi',
    rows: 10, cols: 9, tileSize: 40, showLabels: false,
    position: { type: 'fen', fen: XIANGQI_FEN },
    pieceSet: { type: 'sprite', defs: XIANGQI_PIECES_TRAD },
    outputDir: join(RULES_ROOT, 'xiangqi', 'diagrams', 'svg'),
  },
  {
    slug: 'xiangqi-start-west',
    filename: 'xiangqi-start-board-west.svg',
    title: 'Xiangqi — starting position (Western)',
    provider: 'xiangqi',
    rows: 10, cols: 9, tileSize: 40, showLabels: false,
    position: { type: 'fen', fen: XIANGQI_FEN },
    pieceSet: { type: 'sprite', defs: XIANGQI_PIECES_WEST },
    outputDir: join(RULES_ROOT, 'xiangqi', 'diagrams', 'svg'),
  },
  {
    slug: 'janggi',
    title: 'Janggi — starting position (inner elephant setup)',
    provider: 'xiangqi',
    rows: 10, cols: 9, tileSize: 40, showLabels: false,
    providerOpts: { river: false },
    position: { type: 'fen', fen: JANGGI_FEN },
    pieceSet: { type: 'manifest', id: 'kadagaden-janggi-kakao' },
    outputDir: join(RULES_ROOT, 'xiangqi', 'diagrams', 'svg'),
  },
];

const SHOGI_BOARDS = [
  { slug: 'standard', name: 'Standard Shogi', rows: 9, cols: 9, fen: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL' },
  { slug: 'hasami', name: 'Hasami Shogi', rows: 9, cols: 9, fen: 'ppppppppp/9/9/9/9/9/9/9/PPPPPPPPP' },
  { slug: 'kyoto', name: 'Kyoto Shogi', rows: 5, cols: 5, fen: 'p+nks+l/5/5/5/+LSK+NP' },
  { slug: 'minishogi', name: 'Minishogi', rows: 5, cols: 5, fen: 'rbsgk/4p/5/P4/KGSBR' },
].map(v => ({
  slug: v.slug,
  title: `${v.name} — starting position`,
  provider: 'shogi',
  rows: v.rows,
  cols: v.cols,
  tileSize: 40,
  showLabels: false,
  position: { type: 'fen', fen: v.fen, opts: { promotedPrefix: '+' } },
  pieceSet: { type: 'sprite', defs: SHOGI_PIECES },
  outputDir: join(RULES_ROOT, 'shogi', 'diagrams', 'svg'),
}));

// --- Dungeon Chess (reads external data file) ---

function discoverDungeonBoards() {
  const dcMapsPath = join(ROOT, '..', 'dungeon-chess', 'data', 'maps.json');
  if (!existsSync(dcMapsPath)) return [];

  const dcData = JSON.parse(readFileSync(dcMapsPath, 'utf8'));
  const SLUG_MAP = { 'compact': 'compact-skirmish', 'two_player': 'two-player-dungeon', 'four_player': 'four-player-dungeon' };

  return dcData.maps.map(m => {
    const slug = SLUG_MAP[m.id] || m.id;
    return {
      slug,
      filename: `${slug}.svg`,
      title: `${m.name} (${m.rows}×${m.cols})`,
      provider: 'dungeon',
      tileSize: 19,
      showLabels: false,
      providerOpts: { terrain: resolveTerrainFromDCMap(m) },
      outputDir: join(RULES_ROOT, 'dungeon-chess', 'diagrams', 'svg'),
    };
  });
}

// --- Royal Ur ---

const UR_BOARDS = [{
  slug: 'royal-ur',
  title: 'Royal Game of Ur — board layout',
  provider: 'royal-ur',
  tileSize: 40,
  showLabels: false,
  outputDir: join(RULES_ROOT, 'royal-ur', 'diagrams', 'svg'),
}];

// === Generation pipeline ===

let generated = 0;
let failed = 0;

function generate(board) {
  const position = resolvePosition(board);
  const pieceDefs = resolvePieces(board);

  const opts = {
    boardStyle: board.provider,
    rows: board.rows,
    cols: board.cols,
    tileSize: board.tileSize || 40,
    title: board.title,
    showLabels: board.showLabels,
    position,
    pieceDefs,
    ...(board.providerOpts || {}),
  };

  const svg = renderBoardSVG(opts);
  const filename = board.filename || `${board.slug}-board.svg`;
  const outputPath = join(board.outputDir, filename);

  try {
    mkdirSync(board.outputDir, { recursive: true });
    writeFileSync(outputPath, svg);
    generated++;
  } catch (e) {
    console.error(`  FAIL: ${board.slug} — ${e.message}`);
    failed++;
  }
}

// --- Collect all boards ---

const chessBoards = discoverChessBoards();
const dungeonBoards = discoverDungeonBoards();

const ALL_BOARDS = [
  ...chessBoards,
  ...DRAUGHTS_BOARDS,
  ...GO_BOARDS,
  ...MORRIS_BOARDS,
  ...dungeonBoards,
  ...UR_BOARDS,
  ...XIANGQI_BOARDS,
  ...SHOGI_BOARDS,
];

// --- Run ---

console.log(`\nGenerating ${ALL_BOARDS.length} boards...\n`);

const groups = {};
for (const board of ALL_BOARDS) {
  const group = board.outputDir.split('/').slice(-3, -2)[0] || 'other';
  groups[group] = (groups[group] || 0) + 1;
}

for (const board of ALL_BOARDS) {
  generate(board);
}

console.log(`\n=== Generation Complete ===`);
console.log(`  Generated: ${generated}`);
console.log(`  Failed: ${failed}`);
for (const [group, count] of Object.entries(groups)) {
  console.log(`  ${group}: ${count}`);
}
console.log('');
