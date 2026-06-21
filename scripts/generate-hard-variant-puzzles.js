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
import '../js/chess-variants.js';
import '../js/chess-units.js';
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

const GAMES = 1000;
const TARGET = 10;
const MAX_MOVES = 300;

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

// For codrus: backtrack from wins — find positions where exactly one move captures a king
// In codrus, the player whose king is captured WINS, so the puzzle framing is:
// "The opponent left their king exposed — find the capture that lets them win!"
function findCodrusPuzzle(g) {
  const moves = variantLegalMoves(g);
  if (moves.length < 4) return null;

  const kingCaptures = moves.filter(m => {
    const target = g.board[m.to];
    return target && MCE.pieceType(target) === 'k';
  });

  if (kingCaptures.length === 1) {
    return { move: kingCaptures[0], depth: 1 };
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

// For omnicide: find positions where one side has exactly 1 piece left and
// there's exactly one way to capture it. Framed as "find the final capture"
// (which in omnicide HELPS the captured side win — teaching the mechanic).
function findOmnicidePuzzle(g) {
  const mover = g.turn;
  const opponent = mover === 'w' ? 'b' : 'w';

  // Opponent has exactly 1 piece — find the unique capture
  const oppPieces = countPieces(g, opponent);
  if (oppPieces !== 1) return null;

  const moves = variantLegalMoves(g);
  if (moves.length < 4) return null;

  const captures = moves.filter(m => {
    const target = g.board[m.to];
    return target && MCE.pieceColor(target) === opponent;
  });

  // Exactly one way to capture the last piece = good puzzle
  if (captures.length === 1) {
    return { move: captures[0], depth: 1 };
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

function getPuzzleType(key) {
  switch (key) {
    case 'antichess': case 'suicideChess': case 'giveaway': return 'Lose last piece';
    case 'omnicide': return 'Sacrifice all';
    case 'codrus': return 'Sacrifice your king';
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
  { key: 'codrus', finder: findCodrusPuzzle },
  { key: 'duckChess', finder: findDuckChessPuzzle },
];

const newPuzzles = [];

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
  const hardKeys = new Set(HARD_VARIANTS.map(v => v.key));
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
