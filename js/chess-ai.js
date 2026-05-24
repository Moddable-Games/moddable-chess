'use strict';
(function() {

const { WHITE, BLACK, pieceColor, pieceType, legalMoves, makeMove, unmakeMove, inCheck } = MCE;

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000, a: 650, c: 830, s: 150 };

function evaluate(g) {
  let score = 0;
  const total = g.rows * g.cols;
  for (let i = 0; i < total; i++) {
    const p = g.board[i];
    if (!p) continue;
    const val = PIECE_VALUES[pieceType(p)] || 0;
    score += pieceColor(p) === WHITE ? val : -val;
  }
  return g.turn === WHITE ? score : -score;
}

function getAIMoves(g) {
  const v = g.variant;
  if (v === 'antichess' || v === 'racingKings') {
    return MCE.variantLegalMoves(g);
  }
  return legalMoves(g);
}

function pickMove(g, depth) {
  depth = depth || 2;
  const moves = getAIMoves(g);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  let bestScore = -Infinity;
  let bestMoves = [];

  for (const move of moves) {
    const undo = makeMove(g, move);
    const score = -negamax(g, depth - 1, -Infinity, Infinity);
    unmakeMove(g, undo);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function negamax(g, depth, alpha, beta) {
  if (depth === 0) return evaluate(g);

  const moves = getAIMoves(g);
  if (moves.length === 0) {
    if (g.variant === 'antichess') return 100000;
    if (inCheck(g, g.turn)) return -100000;
    return 0;
  }

  for (const move of moves) {
    const undo = makeMove(g, move);
    const score = -negamax(g, depth - 1, -beta, -alpha);
    unmakeMove(g, undo);
    if (score >= beta) return beta;
    if (score > alpha) alpha = score;
  }
  return alpha;
}

function pickDuckSquare(g) {
  const total = g.rows * g.cols;
  const empties = [];
  for (let i = 0; i < total; i++) {
    if (!g.board[i] && i !== g.duckSq) empties.push(i);
  }
  if (empties.length === 0) return -1;
  return empties[Math.floor(Math.random() * empties.length)];
}

Object.assign(MCE, { aiPickMove: pickMove, aiPickDuckSquare: pickDuckSquare });
})();
