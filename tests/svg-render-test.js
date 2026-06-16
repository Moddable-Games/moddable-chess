import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { renderBoardSVG } from '../js/svg-renderer.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = __dirname + '/svg-output';
mkdirSync(OUT, { recursive: true });

const results = [];

function test(name, opts, checks) {
  try {
    const svg = renderBoardSVG(opts);
    writeFileSync(`${OUT}/${name}.svg`, svg);
    const failures = [];
    for (const [desc, fn] of Object.entries(checks)) {
      if (!fn(svg)) failures.push(desc);
    }
    if (failures.length === 0) {
      results.push({ name, status: 'PASS' });
    } else {
      results.push({ name, status: 'FAIL', failures });
    }
  } catch (e) {
    results.push({ name, status: 'ERROR', error: e.message });
  }
}

// --- Checkered boards ---

test('chess-standard-8x8', {
  boardStyle: 'checkered', rows: 8, cols: 8, tileSize: 56,
  title: 'Standard Chess — starting position',
  position: {
    a1: 'R', b1: 'N', c1: 'B', d1: 'Q', e1: 'K', f1: 'B', g1: 'N', h1: 'R',
    a2: 'P', b2: 'P', c2: 'P', d2: 'P', e2: 'P', f2: 'P', g2: 'P', h2: 'P',
    a7: 'p', b7: 'p', c7: 'p', d7: 'p', e7: 'p', f7: 'p', g7: 'p', h7: 'p',
    a8: 'r', b8: 'n', c8: 'b', d8: 'q', e8: 'k', f8: 'b', g8: 'n', h8: 'r',
  }
}, {
  'has title': s => s.includes('<title>'),
  'has viewBox': s => s.includes('viewBox'),
  'has 64 squares': s => (s.match(/<rect x="\d+" y="\d+" width="56" height="56"/g) || []).length === 64,
  'has light colour': s => s.includes('#f0d9b5'),
  'has dark colour': s => s.includes('#b58863'),
  'has 32 pieces': s => (s.match(/font-family="serif"/g) || []).length === 64,
  'has labels': s => s.includes('>a<') && s.includes('>8<'),
});

test('draughts-english-8x8', {
  boardStyle: 'checkered', rows: 8, cols: 8, tileSize: 40,
  title: 'English Draughts — starting position',
  position: Object.fromEntries([
    ...darkSquares(8, 8, 0, 3).map(sq => [sq, { type: 'man', color: 'black' }]),
    ...darkSquares(8, 8, 5, 8).map(sq => [sq, { type: 'man', color: 'white' }]),
  ])
}, {
  'has 12 black pieces': s => (s.match(/fill="#1c1c1c"/g) || []).length === 12,
  'has 12 white pieces': s => (s.match(/fill="#ffffff"/g) || []).length === 12,
  'has 64 squares': s => (s.match(/<rect x="\d+" y="\d+" width="40" height="40"/g) || []).length === 64,
});

test('draughts-lasca-7x7', {
  boardStyle: 'checkered', rows: 7, cols: 7, tileSize: 40,
  title: 'Lasca — starting position',
  position: Object.fromEntries([
    ...darkSquares(7, 7, 0, 3).map(sq => [sq, { type: 'man', color: 'black' }]),
    ...darkSquares(7, 7, 4, 7).map(sq => [sq, { type: 'man', color: 'white' }]),
  ])
}, {
  'has 49 squares': s => (s.match(/<rect x="\d+" y="\d+" width="40" height="40"/g) || []).length === 49,
  'has title': s => s.includes('Lasca'),
});

// --- Mono-grid ---

test('draughts-turkish-8x8', {
  boardStyle: 'mono-grid', rows: 8, cols: 8, tileSize: 40,
  title: 'Turkish Draughts — starting position',
  position: Object.fromEntries([
    ...allSquaresInRows(8, 8, 1, 3).map(sq => [sq, { type: 'man', color: 'black' }]),
    ...allSquaresInRows(8, 8, 5, 7).map(sq => [sq, { type: 'man', color: 'white' }]),
  ])
}, {
  'has mono background': s => s.includes('#d9b483'),
  'has grid lines': s => (s.match(/<line/g) || []).length === 18,
  'has 16 black pieces': s => (s.match(/fill="#1c1c1c"/g) || []).length === 16,
  'has 16 white pieces': s => (s.match(/fill="#ffffff"/g) || []).length === 16,
});

// --- Alquerque ---

test('alquerque-5x5', {
  boardStyle: 'alquerque', rows: 5, cols: 5, tileSize: 40,
  title: 'Alquerque — starting position',
}, {
  'has 25 intersection points': s => (s.match(/<circle cx/g) || []).length === 25,
  'has diagonal lines': s => (s.match(/<line/g) || []).length > 8,
});

// --- Go ---

test('go-9x9', {
  boardStyle: 'go', rows: 9, cols: 9, tileSize: 20,
  title: 'Go — 9×9 board (empty)',
}, {
  'has wood background': s => s.includes('#dcb35c'),
  'has inner board': s => s.includes('#d4a843'),
  'has 5 star points': s => (s.match(/<circle cx/g) || []).length === 5,
  'has 18 grid lines': s => (s.match(/<line/g) || []).length === 18,
  'has Go labels (skip I)': s => s.includes('>J<'),
  'no I label': s => !s.includes('>I<'),
});

test('go-19x19', {
  boardStyle: 'go', rows: 19, cols: 19, tileSize: 20,
  title: 'Go — 19×19 board (empty)',
}, {
  'has 9 star points': s => (s.match(/<circle cx/g) || []).length === 9,
  'has 38 grid lines': s => (s.match(/<line/g) || []).length === 38,
});

// --- Morris ---

test('morris-three', {
  boardStyle: 'morris', rings: 1, diagonals: true, boardSize: 320, showLabels: false,
  title: "Three Men's Morris board",
}, {
  'has 9 points': s => (s.match(/<circle/g) || []).length === 9,
  'has background': s => s.includes('#f5e6c8'),
  'has diagonals': s => (s.match(/<line/g) || []).length === 4,
});

test('morris-six', {
  boardStyle: 'morris', rings: 2, diagonals: false, boardSize: 320, showLabels: false,
  title: "Six Men's Morris board",
}, {
  'has 16 points': s => (s.match(/<circle/g) || []).length === 16,
  'has 2 rects (rings)': s => (s.match(/<rect x="\d+(\.\d+)?" y="\d+(\.\d+)?" width="\d+(\.\d+)?" height="\d+(\.\d+)?"/g) || []).length >= 3,
});

test('morris-nine', {
  boardStyle: 'morris', rings: 3, diagonals: false, boardSize: 320, showLabels: false,
  title: "Nine Men's Morris board",
}, {
  'has 24 points': s => (s.match(/<circle/g) || []).length === 24,
});

test('morris-twelve', {
  boardStyle: 'morris', rings: 3, diagonals: true, boardSize: 320, showLabels: false,
  title: "Twelve Men's Morris board",
}, {
  'has 24 points': s => (s.match(/<circle/g) || []).length === 24,
  'has diagonal lines': s => (s.match(/<line/g) || []).length >= 8,
});

// --- Dungeon ---

test('dungeon-two-player', {
  boardStyle: 'dungeon', tileSize: 19, showLabels: false,
  title: 'Two-Player Dungeon (20×8)',
  terrain: buildTwoPlayerDungeon(),
}, {
  'has floor cells': s => s.includes('#d4c4a8'),
  'has water cells': s => s.includes('#4a90c8'),
  'has spawn-a': s => s.includes('#f0d080'),
  'has spawn-b': s => s.includes('#f0b0b0'),
  'has legend': s => s.includes('Floor') && s.includes('Water') && s.includes('P1 Deploy'),
  'has void background': s => s.includes('#1a1a2e'),
});

// --- Royal Ur ---

test('royal-ur', {
  boardStyle: 'royal-ur', tileSize: 40, showLabels: false,
  title: 'Royal Game of Ur — board layout',
}, {
  'has rosettes': s => s.includes('#8b3a3a'),
  'has cross border': s => s.includes('<path'),
  'has detail lines': s => s.includes('opacity="0.6"'),
  'has cell fill': s => s.includes('#d4b896'),
});

// --- Report ---

console.log('\n=== SVG Render Test Results ===\n');
let pass = 0, fail = 0;
for (const r of results) {
  if (r.status === 'PASS') {
    console.log(`  ✓ ${r.name}`);
    pass++;
  } else if (r.status === 'FAIL') {
    console.log(`  ✗ ${r.name}: ${r.failures.join(', ')}`);
    fail++;
  } else {
    console.log(`  ! ${r.name}: ${r.error}`);
    fail++;
  }
}
console.log(`\n  ${pass} passed, ${fail} failed, ${results.length} total\n`);
console.log(`  Output written to: ${OUT}/`);
process.exit(fail > 0 ? 1 : 0);

// --- Helpers ---

function darkSquares(rows, cols, startRow, endRow) {
  const sqs = [];
  for (let r = startRow; r < endRow; r++) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 !== 0) continue;
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      sqs.push(`${file}${rank}`);
    }
  }
  return sqs;
}

function allSquaresInRows(rows, cols, startRow, endRow) {
  const sqs = [];
  for (let r = startRow; r < endRow; r++) {
    for (let c = 0; c < cols; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      sqs.push(`${file}${rank}`);
    }
  }
  return sqs;
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
