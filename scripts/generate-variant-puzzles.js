#!/usr/bin/env node

/**
 * Generates variant-specific puzzles for ALL registered variants by playing
 * random games and finding positions with exactly one forced win in 1 move.
 *
 * Usage: node --experimental-vm-modules scripts/generate-variant-puzzles.js [options]
 *
 * Options:
 *   --variant <key>    Generate for a single variant
 *   --games <n>        Games to play per variant (default: 500)
 *   --target <n>       Target puzzles per variant (default: 15)
 *   --max-moves <n>    Max moves per game (default: 150)
 *   --verbose          Show puzzle-by-puzzle progress
 *   --append           Keep existing puzzles for variants not re-generated
 *
 * Outputs: data/puzzles-variants.json
 */

import MCE from '../js/chess-engine.js';
import '../js/chess-moves.js';
import '../js/chess-play.js';
import '../js/chess-units.js';
import '../js/rules/index.js';
import '../js/pieces/index.js';
import '../js/chess-variants.js';
import '../js/chess-ai.js';
import '../js/variants/index.js';

import { legalMoves, inCheck } from '../js/chess-moves.js';
import { makeMove, unmakeMove, getStatus } from '../js/chess-play.js';
import { getVariantStatus, variantLegalMoves } from '../js/chess-variants.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUTPUT = join(ROOT, 'data', 'puzzles-variants.json');

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--variant' && args[i + 1]) flags.variant = args[++i];
  else if (args[i] === '--games' && args[i + 1]) flags.games = parseInt(args[++i]);
  else if (args[i] === '--target' && args[i + 1]) flags.target = parseInt(args[++i]);
  else if (args[i] === '--max-moves' && args[i + 1]) flags.maxMoves = parseInt(args[++i]);
  else if (args[i] === '--verbose') flags.verbose = true;
  else if (args[i] === '--append') flags.append = true;
}

const GAMES_PER_VARIANT = flags.games || 500;
const TARGET_PER_VARIANT = flags.target || 15;
const MAX_MOVES = flags.maxMoves || 150;

// Variants to skip:
// - antichess/suicideChess/giveaway: win condition requires losing pieces (unreachable via depth-1 random play)
// - fogOfWar/darkChess: hidden information — showing the full board removes the defining mechanic
// - diceChess/einsteinChess: random mechanics — puzzles assume free piece choice
const SKIP_VARIANTS = new Set([
  'antichess', 'suicideChess', 'giveaway',
  'fogOfWar', 'darkChess', 'diceChess', 'einsteinChess'
]);

function getPuzzleType(variantKey) {
  const vc = MCE.getVariantConfig(variantKey);
  if (!vc) return null;

  if (vc.checkThreshold === 1) return 'Check in 1';
  if (vc.checkThreshold === 3) return 'Third check in 1';
  if (vc.checkThreshold === 5) return 'Fifth check in 1';
  if (vc.checkThreshold) return `Check #${vc.checkThreshold} in 1`;

  switch (variantKey) {
    case 'atomic': return 'Detonate in 1';
    case 'kingOfTheHill': return 'Reach the hill';
    case 'racingKings': return 'Race to rank 8';
    case 'extinction': case 'omnicide': return 'Extinguish in 1';
    case 'breakthrough': return 'Break through';
    case 'codrus': return 'Sacrifice your king';
    case 'knightmate': return 'Mate the knight-king';
    case 'maharaja': return 'Mate the Maharaja';
    case 'horde': return 'Horde mate in 1';
    case 'benedictChess': return 'Convert in 1';
    case 'berserkChess': return 'Berserk capture win';
    case 'darkChess': case 'fogOfWar': return 'Capture in the dark';
    case 'shatar': return 'Shatar mate in 1';
    default: break;
  }

  // For standard-checkmate variants, describe what makes them unique
  const label = vc.label || variantKey;
  if (vc.cols > 8 || vc.rows > 8) return `${label} mate in 1`;
  if (vc.cols < 8 || vc.rows < 8) return `${label} mate in 1`;
  return `${label} mate in 1`;
}

function isVariantOnlyWin(variantKey) {
  const vc = MCE.getVariantConfig(variantKey);
  if (!vc) return false;
  if (vc.checkThreshold) return true;
  if (vc.winCondition) {
    // These variants have custom win conditions that are NOT checkmate
    const nonMateWins = ['atomic', 'kingOfTheHill', 'racingKings', 'extinction',
      'omnicide', 'breakthrough', 'codrus', 'benedictChess', 'berserkChess'];
    return nonMateWins.includes(variantKey);
  }
  return false;
}

function getEffectiveStatus(g, variantOnly = false) {
  const variantStatus = MCE.getVariantStatus(g);
  if (variantStatus) return variantStatus;
  if (variantOnly) return null;
  return getStatus(g);
}

function isTerminal(status) {
  if (!status || status === 'active' || status === 'check') return false;
  return true;
}

function isWin(status, color) {
  if (!status) return false;
  if (status === 'checkmate') return true;
  if (typeof status === 'string' && status.endsWith(`-${color}`)) {
    if (status.startsWith('draw')) return false;
    return true;
  }
  return false;
}

function trackCheckCount(g) {
  if (!g.checkThreshold) return;
  const status = getStatus(g);
  if (status === 'check') {
    g.checkCount[g.turn]++;
  }
}

function randomMove(moves) {
  return moves[Math.floor(Math.random() * moves.length)];
}

function moveToAlgebraic(g, move) {
  const colStr = 'abcdefghijklm';
  const fromCol = move.from % g.cols;
  const fromRow = Math.floor(move.from / g.cols);
  const toCol = move.to % g.cols;
  const toRow = Math.floor(move.to / g.cols);
  let str = colStr[fromCol] + (g.rows - fromRow) + colStr[toCol] + (g.rows - toRow);
  if (move.promo) str += move.promo;
  return str;
}

function findForcedWin(g, variantOnly) {
  const turnColor = g.turn;
  const moves = variantLegalMoves(g);
  if (moves.length === 0) return null;

  const winningMoves = [];

  for (const move of moves) {
    const savedCC = g.checkThreshold ? { ...g.checkCount } : null;
    const undo = makeMove(g, move);
    trackCheckCount(g);
    const statusAfter = getEffectiveStatus(g, variantOnly);

    if (statusAfter && isWin(statusAfter, turnColor)) {
      winningMoves.push(move);
      unmakeMove(g, undo);
      if (savedCC) g.checkCount = savedCC;
      if (winningMoves.length > 1) return null;
      continue;
    }

    unmakeMove(g, undo);
    if (savedCC) g.checkCount = savedCC;
  }

  if (winningMoves.length === 1) {
    return { moves: [winningMoves[0]], depth: 1 };
  }
  return null;
}

function generateForVariant(variantKey) {
  const vc = MCE.getVariantConfig(variantKey);
  const isCheckVariant = vc && vc.checkThreshold;
  const variantOnly = isVariantOnlyWin(variantKey);
  const puzzleType = getPuzzleType(variantKey);
  const puzzles = [];
  let gamesPlayed = 0;

  for (let game = 0; game < GAMES_PER_VARIANT && puzzles.length < TARGET_PER_VARIANT; game++) {
    gamesPlayed++;
    const g = MCE.createGame(variantKey);
    if (!g) break;

    // Seed check count near threshold for check-threshold variants
    if (isCheckVariant && Math.random() < 0.7) {
      const threshold = g.checkThreshold;
      g.checkCount.w = Math.floor(Math.random() * (threshold - 1));
      g.checkCount.b = threshold - 1;
    }

    const positions = [];
    let moveCount = 0;

    while (moveCount < MAX_MOVES) {
      const status = getEffectiveStatus(g);
      if (isTerminal(status)) break;

      const moves = variantLegalMoves(g);
      if (moves.length === 0) break;

      if (moveCount > 6 && moves.length > 3) {
        let validCandidate = true;
        if (isCheckVariant) {
          const oppColor = g.turn === 'w' ? 'b' : 'w';
          if (g.checkCount[oppColor] < g.checkThreshold - 1) validCandidate = false;
        }
        if (validCandidate) {
          positions.push({
            fen: MCE.toFEN(g),
            turn: g.turn,
            moveNum: moveCount,
            checkCount: g.checkThreshold ? { ...g.checkCount } : null
          });
        }
      }

      const move = randomMove(moves);
      makeMove(g, move);
      trackCheckCount(g);
      moveCount++;
    }

    // Sample positions to test (cap to avoid slow variants)
    const maxTest = 50;
    const toTest = positions.length > maxTest
      ? positions.sort(() => Math.random() - 0.5).slice(0, maxTest)
      : positions;

    for (const pos of toTest) {
      if (puzzles.length >= TARGET_PER_VARIANT) break;

      const testGame = MCE.createGame(variantKey);
      MCE.loadFEN(testGame, pos.fen);
      if (pos.checkCount) testGame.checkCount = { ...pos.checkCount };

      const result = findForcedWin(testGame, variantOnly);
      if (result) {
        const solutionAlg = result.moves.map(m => moveToAlgebraic(testGame, m));
        const distractors = variantLegalMoves(testGame).length;

        const puzzle = {
          id: `${variantKey}_${puzzles.length + 1}`,
          variant: variantKey,
          fen: pos.fen,
          solution: solutionAlg,
          depth: result.depth,
          distractors,
          rating: rateByDistractors(distractors, result.depth),
          puzzleType,
          source: 'engine-generated'
        };
        if (pos.checkCount) puzzle.checkCount = pos.checkCount;
        puzzles.push(puzzle);

        if (flags.verbose) {
          console.log(`    #${puzzles.length}: ${solutionAlg[0]} (${distractors} distractors)`);
        }
      }
    }
  }

  return { puzzles, gamesPlayed };
}

function rateByDistractors(distractors, depth) {
  let base = depth === 1 ? 800 : 1200;
  if (distractors > 30) base += 400;
  else if (distractors > 20) base += 300;
  else if (distractors > 10) base += 200;
  else if (distractors > 5) base += 100;
  return Math.min(base, 2200);
}

// Determine which variants to process
const allVariantKeys = Object.keys(MCE.variantRegistry).sort();
const variantsToProcess = flags.variant
  ? [flags.variant].filter(k => MCE.getVariantConfig(k))
  : allVariantKeys.filter(k => !SKIP_VARIANTS.has(k));

if (variantsToProcess.length === 0) {
  console.error('No matching variants found.');
  process.exit(1);
}

console.log('Variant Puzzle Generator');
console.log('========================');
console.log(`Processing ${variantsToProcess.length} variants, ${GAMES_PER_VARIANT} games max, ${TARGET_PER_VARIANT} target each`);
console.log(`Skipping (need special approach): ${[...SKIP_VARIANTS].join(', ')}`);

// Load existing puzzles if appending
let existingPuzzles = [];
if (flags.append && existsSync(OUTPUT)) {
  const existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
  const processingKeys = new Set(variantsToProcess);
  existingPuzzles = existing.puzzles.filter(p => !processingKeys.has(p.variant));
  console.log(`Keeping ${existingPuzzles.length} existing puzzles from other variants`);
}

const allPuzzles = [...existingPuzzles];
const results = [];

for (const key of variantsToProcess) {
  const label = MCE.getVariantConfig(key).label || key;
  process.stdout.write(`  ${key} (${label})...`);

  const { puzzles, gamesPlayed } = generateForVariant(key);
  allPuzzles.push(...puzzles);
  results.push({ key, label, found: puzzles.length, games: gamesPlayed });

  if (puzzles.length >= TARGET_PER_VARIANT) {
    console.log(` ${puzzles.length} puzzles in ${gamesPlayed} games`);
  } else if (puzzles.length > 0) {
    console.log(` ${puzzles.length}/${TARGET_PER_VARIANT} (partial, ${gamesPlayed} games)`);
  } else {
    console.log(` 0 found in ${gamesPlayed} games`);
  }
}

const output = {
  meta: {
    generated: new Date().toISOString().split('T')[0],
    source: 'engine-generated',
    method: 'Random game playthrough + unique forced-win detection (depth 1)',
    count: allPuzzles.length,
    variants: [...new Set(allPuzzles.map(p => p.variant))].sort()
  },
  puzzles: allPuzzles
};

writeFileSync(OUTPUT, JSON.stringify(output, null, 2));

console.log(`\n${'='.repeat(50)}`);
console.log(`Total: ${allPuzzles.length} puzzles across ${output.meta.variants.length} variants`);
console.log(`Full coverage (${TARGET_PER_VARIANT}+): ${results.filter(r => r.found >= TARGET_PER_VARIANT).length}`);
console.log(`Partial: ${results.filter(r => r.found > 0 && r.found < TARGET_PER_VARIANT).length}`);
console.log(`Failed: ${results.filter(r => r.found === 0).length}`);

const failed = results.filter(r => r.found === 0);
if (failed.length > 0) {
  console.log(`\nFailed variants: ${failed.map(r => r.key).join(', ')}`);
}
