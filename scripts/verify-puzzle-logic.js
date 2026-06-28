#!/usr/bin/env node

/**
 * Verifies that puzzle solutions lead to the SOLVER winning under each variant's rules.
 * For lose-to-win variants, "winning" means losing all your pieces (antichess) or
 * having your king captured (codrus) or having zero pieces (omnicide).
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

import { makeMove, unmakeMove } from '../js/chess-play.js';
import { variantLegalMoves, getVariantStatus } from '../js/chess-variants.js';
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUZZLE_FILE = join(ROOT, 'data', 'puzzles-variants.json');

const data = JSON.parse(readFileSync(PUZZLE_FILE, 'utf-8'));
const puzzles = data.puzzles;

const VARIANTS_TO_CHECK = ['antichess', 'suicideChess', 'giveaway', 'codrus', 'omnicide'];

function parseAlgebraic(g, alg) {
  const colStr = 'abcdefghijklm';
  const fromCol = colStr.indexOf(alg[0]);
  const fromRow = g.rows - parseInt(alg[1]);
  const toCol = colStr.indexOf(alg[2]);
  const toRow = g.rows - parseInt(alg[3]);
  const promo = alg.length > 4 ? alg[4] : undefined;
  return {
    from: fromRow * g.cols + fromCol,
    to: toRow * g.cols + toCol,
    promo
  };
}

function findMatchingMove(g, parsed) {
  const moves = variantLegalMoves(g);
  return moves.find(m => m.from === parsed.from && m.to === parsed.to &&
    (!parsed.promo || m.promo === parsed.promo));
}

console.log('Puzzle Logic Verification');
console.log('=========================\n');

for (const variantKey of VARIANTS_TO_CHECK) {
  const variantPuzzles = puzzles.filter(p => p.variant === variantKey);
  console.log(`\n${variantKey} (${variantPuzzles.length} puzzles):`);

  let correct = 0, inverted = 0, unclear = 0;

  for (const puzzle of variantPuzzles) {
    const g = MCE.createGame(variantKey);
    MCE.loadFEN(g, puzzle.fen);
    const solver = g.turn;
    const opponent = solver === 'w' ? 'b' : 'w';

    const parsed = parseAlgebraic(g, puzzle.solution[0]);
    const move = findMatchingMove(g, parsed);

    if (!move) {
      console.log(`  [ERROR] ${puzzle.id}: solution ${puzzle.solution[0]} not legal`);
      unclear++;
      continue;
    }

    const undo = makeMove(g, move);

    // Check immediate win for solver
    const vs1 = getVariantStatus(g);
    if (vs1 && vs1.endsWith(`-${solver}`)) {
      console.log(`  [OK] ${puzzle.id}: immediate win for solver (${solver}) — ${vs1}`);
      correct++;
      unmakeMove(g, undo);
      continue;
    }

    // Check if this helps the OPPONENT win
    if (vs1 && vs1.endsWith(`-${opponent}`)) {
      console.log(`  [INVERTED] ${puzzle.id}: solution causes OPPONENT (${opponent}) to win — ${vs1}`);
      inverted++;
      unmakeMove(g, undo);
      continue;
    }

    // Depth 2: check all opponent responses
    const oppMoves = variantLegalMoves(g);
    if (oppMoves.length === 0) {
      console.log(`  [UNCLEAR] ${puzzle.id}: no opponent moves after solution`);
      unclear++;
      unmakeMove(g, undo);
      continue;
    }

    let allLeadToSolverWin = true;
    let anyLeadToSolverWin = false;
    let allLeadToOpponentWin = true;

    for (const opp of oppMoves) {
      const undo2 = makeMove(g, opp);
      const vs2 = getVariantStatus(g);
      if (vs2 && vs2.endsWith(`-${solver}`)) {
        anyLeadToSolverWin = true;
      } else {
        allLeadToSolverWin = false;
      }
      if (!vs2 || !vs2.endsWith(`-${opponent}`)) {
        allLeadToOpponentWin = false;
      }
      unmakeMove(g, undo2);
    }

    if (allLeadToSolverWin) {
      console.log(`  [OK] ${puzzle.id}: all opponent responses lead to solver win (depth 2)`);
      correct++;
    } else if (allLeadToOpponentWin) {
      console.log(`  [INVERTED] ${puzzle.id}: all opponent responses lead to OPPONENT win (depth 2)`);
      inverted++;
    } else if (anyLeadToSolverWin) {
      // For variants where captures aren't mandatory (codrus, omnicide without
      // forced captures), exposing the king to capture IS a valid puzzle — the
      // opponent CAN take it even if not forced to.
      if (variantKey === 'codrus') {
        console.log(`  [OK] ${puzzle.id}: king exposed to capture (valid codrus tactic)`);
        correct++;
      } else {
        console.log(`  [PARTIAL] ${puzzle.id}: some opponent responses lead to solver win`);
        unclear++;
      }
    } else {
      console.log(`  [UNCLEAR] ${puzzle.id}: no immediate resolution at depth 2`);
      unclear++;
    }

    unmakeMove(g, undo);
  }

  console.log(`  Summary: ${correct} correct, ${inverted} inverted, ${unclear} unclear`);
}
