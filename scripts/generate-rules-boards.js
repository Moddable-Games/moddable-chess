import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { renderBoardSVG } from '../js/svg-renderer.js';

const RULES_ROOT = '../moddable-rules/games';
const CHESS_DIAGRAMS = `${RULES_ROOT}/moddable-chess/diagrams/svg`;
const DRAUGHTS_DIAGRAMS = `${RULES_ROOT}/draughts/diagrams/svg`;
const GO_DIAGRAMS = `${RULES_ROOT}/go/diagrams/svg`;
const MORRIS_DIAGRAMS = `${RULES_ROOT}/morris/diagrams/svg`;
const DUNGEON_DIAGRAMS = `${RULES_ROOT}/dungeon-chess/diagrams/svg`;
const UR_DIAGRAMS = `${RULES_ROOT}/royal-ur/diagrams/svg`;

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

const DUNGEON_CONFIGS = [
  { key: 'two-player-dungeon', name: 'Two-Player Dungeon (20×8)', terrain: buildTwoPlayerDungeon() },
  { key: 'compact-skirmish', name: 'Compact Skirmish (12×8)', terrain: buildCompactSkirmish() },
  { key: 'four-player-dungeon', name: 'Four-Player Dungeon (16×16)', terrain: buildFourPlayerDungeon() },
];

for (const d of DUNGEON_CONFIGS) {
  const svg = renderBoardSVG({
    boardStyle: 'dungeon',
    tileSize: 19,
    showLabels: false,
    title: d.name,
    terrain: d.terrain,
  });
  write(`${DUNGEON_DIAGRAMS}/${d.key}.svg`, svg, d.key);
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

function buildTwoPlayerDungeon() {
  const terrain = [];
  for (let r = 0; r < 20; r++) {
    const row = [];
    for (let c = 0; c < 8; c++) {
      if (r < 2) row.push('spawn-b');
      else if (r >= 18) row.push('spawn-a');
      else if (r === 2 || r === 17) row.push('floor');
      else if ((r >= 3 && r <= 5) && (c < 3 || c > 4)) row.push(null);
      else if ((r >= 14 && r <= 16) && (c < 3 || c > 4)) row.push(null);
      else if (r >= 8 && r <= 11 && c >= 2 && c <= 5) row.push('water');
      else row.push('floor');
    }
    terrain.push(row);
  }
  return terrain;
}

function buildCompactSkirmish() {
  const terrain = [];
  for (let r = 0; r < 12; r++) {
    const row = [];
    for (let c = 0; c < 8; c++) {
      if (r < 2) row.push('spawn-b');
      else if (r >= 10) row.push('spawn-a');
      else if (r >= 5 && r <= 6 && c >= 3 && c <= 4) row.push('water');
      else row.push('floor');
    }
    terrain.push(row);
  }
  return terrain;
}

function buildFourPlayerDungeon() {
  const terrain = [];
  for (let r = 0; r < 16; r++) {
    const row = [];
    for (let c = 0; c < 16; c++) {
      if (r < 2 && c >= 5 && c <= 10) row.push('spawn-b');
      else if (r >= 14 && c >= 5 && c <= 10) row.push('spawn-a');
      else if (c < 2 && r >= 5 && r <= 10) row.push('spawn-b');
      else if (c >= 14 && r >= 5 && r <= 10) row.push('spawn-a');
      else if (r >= 6 && r <= 9 && c >= 6 && c <= 9) row.push('water');
      else if ((r < 2 || r >= 14) && (c < 5 || c > 10)) row.push(null);
      else if ((c < 2 || c >= 14) && (r < 5 || r > 10)) row.push(null);
      else row.push('floor');
    }
    terrain.push(row);
  }
  return terrain;
}
