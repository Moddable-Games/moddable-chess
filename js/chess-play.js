'use strict';
/**
 * Move execution and game state updates — extends MCE
 */
(function() {

const { WHITE, BLACK, rc, sq, pieceColor, pieceType, inCheck, legalMoves } = MCE;

function makeMove(g, move) {
  const { from, to, flag, promo } = move;
  const piece = g.board[from];
  const captured = g.board[to];
  const undo = {
    from, to, piece, captured, flag, promo,
    castling: { ...g.castling },
    enPassant: g.enPassant,
    halfmove: g.halfmove,
    turn: g.turn,
  };

  g.board[to] = piece;
  g.board[from] = null;

  if (flag === 'ep') {
    const epCapSq = sq(rc(from)[0], rc(to)[1]);
    undo.epCaptured = g.board[epCapSq];
    undo.epCapSq = epCapSq;
    g.board[epCapSq] = null;
  }

  if (flag === 'double') {
    g.enPassant = sq((rc(from)[0] + rc(to)[0]) / 2, rc(from)[1]);
  } else {
    g.enPassant = -1;
  }

  if (flag === 'promo') {
    g.board[to] = g.turn === WHITE ? promo.toUpperCase() : promo;
  }

  if (flag === 'castle-k') {
    const row = rc(from)[0];
    g.board[sq(row, 5)] = g.board[sq(row, 7)];
    g.board[sq(row, 7)] = null;
  }
  if (flag === 'castle-q') {
    const row = rc(from)[0];
    g.board[sq(row, 3)] = g.board[sq(row, 0)];
    g.board[sq(row, 0)] = null;
  }

  updateCastlingRights(g, from, to, piece);

  if (pieceType(piece) === 'p' || captured) g.halfmove = 0;
  else g.halfmove++;

  if (g.turn === BLACK) g.fullmove++;
  g.turn = g.turn === WHITE ? BLACK : WHITE;

  g.history.push(move);
  return undo;
}

function unmakeMove(g, undo) {
  const { from, to, piece, captured, flag } = undo;
  g.board[from] = piece;
  g.board[to] = captured || null;

  if (flag === 'ep') {
    g.board[undo.epCapSq] = undo.epCaptured;
  }
  if (flag === 'castle-k') {
    const row = rc(from)[0];
    g.board[sq(row, 7)] = g.board[sq(row, 5)];
    g.board[sq(row, 5)] = null;
  }
  if (flag === 'castle-q') {
    const row = rc(from)[0];
    g.board[sq(row, 0)] = g.board[sq(row, 3)];
    g.board[sq(row, 3)] = null;
  }

  g.castling = undo.castling;
  g.enPassant = undo.enPassant;
  g.halfmove = undo.halfmove;
  g.turn = undo.turn;
  g.history.pop();
}

function updateCastlingRights(g, from, to, piece) {
  if (piece === 'K') { g.castling.K = false; g.castling.Q = false; }
  if (piece === 'k') { g.castling.k = false; g.castling.q = false; }
  if (from === 63 || to === 63) g.castling.K = false;
  if (from === 56 || to === 56) g.castling.Q = false;
  if (from === 7 || to === 7) g.castling.k = false;
  if (from === 0 || to === 0) g.castling.q = false;
}

function getStatus(g) {
  const moves = legalMoves(g);
  if (moves.length === 0) {
    return inCheck(g, g.turn) ? 'checkmate' : 'stalemate';
  }
  if (g.halfmove >= 100) return 'draw-50';
  if (inCheck(g, g.turn)) return 'check';
  return 'active';
}

Object.assign(MCE, { makeMove, unmakeMove, getStatus });
})();
