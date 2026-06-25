import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { renderBoardSVG } from '../js/svg-renderer.js';

const RULES_ROOT = '../moddable-rules/games';
const CHESS_DIAGRAMS = `${RULES_ROOT}/moddable-chess/diagrams/svg`;
const DRAUGHTS_DIAGRAMS = `${RULES_ROOT}/draughts/diagrams/svg`;
const GO_DIAGRAMS = `${RULES_ROOT}/go/diagrams/svg`;
const MORRIS_DIAGRAMS = `${RULES_ROOT}/morris/diagrams/svg`;
const DUNGEON_DIAGRAMS = `${RULES_ROOT}/dungeon-chess/diagrams/svg`;
const UR_DIAGRAMS = `${RULES_ROOT}/royal-ur/diagrams/svg`;
const XIANGQI_DIAGRAMS = `${RULES_ROOT}/xiangqi/diagrams/svg`;
const SHOGI_DIAGRAMS = `${RULES_ROOT}/shogi/diagrams/svg`;

let generated = 0;
let failed = 0;
const gaps = [];

function write(path, svg, name) {
  try {
    const dir = path.substring(0, path.lastIndexOf('/'));
    mkdirSync(dir, { recursive: true });
    writeFileSync(path, svg);
    generated++;
  } catch (e) {
    console.error(`  FAIL: ${name} — ${e.message}`);
    failed++;
    gaps.push({ name, error: e.message });
  }
}

// --- Chess boards (70 variants) ---

const STANDARD_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR';

const CHESS_VARIANTS = await loadChessVariants();

const MANUAL_CHESS_VARIANTS = [
  { slug: 'chaturanga', name: 'Chaturanga', fen: 'rnefkenr/pppppppp/8/8/8/8/PPPPPPPP/RNEFKENR', rows: 8, cols: 8 },
  { slug: 'shatranj', name: 'Shatranj', fen: 'rnekfenr/pppppppp/8/8/8/8/PPPPPPPP/RNEKFENR', rows: 8, cols: 8 },
  { slug: 'diana', name: 'Diana Chess', fen: 'rbbkr1/pppppp/6/6/PPPPPP/RBBKR1', rows: 6, cols: 6 },
  { slug: 'petty', name: 'Petty Chess', fen: 'rnbqk/ppppp/5/5/PPPPP/RNBQK', rows: 6, cols: 5 },
];

for (const manual of MANUAL_CHESS_VARIANTS) {
  const existing = CHESS_VARIANTS.findIndex(v => v.slug === manual.slug);
  if (existing >= 0) CHESS_VARIANTS[existing] = { ...CHESS_VARIANTS[existing], ...manual };
  else CHESS_VARIANTS.push(manual);
}

console.log(`\nGenerating chess boards (${CHESS_VARIANTS.length} variants)...`);
for (const v of CHESS_VARIANTS) {
  const pos = fenToPosition(v.fen || STANDARD_FEN, v.rows || 8, v.cols || 8);
  const svg = renderBoardSVG({
    boardStyle: 'checkered',
    rows: v.rows || 8,
    cols: v.cols || 8,
    tileSize: 40,
    title: `${v.name} — starting position`,
    position: pos,
  });
  write(`${CHESS_DIAGRAMS}/${v.slug}-board.svg`, svg, v.slug);
}

// --- Draughts boards ---

console.log('\nGenerating draughts boards...');

const DRAUGHTS_CONFIGS = [
  { key: 'english', name: 'English Draughts', rows: 8, cols: 8, style: 'checkered', pieceRows: [0,1,2,5,6,7] },
  { key: 'international', name: 'International Draughts', rows: 10, cols: 10, style: 'checkered', pieceRows: [0,1,2,3,6,7,8,9] },
  { key: 'canadian', name: 'Canadian Draughts', rows: 12, cols: 12, style: 'checkered', pieceRows: [0,1,2,3,4,7,8,9,10,11] },
  { key: 'frisian', name: 'Frisian Draughts', rows: 10, cols: 10, style: 'checkered', pieceRows: [0,1,2,3,6,7,8,9] },
  { key: 'lasca', name: 'Lasca', rows: 7, cols: 7, style: 'checkered', pieceRows: [0,1,2,4,5,6] },
  { key: 'turkish', name: 'Turkish Draughts', rows: 8, cols: 8, style: 'mono-grid', pieceRows: [1,2,5,6] },
  { key: 'thai', name: 'Thai Draughts', rows: 8, cols: 8, style: 'checkered', pieceRows: [0,1,6,7] },
  { key: 'alquerque', name: 'Alquerque', rows: 5, cols: 5, style: 'alquerque', pieceRows: null },
];

for (const d of DRAUGHTS_CONFIGS) {
  let position = {};
  if (d.style === 'alquerque') {
    position = buildAlquerquePosition();
  } else if (d.style === 'mono-grid') {
    position = buildTurkishPosition(d);
  } else {
    position = buildDraughtsPosition(d);
  }

  const svg = renderBoardSVG({
    boardStyle: d.style,
    rows: d.rows,
    cols: d.cols,
    tileSize: 40,
    title: `${d.name} — starting position`,
    position,
  });
  write(`${DRAUGHTS_DIAGRAMS}/${d.key}-board.svg`, svg, d.key);
}

// --- Go boards ---

console.log('\nGenerating Go boards...');

for (const size of [9, 13, 19]) {
  const svg = renderBoardSVG({
    boardStyle: 'go',
    rows: size,
    cols: size,
    tileSize: 20,
    title: `Go — ${size}×${size} board (empty)`,
  });
  write(`${GO_DIAGRAMS}/go-${size}x${size}-board.svg`, svg, `go-${size}x${size}`);
}

// --- Morris boards ---

console.log('\nGenerating Morris boards...');

const MORRIS_CONFIGS = [
  { key: 'three-mens-morris', name: "Three Men's Morris", rings: 1, diagonals: true },
  { key: 'six-mens-morris', name: "Six Men's Morris", rings: 2, diagonals: false },
  { key: 'nine-mens-morris', name: "Nine Men's Morris", rings: 3, diagonals: false },
  { key: 'twelve-mens-morris', name: "Twelve Men's Morris", rings: 3, diagonals: true },
  { key: 'morabaraba', name: 'Morabaraba', rings: 3, diagonals: true },
  { key: 'lasker-morris', name: 'Lasker Morris', rings: 3, diagonals: false },
  { key: 'shax', name: 'Shax', rings: 3, diagonals: false },
];

for (const m of MORRIS_CONFIGS) {
  const svg = renderBoardSVG({
    boardStyle: 'morris',
    rings: m.rings,
    diagonals: m.diagonals,
    boardSize: 320,
    showLabels: false,
    title: `${m.name} board`,
  });
  write(`${MORRIS_DIAGRAMS}/${m.key}-board.svg`, svg, m.key);
}

// --- Dungeon Chess boards ---

console.log('\nGenerating Dungeon Chess boards...');

const dcMapsPath = '../dungeon-chess/data/maps.json';
if (existsSync(dcMapsPath)) {
  const dcData = JSON.parse(readFileSync(dcMapsPath, 'utf8'));
  const DC_SLUG_MAP = {
    'compact': 'compact-skirmish',
    'two_player': 'two-player-dungeon',
    'four_player': 'four-player-dungeon',
  };

  for (const m of dcData.maps) {
    const slug = DC_SLUG_MAP[m.id] || m.id;
    const terrain = convertDcGrid(m);
    const svg = renderBoardSVG({
      boardStyle: 'dungeon',
      tileSize: 19,
      showLabels: false,
      title: `${m.name} (${m.rows}×${m.cols})`,
      terrain,
    });
    write(`${DUNGEON_DIAGRAMS}/${slug}.svg`, svg, slug);
  }
} else {
  console.log('  Warning: dungeon-chess/data/maps.json not found, skipping');
}

function convertDcGrid(map) {
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

// --- Royal Ur ---

console.log('\nGenerating Royal Ur board...');

const urSvg = renderBoardSVG({
  boardStyle: 'royal-ur',
  tileSize: 40,
  showLabels: false,
  title: 'Royal Game of Ur — board layout',
});
write(`${UR_DIAGRAMS}/royal-ur-board.svg`, urSvg, 'royal-ur');

// --- Xiangqi ---

console.log('\nGenerating Xiangqi boards...');

import { XIANGQI_PIECES_TRAD } from '../js/xiangqi-pieces.js';

const XIANGQI_START_FEN = 'rneakaenr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNEAKAENR';

function xiangqiFenToPos(fen) {
  const pos = {};
  const ranks = fen.split('/');
  for (let r = 0; r < ranks.length; r++) {
    let c = 0;
    for (const ch of ranks[r]) {
      if (/\d/.test(ch)) { c += parseInt(ch, 10); continue; }
      const file = String.fromCharCode(97 + c);
      const rank = ranks.length - r;
      pos[`${file}${rank}`] = ch;
      c++;
    }
  }
  return pos;
}

const xiangqiSvg = renderBoardSVG({
  boardStyle: 'xiangqi',
  rows: 10,
  cols: 9,
  tileSize: 40,
  showLabels: false,
  position: xiangqiFenToPos(XIANGQI_START_FEN),
  pieceDefs: XIANGQI_PIECES_TRAD,
  title: 'Xiangqi — starting position (Chinese)',
});
write(`${XIANGQI_DIAGRAMS}/xiangqi-start-board.svg`, xiangqiSvg, 'xiangqi-start');

import { XIANGQI_PIECES_WEST } from '../js/xiangqi-pieces.js';

const xiangqiWestSvg = renderBoardSVG({
  boardStyle: 'xiangqi',
  rows: 10,
  cols: 9,
  tileSize: 40,
  showLabels: false,
  position: xiangqiFenToPos(XIANGQI_START_FEN),
  pieceDefs: XIANGQI_PIECES_WEST,
  title: 'Xiangqi — starting position (Western)',
});
write(`${XIANGQI_DIAGRAMS}/xiangqi-start-board-west.svg`, xiangqiWestSvg, 'xiangqi-start-west');

// --- Shogi ---

console.log('\nGenerating Shogi boards...');

import { SHOGI_PIECES } from '../js/shogi-pieces.js';

const SHOGI_VARIANTS = [
  { key: 'standard', name: 'Standard Shogi', rows: 9, cols: 9, fen: 'lnsgkgsnl/1r5b1/ppppppppp/9/9/9/PPPPPPPPP/1B5R1/LNSGKGSNL' },
  { key: 'hasami', name: 'Hasami Shogi', rows: 9, cols: 9, fen: 'ppppppppp/9/9/9/9/9/9/9/PPPPPPPPP' },
  { key: 'kyoto', name: 'Kyoto Shogi', rows: 5, cols: 5, fen: 'p+nks+l/5/5/5/+LSK+NP' },
  { key: 'minishogi', name: 'Minishogi', rows: 5, cols: 5, fen: 'rbsgk/4p/5/P4/KGSBR' },
];

function shogiFenToPos(fen, rows, cols) {
  const pos = {};
  const ranks = fen.split('/');
  for (let r = 0; r < ranks.length; r++) {
    let c = 0;
    let promoted = false;
    for (const ch of ranks[r]) {
      if (ch === '+') { promoted = true; continue; }
      if (/\d/.test(ch)) { c += parseInt(ch, 10); promoted = false; continue; }
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      pos[`${file}${rank}`] = promoted ? `+${ch}` : ch;
      c++;
      promoted = false;
    }
  }
  return pos;
}

for (const v of SHOGI_VARIANTS) {
  const pos = shogiFenToPos(v.fen, v.rows, v.cols);
  const svg = renderBoardSVG({
    boardStyle: 'shogi',
    rows: v.rows,
    cols: v.cols,
    tileSize: 40,
    showLabels: false,
    position: pos,
    pieceDefs: SHOGI_PIECES,
    title: `${v.name} — starting position`,
  });
  write(`${SHOGI_DIAGRAMS}/${v.key}-board.svg`, svg, `shogi-${v.key}`);
}

// --- Report ---

console.log(`\n=== Generation Complete ===`);
console.log(`  Generated: ${generated}`);
console.log(`  Failed: ${failed}`);
if (gaps.length > 0) {
  console.log(`\n  Gaps detected:`);
  for (const g of gaps) console.log(`    - ${g.name}: ${g.error}`);
}
console.log('');

// --- Helper functions ---

async function loadChessVariants() {
  const { readFileSync, readdirSync, existsSync } = await import('fs');
  const files = readdirSync('./js/variants').filter(f => f.endsWith('.js') && f !== 'index.js');
  const rulesDir = RULES_ROOT + '/moddable-chess/content/variants';
  const variants = [];

  for (const file of files) {
    const content = readFileSync('./js/variants/' + file, 'utf8');
    const keyMatch = content.match(/registerVariant\(['"]([^'"]+)/);
    if (!keyMatch) continue;
    const key = keyMatch[1];

    const fenMatch = content.match(/fen:\s*['"]([^'"]+)/);
    const rowsMatch = content.match(/rows:\s*(\d+)/);
    const colsMatch = content.match(/cols:\s*(\d+)/);
    const labelMatch = content.match(/label:\s*['"]([^'"]+)/);
    const titleMatch = content.match(/title:\s*['"]([^'"]+)/);

    const SLUG_MAP = {
      'chess960': 'fischer-random',
      'teleport-chess': 'teleportation',
    };

    const fileStem = file.replace('.js', '');
    let slug = SLUG_MAP[fileStem] || fileStem;
    if (!existsSync(`${rulesDir}/${slug}.md`)) {
      const stripped = slug.replace(/-chess$/, '');
      if (existsSync(`${rulesDir}/${stripped}.md`)) {
        slug = stripped;
      }
    }

    variants.push({
      key,
      slug,
      name: titleMatch ? titleMatch[1] : (labelMatch ? labelMatch[1] : key),
      fen: fenMatch ? fenMatch[1] : null,
      rows: rowsMatch ? parseInt(rowsMatch[1]) : 8,
      cols: colsMatch ? parseInt(colsMatch[1]) : 8,
    });
  }

  console.log(`  Loaded ${variants.length} variants from plugin files`);
  return variants;
}

function toKebab(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
}

function parseBoardSize(str) {
  if (!str) return { rows: 8, cols: 8 };
  const match = str.match(/(\d+)×(\d+)/);
  if (match) return { rows: parseInt(match[1]), cols: parseInt(match[2]) };
  return { rows: 8, cols: 8 };
}

function fenToPosition(fen, rows, cols) {
  const position = {};
  const ranks = fen.split(' ')[0].split('/');
  for (let r = 0; r < ranks.length && r < rows; r++) {
    let c = 0;
    for (const ch of ranks[r]) {
      if (c >= cols) break;
      const num = parseInt(ch);
      if (!isNaN(num)) {
        c += num;
      } else {
        const file = String.fromCharCode(97 + c);
        const rank = rows - r;
        position[`${file}${rank}`] = ch;
        c++;
      }
    }
  }
  return position;
}

function buildDraughtsPosition(config) {
  const { rows, cols, pieceRows } = config;
  const position = {};
  const midRow = Math.floor(rows / 2);

  for (const r of pieceRows) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 !== 0) continue;
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      const color = r < midRow ? 'black' : 'white';
      position[`${file}${rank}`] = { type: 'man', color };
    }
  }
  return position;
}

function buildTurkishPosition(config) {
  const { rows, cols, pieceRows } = config;
  const position = {};
  const midRow = Math.floor(rows / 2);

  for (const r of pieceRows) {
    for (let c = 0; c < cols; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      const color = r < midRow ? 'black' : 'white';
      position[`${file}${rank}`] = { type: 'man', color };
    }
  }
  return position;
}

function buildAlquerquePosition() {
  const position = {};
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < 5; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = 5 - r;
      position[`${file}${rank}`] = { type: 'man', color: 'black' };
    }
  }
  position['d3'] = { type: 'man', color: 'black' };
  position['e3'] = { type: 'man', color: 'black' };
  for (let r = 3; r < 5; r++) {
    for (let c = 0; c < 5; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = 5 - r;
      position[`${file}${rank}`] = { type: 'man', color: 'white' };
    }
  }
  position['a3'] = { type: 'man', color: 'white' };
  position['b3'] = { type: 'man', color: 'white' };
  return position;
}

