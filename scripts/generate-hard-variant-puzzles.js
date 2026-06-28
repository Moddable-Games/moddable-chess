#!/usr/bin/env node

/**
 * Generates puzzles for the 6 "hard" variants that the main generator can't handle:
 * - antichess, suicideChess, giveaway (lose-all-pieces, mandatory captures)
 * - omnicide (opponent captures all your pieces, no mandatory capture)
 * - codrus (sacrifice your own king)
 * - duckChess (two-phase turns, king capture win)
 *
 * Strategy: play longer random games (these need endgame positions) and use
 * depth-2 search for mandatory-capture variants where the key pattern is:
 * "move your last piece so the opponent is forced to capture it"
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

const GAMES = 2000;
const TARGET = 10;
const MAX_MOVES = 400;

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

function countPieces(g, color) {
  let count = 0;
  for (let i = 0; i < g.board.length; i++) {
    if (g.board[i] && MCE.pieceColor(g.board[i]) === color) count++;
  }
  return count;
}

function isTerminal(g) {
  const vs = MCE.getVariantStatus(g);
  if (vs) return true;
  const s = getStatus(g);
  return s !== 'active' && s !== 'check';
}

// For antichess/giveaway/suicide: find positions where the solver has 1-2 pieces
// and can force the opponent to capture the last one (depth 2)
function findAntichessPuzzle(g) {
  const solver = g.turn;
  const myPieces = countPieces(g, solver);
  if (myPieces > 3 || myPieces === 0) return null;

  const moves = variantLegalMoves(g);
  if (moves.length === 0) return null;

  const winningMoves = [];

  for (const move of moves) {
    const undo = makeMove(g, move);

    // Check immediate win (solver has 0 pieces now — shouldn't happen from a move)
    const vs = MCE.getVariantStatus(g);
    if (vs && vs.endsWith(`-${solver}`)) {
      winningMoves.push(move);
      unmakeMove(g, undo);
      if (winningMoves.length > 1) return null;
      continue;
    }

    // Depth 2: after solver moves, opponent must capture solver's piece (mandatory captures)
    // Then on solver's next turn, solver has 0 pieces = win
    const oppMoves = variantLegalMoves(g);
    if (oppMoves.length > 0) {
      let allLeadToWin = true;
      for (const opp of oppMoves) {
        const undo2 = makeMove(g, opp);
        const vs2 = MCE.getVariantStatus(g);
        if (!vs2 || !vs2.endsWith(`-${solver}`)) {
          allLeadToWin = false;
          unmakeMove(g, undo2);
          break;
        }
        unmakeMove(g, undo2);
      }
      if (allLeadToWin) {
        winningMoves.push(move);
        unmakeMove(g, undo);
        if (winningMoves.length > 1) return null;
        continue;
      }
    }

    unmakeMove(g, undo);
  }

  if (winningMoves.length === 1) {
    return { move: winningMoves[0], depth: myPieces <= 1 ? 1 : 2 };
  }
  return null;
}

// For codrus: solver wins by having THEIR OWN king captured.
// Puzzle format: find the only move that exposes the solver's king to capture.
// After the move, at least one opponent response captures the solver's king.
// The constraint for a unique puzzle: exactly ONE of the solver's moves leads to
// their king being attackable, while other moves don't expose the king.
function findCodrusPuzzle(g) {
  const solver = g.turn;
  const moves = variantLegalMoves(g);
  if (moves.length < 4) return null;

  const exposingMoves = [];

  for (const move of moves) {
    const undo = makeMove(g, move);

    // Skip if game ended immediately (captures opponent's king = opponent wins)
    const vsImmediate = MCE.getVariantStatus(g);
    if (vsImmediate) {
      unmakeMove(g, undo);
      continue;
    }

    // Check if any opponent move can now capture the solver's king
    const oppMoves = variantLegalMoves(g);
    let canCaptureKing = false;
    for (const opp of oppMoves) {
      const undo2 = makeMove(g, opp);
      const vs = MCE.getVariantStatus(g);
      if (vs && vs.endsWith(`-${solver}`)) {
        canCaptureKing = true;
        unmakeMove(g, undo2);
        break;
      }
      unmakeMove(g, undo2);
    }

    if (canCaptureKing) {
      exposingMoves.push(move);
    }

    unmakeMove(g, undo);
    if (exposingMoves.length > 1) return null;
  }

  if (exposingMoves.length === 1) {
    return { move: exposingMoves[0], depth: 1 };
  }
  return null;
}

// For duck chess: win by capturing opponent's king (noCheck mode)
// Simplified: find positions where exactly one move captures the king
function findDuckChessPuzzle(g) {
  if (g.duckPhase) return null;

  const solver = g.turn;
  const opponent = solver === 'w' ? 'b' : 'w';
  const moves = variantLegalMoves(g);
  if (moves.length === 0) return null;

  // Find moves that capture the opponent's king
  const kingCaptures = [];
  for (const move of moves) {
    const target = g.board[move.to];
    if (target && MCE.pieceType(target) === 'k' && MCE.pieceColor(target) === opponent) {
      kingCaptures.push(move);
    }
  }

  if (kingCaptures.length === 1) {
    return { move: kingCaptures[0], depth: 1 };
  }
  return null;
}

// For omnicide: solver wins by having 0 pieces (no mandatory captures).
// Depth-2 puzzle: solver has 1 piece and makes the unique move such that
// ALL opponent responses capture the solver's last piece → solver wins.
function findOmnicidePuzzle(g) {
  const solver = g.turn;
  const myPieces = countPieces(g, solver);
  if (myPieces !== 1) return null;

  const moves = variantLegalMoves(g);
  if (moves.length < 4) return null;

  const winningMoves = [];

  for (const move of moves) {
    const undo = makeMove(g, move);

    // If game ended immediately, check who won
    const vsImmediate = MCE.getVariantStatus(g);
    if (vsImmediate) {
      if (vsImmediate.endsWith(`-${solver}`)) {
        winningMoves.push(move);
        unmakeMove(g, undo);
        if (winningMoves.length > 1) return null;
        continue;
      }
      unmakeMove(g, undo);
      continue;
    }

    // Game not over. Check depth 2: ALL opponent moves lead to solver win
    const oppMoves = variantLegalMoves(g);
    if (oppMoves.length === 0) {
      unmakeMove(g, undo);
      continue;
    }

    let allLeadToSolverWin = true;
    for (const opp of oppMoves) {
      const undo2 = makeMove(g, opp);
      const vs2 = MCE.getVariantStatus(g);
      if (!vs2 || !vs2.endsWith(`-${solver}`)) {
        allLeadToSolverWin = false;
        unmakeMove(g, undo2);
        break;
      }
      unmakeMove(g, undo2);
    }

    if (allLeadToSolverWin) {
      winningMoves.push(move);
      unmakeMove(g, undo);
      if (winningMoves.length > 1) return null;
      continue;
    }

    unmakeMove(g, undo);
  }

  if (winningMoves.length === 1) {
    return { move: winningMoves[0], depth: 2 };
  }
  return null;
}

function generateForVariant(variantKey, findPuzzle) {
  const puzzles = [];
  let gamesPlayed = 0;

  for (let game = 0; game < GAMES && puzzles.length < TARGET; game++) {
    gamesPlayed++;
    const g = MCE.createGame(variantKey);
    if (!g) break;

    let moveCount = 0;
    while (moveCount < MAX_MOVES) {
      if (isTerminal(g)) break;
      const moves = variantLegalMoves(g);
      if (moves.length === 0) break;

      // Try to find a puzzle at this position
      if (moveCount > 15) {
        const result = findPuzzle(g);
        if (result) {
          const fen = MCE.toFEN(g);
          const solutionAlg = moveToAlgebraic(g, result.move);
          const distractors = variantLegalMoves(g).length;
          puzzles.push({
            id: `${variantKey}_${puzzles.length + 1}`,
            variant: variantKey,
            fen,
            solution: [solutionAlg],
            depth: result.depth,
            distractors,
            rating: 800 + Math.min(distractors * 30, 600),
            puzzleType: getPuzzleType(variantKey),
            source: 'engine-generated'
          });
          break;
        }
      }

      const move = randomMove(moves);
      makeMove(g, move);
      moveCount++;
    }
  }

  return { puzzles, gamesPlayed };
}

// Codrus-specific generator: uses constructed positions and random game play.
// In codrus, you win by having your king captured. We look for positions where
// the solver can move their king to a square attacked by the opponent, such that
// after the king moves there, ALL opponent moves capture it.
// This works when: opponent has a single piece with exactly 1 legal move (a pawn
// about to promote/advance), or the opponent is completely boxed in.
// We also search with random game play at very deep move counts.
function generateCodrusPuzzles() {
  const puzzles = [];

  // Strategy 1: random games played very deep into endgame
  const GAMES = 20000;
  for (let game = 0; game < GAMES && puzzles.length < TARGET; game++) {
    const g = MCE.createGame('codrus');
    let moveCount = 0;
    while (moveCount < 800) {
      if (isTerminal(g)) break;
      const moves = variantLegalMoves(g);
      if (moves.length === 0) break;

      if (moveCount > 30) {
        const result = findCodrusPuzzle(g);
        if (result) {
          const fen = MCE.toFEN(g);
          const solutionAlg = moveToAlgebraic(g, result.move);
          const distractors = variantLegalMoves(g).length;
          if (distractors >= 4) {
            puzzles.push({
              id: `codrus_${puzzles.length + 1}`,
              variant: 'codrus',
              fen,
              solution: [solutionAlg],
              depth: result.depth,
              distractors,
              rating: 800 + Math.min(distractors * 30, 600),
              puzzleType: 'Expose your king',
              source: 'engine-generated'
            });
            break;
          }
        }
      }

      const move = randomMove(moves);
      makeMove(g, move);
      moveCount++;
    }
  }

  // Strategy 2: if still short, construct minimal positions (king + 1 pawn)
  if (puzzles.length < TARGET) {
    const attempts = 100000;
    for (let i = 0; i < attempts && puzzles.length < TARGET; i++) {
      const g = MCE.createGame('codrus');
      for (let sq = 0; sq < 64; sq++) g.board[sq] = null;

      const solverColor = Math.random() < 0.5 ? 'w' : 'b';
      const oppColor = solverColor === 'w' ? 'b' : 'w';
      g.turn = solverColor;
      g.castling = { K: false, Q: false, k: false, q: false };
      g.ep = -1;
      g.halfMove = 0;
      g.fullMove = 50;

      const usedSqs = new Set();

      // Place solver's king
      const kingSq = Math.floor(Math.random() * 64);
      g.board[kingSq] = solverColor === 'w' ? 'K' : 'k';
      usedSqs.add(kingSq);

      // Place opponent's king (far from solver's king)
      let oppKingSq;
      do { oppKingSq = Math.floor(Math.random() * 64); } while (usedSqs.has(oppKingSq));
      g.board[oppKingSq] = oppColor === 'w' ? 'K' : 'k';
      usedSqs.add(oppKingSq);

      // Place 1 opponent pawn (avoid rank 1/8 for pawns)
      const pawnRow = 1 + Math.floor(Math.random() * 6);
      const pawnCol = Math.floor(Math.random() * 8);
      const pawnSq = pawnRow * 8 + pawnCol;
      if (usedSqs.has(pawnSq)) continue;
      g.board[pawnSq] = oppColor === 'w' ? 'P' : 'p';
      usedSqs.add(pawnSq);

      // Optionally add blocking pieces to restrict opponent moves
      const numBlockers = Math.floor(Math.random() * 4);
      for (let b = 0; b < numBlockers; b++) {
        let sq;
        do { sq = Math.floor(Math.random() * 64); } while (usedSqs.has(sq));
        usedSqs.add(sq);
        // Neutral blocker (solver's pawn, won't matter for logic)
        g.board[sq] = solverColor === 'w' ? 'P' : 'p';
      }

      const result = findCodrusPuzzle(g);
      if (result) {
        const fen = MCE.toFEN(g);
        const solutionAlg = moveToAlgebraic(g, result.move);
        const distractors = variantLegalMoves(g).length;
        if (distractors >= 4) {
          puzzles.push({
            id: `codrus_${puzzles.length + 1}`,
            variant: 'codrus',
            fen,
            solution: [solutionAlg],
            depth: result.depth,
            distractors,
            rating: 800 + Math.min(distractors * 30, 600),
            puzzleType: 'Expose your king',
            source: 'engine-generated'
          });
        }
      }
    }
  }

  return { puzzles, gamesPlayed: puzzles.length };
}

function getPuzzleType(key) {
  switch (key) {
    case 'antichess': case 'suicideChess': case 'giveaway': return 'Lose last piece';
    case 'omnicide': return 'Force your capture';
    case 'codrus': return 'Expose your king';
    case 'duckChess': return 'Capture the king';
    default: return 'Tactic';
  }
}

console.log('Hard Variant Puzzle Generator');
console.log('==============================');

const HARD_VARIANTS = [
  { key: 'antichess', finder: findAntichessPuzzle },
  { key: 'suicideChess', finder: findAntichessPuzzle },
  { key: 'giveaway', finder: findAntichessPuzzle },
  { key: 'omnicide', finder: findOmnicidePuzzle },
  { key: 'duckChess', finder: findDuckChessPuzzle },
];

const newPuzzles = [];

// Codrus uses special position-construction generator
process.stdout.write('  codrus...');
const codrusResult = generateCodrusPuzzles();
newPuzzles.push(...codrusResult.puzzles);
if (codrusResult.puzzles.length >= TARGET) {
  console.log(` ${codrusResult.puzzles.length} puzzles in ${codrusResult.gamesPlayed} attempts`);
} else if (codrusResult.puzzles.length > 0) {
  console.log(` ${codrusResult.puzzles.length}/${TARGET} (partial, ${codrusResult.gamesPlayed} attempts)`);
} else {
  console.log(` 0 found in ${codrusResult.gamesPlayed} attempts`);
}

for (const { key, finder } of HARD_VARIANTS) {
  process.stdout.write(`  ${key}...`);
  const { puzzles, gamesPlayed } = generateForVariant(key, finder);
  newPuzzles.push(...puzzles);
  if (puzzles.length >= TARGET) {
    console.log(` ${puzzles.length} puzzles in ${gamesPlayed} games`);
  } else if (puzzles.length > 0) {
    console.log(` ${puzzles.length}/${TARGET} (partial, ${gamesPlayed} games)`);
  } else {
    console.log(` 0 found in ${gamesPlayed} games`);
  }
}

// Merge with existing puzzles
if (existsSync(OUTPUT)) {
  const existing = JSON.parse(readFileSync(OUTPUT, 'utf-8'));
  const hardKeys = new Set([...HARD_VARIANTS.map(v => v.key), 'codrus']);
  const kept = existing.puzzles.filter(p => !hardKeys.has(p.variant));
  const allPuzzles = [...kept, ...newPuzzles];

  const output = {
    meta: {
      generated: new Date().toISOString().split('T')[0],
      source: 'engine-generated',
      method: 'Random game playthrough + forced-win detection',
      count: allPuzzles.length,
      variants: [...new Set(allPuzzles.map(p => p.variant))].sort()
    },
    puzzles: allPuzzles
  };

  writeFileSync(OUTPUT, JSON.stringify(output, null, 2));
  console.log(`\nMerged: ${allPuzzles.length} total puzzles across ${output.meta.variants.length} variants`);
  console.log(`New from hard variants: ${newPuzzles.length}`);
} else {
  console.log('\nNo existing puzzle file to merge with.');
}
