#!/usr/bin/env node

/**
 * Downloads and filters the Lichess CC0 puzzle database.
 * Source: https://database.lichess.org/#puzzles
 * License: CC0 (public domain)
 *
 * Usage: node scripts/download-lichess-puzzles.js [--skip-download]
 *
 * Outputs: data/puzzles-standard.json
 */

import { createReadStream, createWriteStream, existsSync } from 'fs';
import { writeFile } from 'fs/promises';
import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const DATA_DIR = join(ROOT, 'data');
const DOWNLOAD_DIR = join(ROOT, '.puzzle-cache');

const CSV_URL = 'https://database.lichess.org/lichess_db_puzzle.csv.zst';
const CSV_ZST = join(DOWNLOAD_DIR, 'lichess_db_puzzle.csv.zst');
const CSV_FILE = join(DOWNLOAD_DIR, 'lichess_db_puzzle.csv');
const OUTPUT = join(DATA_DIR, 'puzzles-standard.json');

const FILTERS = {
  themes: ['mateIn1', 'mateIn2'],
  ratingBands: [
    { label: 'accessible', min: 600, max: 1600 },
    { label: 'challenging', min: 1600, max: 2200 }
  ],
  minPopularity: 70,
  minPlays: 500,
  targetPerBand: {
    mateIn1: { accessible: 200, challenging: 150 },
    mateIn2: { accessible: 150, challenging: 100 }
  }
};

const HISTORICAL_COMPOSITIONS = [
  {
    id: 'hist_scholars_mate',
    fen: 'r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4',
    solution: ['Qxf7#'],
    rating: 400,
    themes: ['mateIn1', 'sacrifice', 'classical'],
    source: 'historical',
    historical: true,
    title: "Scholar's Mate",
    year: null
  },
  {
    id: 'hist_philidor_smothered',
    fen: '6rk/5Npp/8/8/8/8/8/4K3 w - - 0 1',
    solution: ['Nh6', 'Kh8', 'Qg8+', 'Rxg8', 'Nf7#'],
    rating: 1400,
    themes: ['mateIn3', 'smotheredMate', 'sacrifice', 'classical'],
    source: 'historical',
    historical: true,
    title: "Philidor's Legacy (Smothered Mate)",
    year: 1749
  },
  {
    id: 'hist_saavedra',
    fen: '8/8/1KP5/3r4/8/8/8/k7 w - - 0 1',
    solution: ['c7', 'Rd6+', 'Kb5', 'Rd5+', 'Kb4', 'Rd4+', 'Kb3', 'Rd3+', 'Kc2', 'Rd4', 'c8=R'],
    rating: 1800,
    themes: ['endgame', 'underpromotion', 'classical'],
    source: 'historical',
    historical: true,
    title: 'Saavedra Position',
    year: 1895
  },
  {
    id: 'hist_reti_study',
    fen: '7K/8/k1P5/7p/8/8/8/8 w - - 0 1',
    solution: ['Kg7', 'h4', 'Kf6', 'h3', 'Ke7', 'h2', 'c7', 'h1=Q', 'c8=Q'],
    rating: 1600,
    themes: ['endgame', 'pawnEndgame', 'classical'],
    source: 'historical',
    historical: true,
    title: "Réti's Endgame Study",
    year: 1921
  },
  {
    id: 'hist_lucena',
    fen: '1K1k4/1P6/8/8/8/8/1r6/5R2 w - - 0 1',
    solution: ['Rd1+', 'Ke7', 'Rd4', 'Rb1', 'Kc7', 'Rc1+', 'Kb6', 'Rb1+', 'Kc6', 'Rc1+', 'Kb5', 'Rb1+', 'Rb4'],
    rating: 1500,
    themes: ['endgame', 'rookEndgame', 'classical'],
    source: 'historical',
    historical: true,
    title: 'Lucena Position (Bridge Technique)',
    year: 1497
  },
  {
    id: 'hist_opera_game_finish',
    fen: '1n1Qkb1r/p4ppp/5n2/1B2p1B1/4P3/8/PPP2PPP/R3K2R b KQk - 0 1',
    solution: ['Qd8#'],
    rating: 800,
    themes: ['mateIn1', 'backRankMate', 'classical'],
    source: 'historical',
    historical: true,
    title: "Morphy's Opera Game Finish (1858)",
    year: 1858
  }
];

function parseCsvLine(line) {
  const fields = line.split(',');
  if (fields.length < 10) return null;
  return {
    id: fields[0],
    fen: fields[1],
    moves: fields[2],
    rating: parseInt(fields[3], 10),
    ratingDeviation: parseInt(fields[4], 10),
    popularity: parseInt(fields[5], 10),
    nbPlays: parseInt(fields[6], 10),
    themes: fields[7].split(' ').filter(Boolean),
    gameUrl: fields[8],
    openingTags: fields[9]
  };
}

function classifyPuzzle(puzzle) {
  for (const theme of FILTERS.themes) {
    if (!puzzle.themes.includes(theme)) continue;
    for (const band of FILTERS.ratingBands) {
      if (puzzle.rating >= band.min && puzzle.rating < band.max) {
        return { theme, band: band.label };
      }
    }
  }
  return null;
}

function formatPuzzle(raw) {
  const moves = raw.moves.split(' ');
  // Lichess format: first move is opponent's last move (setup), rest is solution
  const setupMove = moves[0];
  const solution = moves.slice(1);

  return {
    id: `lichess_${raw.id}`,
    fen: raw.fen,
    setupMove,
    solution,
    rating: raw.rating,
    themes: raw.themes,
    source: 'lichess-cc0',
    historical: false
  };
}

async function downloadFile() {
  if (!existsSync(DOWNLOAD_DIR)) {
    execSync(`mkdir -p "${DOWNLOAD_DIR}"`);
  }

  if (existsSync(CSV_FILE)) {
    console.log('CSV already decompressed, skipping download.');
    return;
  }

  if (existsSync(CSV_ZST)) {
    console.log('Compressed file exists, decompressing...');
  } else {
    console.log(`Downloading puzzle database from Lichess (~300MB)...`);
    console.log(`URL: ${CSV_URL}`);
    execSync(`curl -L -o "${CSV_ZST}" "${CSV_URL}"`, { stdio: 'inherit' });
  }

  console.log('Decompressing with zstd...');
  execSync(`zstd -d "${CSV_ZST}" -o "${CSV_FILE}"`, { stdio: 'inherit' });
  console.log('Decompression complete.');
}

async function filterPuzzles() {
  console.log('\nFiltering puzzles...');

  const buckets = {};
  for (const theme of FILTERS.themes) {
    for (const band of FILTERS.ratingBands) {
      buckets[`${theme}_${band.label}`] = [];
    }
  }

  const targets = {};
  for (const theme of FILTERS.themes) {
    for (const band of FILTERS.ratingBands) {
      targets[`${theme}_${band.label}`] = FILTERS.targetPerBand[theme][band.label];
    }
  }

  const rl = createInterface({
    input: createReadStream(CSV_FILE),
    crlfDelay: Infinity
  });

  let lineCount = 0;
  let skippedHeader = false;
  let allFull = false;

  for await (const line of rl) {
    if (!skippedHeader) { skippedHeader = true; continue; }
    lineCount++;

    if (lineCount % 500000 === 0) {
      const counts = Object.entries(buckets).map(([k, v]) => `${k}: ${v.length}/${targets[k]}`).join(', ');
      console.log(`  Processed ${(lineCount / 1000000).toFixed(1)}M lines... [${counts}]`);
    }

    if (allFull) break;

    const puzzle = parseCsvLine(line);
    if (!puzzle) continue;

    if (puzzle.popularity < FILTERS.minPopularity) continue;
    if (puzzle.nbPlays < FILTERS.minPlays) continue;
    if (puzzle.ratingDeviation > 100) continue;

    const classification = classifyPuzzle(puzzle);
    if (!classification) continue;

    const key = `${classification.theme}_${classification.band}`;
    if (buckets[key].length >= targets[key]) {
      allFull = Object.entries(buckets).every(([k, v]) => v.length >= targets[k]);
      continue;
    }

    buckets[key].push(formatPuzzle(puzzle));
  }

  const lichessPuzzles = Object.values(buckets).flat();
  console.log(`\nFiltered ${lichessPuzzles.length} puzzles from ${lineCount.toLocaleString()} lines.`);

  for (const [key, arr] of Object.entries(buckets)) {
    console.log(`  ${key}: ${arr.length}/${targets[key]}`);
  }

  return lichessPuzzles;
}

async function writePuzzleFile(puzzles) {
  const allPuzzles = [...HISTORICAL_COMPOSITIONS, ...puzzles];

  allPuzzles.sort((a, b) => a.rating - b.rating);

  const output = {
    meta: {
      generated: new Date().toISOString().split('T')[0],
      sources: ['lichess-cc0', 'historical'],
      license: 'CC0 (Lichess puzzles) + Public Domain (historical compositions)',
      count: allPuzzles.length
    },
    puzzles: allPuzzles
  };

  await writeFile(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\nWritten ${allPuzzles.length} puzzles to ${OUTPUT}`);
  console.log(`  Historical: ${HISTORICAL_COMPOSITIONS.length}`);
  console.log(`  Lichess CC0: ${puzzles.length}`);
}

const skipDownload = process.argv.includes('--skip-download');

if (!skipDownload) {
  await downloadFile();
}

if (!existsSync(CSV_FILE)) {
  console.error(`CSV file not found at ${CSV_FILE}. Run without --skip-download first.`);
  process.exit(1);
}

const puzzles = await filterPuzzles();
await writePuzzleFile(puzzles);

console.log('\nDone! Standard puzzle pool ready.');
