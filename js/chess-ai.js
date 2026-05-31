'use strict';
(function() {

const { WHITE, BLACK, pieceColor, pieceType, legalMoves, makeMove, unmakeMove, inCheck } = MCE;

const PIECE_VALUES = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000, a: 650, c: 830, s: 150 };

const DIFFICULTIES = {
  beginner: { depth: 1, topN: 0, blunder: 0.3 },
  easy: { depth: 2, topN: 5, blunder: 0.15 },
  medium: { depth: 3, topN: 3, blunder: 0 },
  hard: { depth: 4, topN: 1, blunder: 0 },
  expert: { depth: 5, topN: 1, blunder: 0 }
};

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
  const vc = MCE.getVariantConfig(g.variant);
  if (vc && vc.moveFilter) return MCE.variantLegalMoves(g);
  return legalMoves(g);
}

function pickMove(g, depth, opts) {
  opts = opts || {};
  const diff = opts.difficulty ? DIFFICULTIES[opts.difficulty] : null;
  let searchDepth = diff ? diff.depth : (depth || 3);
  const topN = diff ? diff.topN : 1;
  const blunder = diff ? diff.blunder : 0;

  const total = g.rows * g.cols;
  if (total > 80) searchDepth = Math.min(searchDepth, 2);
  else if (total > 64) searchDepth = Math.min(searchDepth, 3);

  const moves = getAIMoves(g);
  if (moves.length === 0) return null;
  if (moves.length === 1) return moves[0];

  if (blunder > 0 && Math.random() < blunder) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const scored = [];
  for (const move of moves) {
    const undo = makeMove(g, move);
    const score = -negamax(g, searchDepth - 1, -Infinity, Infinity);
    unmakeMove(g, undo);
    scored.push({ move, score });
  }

  scored.sort((a, b) => b.score - a.score);

  const pool = topN > 0 ? scored.slice(0, topN) : scored;
  const pick = pool[Math.floor(Math.random() * pool.length)];
  return pick.move;
}

function negamax(g, depth, alpha, beta) {
  if (depth === 0) return evaluate(g);

  const moves = getAIMoves(g);
  if (moves.length === 0) {
    if (g.stalemateMeaning === 'win') return 100000;
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

Object.assign(MCE, {
  aiPickMove: pickMove,
  aiPickDuckSquare: pickDuckSquare,
  AI_DIFFICULTIES: DIFFICULTIES
});
})();
