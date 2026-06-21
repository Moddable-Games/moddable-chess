#!/usr/bin/env node

/**
 * Exports the puzzle pool to moddable-website for the MCP tool.
 * Produces a keyed format: { "variant:type": [puzzles...] }
 * matching what the MCP chess_generate_puzzle tool expects.
 *
 * Usage: node scripts/export-puzzles.js [--target <path>]
 *
 * Default target: ../moddable-website/workers/mcp/puzzle-pool.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

const args = process.argv.slice(2);
let targetPath = join(ROOT, '..', 'moddable-website', 'workers', 'mcp', 'puzzle-pool.json');
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--target' && args[i + 1]) targetPath = args[++i];
}

const standardPath = join(ROOT, 'data', 'puzzles-standard.json');
const variantPath = join(ROOT, 'data', 'puzzles-variants.json');

const keyed = {};

if (existsSync(standardPath)) {
  const standard = JSON.parse(readFileSync(standardPath, 'utf-8'));
  console.log(`Standard puzzles: ${standard.puzzles.length}`);

  for (const p of standard.puzzles) {
    const type = classifyStandardPuzzle(p);
    const key = `standard:${type}`;
    if (!keyed[key]) keyed[key] = [];
    keyed[key].push({
      id: p.id,
      fen: p.fen,
      turn: p.fen.split(' ')[1] === 'w' ? 'white' : 'black',
      solution: p.solution || p.setupMove ? [p.setupMove, ...(p.solution || [])].filter(Boolean) : [],
      rating: p.rating,
      themes: p.themes,
      source: p.source
    });
  }
} else {
  console.log('No standard puzzles found (run download-lichess-puzzles.js first)');
}

const PUZZLE_EXCLUDED_VARIANTS = new Set(['fogOfWar', 'darkChess', 'diceChess', 'einsteinChess']);

if (existsSync(variantPath)) {
  const variants = JSON.parse(readFileSync(variantPath, 'utf-8'));
  const filtered = variants.puzzles.filter(p => !PUZZLE_EXCLUDED_VARIANTS.has(p.variant));
  console.log(`Variant puzzles: ${filtered.length} (${variants.puzzles.length - filtered.length} excluded)`);

  for (const p of filtered) {
    const type = p.puzzleType || 'tactic';
    const key = `${p.variant}:${slugify(type)}`;
    if (!keyed[key]) keyed[key] = [];
    keyed[key].push({
      id: p.id,
      fen: p.fen,
      turn: p.fen.split(' ')[1] === 'w' ? 'white' : 'black',
      solution: p.solution,
      rating: p.rating,
      depth: p.depth,
      checkCount: p.checkCount || undefined
    });
  }
} else {
  console.log('No variant puzzles found (run generate-variant-puzzles.js first)');
}

function classifyStandardPuzzle(p) {
  const themes = p.themes || [];
  if (themes.includes('mateIn1')) return 'mate-in-1';
  if (themes.includes('mateIn2')) return 'mate-in-2';
  if (themes.includes('mateIn3')) return 'mate-in-3';
  if (p.historical) return 'classical';
  return 'tactic';
}

function slugify(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const totalPuzzles = Object.values(keyed).reduce((sum, arr) => sum + arr.length, 0);

if (totalPuzzles === 0) {
  console.error('No puzzles to export.');
  process.exit(1);
}

if (!existsSync(dirname(targetPath))) {
  console.error(`Target directory does not exist: ${dirname(targetPath)}`);
  console.log(`Writing to local data/ instead.`);
  targetPath = join(ROOT, 'data', 'puzzle-pool.json');
}

writeFileSync(targetPath, JSON.stringify(keyed, null, 2));

console.log(`\nExported ${totalPuzzles} puzzles to ${targetPath}`);
console.log('Keys:');
for (const [key, arr] of Object.entries(keyed).sort()) {
  console.log(`  ${key}: ${arr.length} puzzles`);
}
