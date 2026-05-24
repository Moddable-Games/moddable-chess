'use strict';
/**
 * Move execution and game state updates — extends MCE
 */
(function() {

const { WHITE, BLACK, pieceColor, pieceType, inCheck, legalMoves } = MCE;

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

  const isRifle = g.variant === 'rifle';
  const isCapture = captured || flag === 'ep';

  if (isRifle && isCapture && flag !== 'ep') {
    g.board[to] = null;
    g.board[from] = piece;
  } else {
    g.board[to] = piece;
    g.board[from] = null;
  }

  if (g.variant === 'atomic' && isCapture && flag !== 'ep') {
    undo.exploded = [];
    const [tr, tc] = MCE.rc(to, g);
    g.board[to] = null;
    g.board[from] = null;
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = tr + dr, nc = tc + dc;
        if (!MCE.onBoard(nr, nc, g)) continue;
        const adjSq = MCE.sq(nr, nc, g);
        const adjP = g.board[adjSq];
        if (adjP && pieceType(adjP) !== 'p') {
          undo.exploded.push({ sq: adjSq, piece: adjP });
          g.board[adjSq] = null;
        }
      }
    }
  }

  if (flag === 'ep') {
    const [fr] = MCE.rc(from, g);
    const [, tc] = MCE.rc(to, g);
    const epCapSq = MCE.sq(fr, tc, g);
    undo.epCaptured = g.board[epCapSq];
    undo.epCapSq = epCapSq;
    g.board[epCapSq] = null;
  }

  if (flag === 'double') {
    const [fr, fc] = MCE.rc(from, g);
    const [tr] = MCE.rc(to, g);
    g.enPassant = MCE.sq((fr + tr) / 2, fc, g);
  } else {
    g.enPassant = -1;
  }

  if (flag === 'promo') {
    g.board[to] = g.turn === WHITE ? promo.toUpperCase() : promo;
  }

  if (flag === 'castle-k') {
    const [row, kc] = MCE.rc(from, g);
    const rookFrom = MCE.sq(row, g.cols - 1, g);
    const rookTo = MCE.sq(row, kc + 1, g);
    g.board[rookTo] = g.board[rookFrom];
    g.board[rookFrom] = null;
  }
  if (flag === 'castle-q') {
    const [row, kc] = MCE.rc(from, g);
    const rookFrom = MCE.sq(row, 0, g);
    const rookTo = MCE.sq(row, kc - 1, g);
    g.board[rookTo] = g.board[rookFrom];
    g.board[rookFrom] = null;
  }

  updateCastlingRights(g, from, to, piece);

  if (pieceType(piece) === 'p' || captured) g.halfmove = 0;
  else g.halfmove++;

  if (g.variant === 'marseillais') {
    g.movesThisTurn++;
    undo.movesThisTurn = g.movesThisTurn - 1;
    const isFirstMove = g.fullmove === 1 && g.turn === WHITE;
    const givesCheck = inCheck(g, g.turn === WHITE ? BLACK : WHITE);
    if (g.movesThisTurn >= 2 || isFirstMove || givesCheck) {
      if (g.turn === BLACK) g.fullmove++;
      g.turn = g.turn === WHITE ? BLACK : WHITE;
      g.movesThisTurn = 0;
    }
  } else if (g.variant === 'duckChess') {
    if (!g.duckPhase) {
      g.duckPhase = true;
    } else {
      g.duckPhase = false;
      if (g.turn === BLACK) g.fullmove++;
      g.turn = g.turn === WHITE ? BLACK : WHITE;
    }
    undo.duckPhase = !g.duckPhase;
  } else {
    if (g.turn === BLACK) g.fullmove++;
    g.turn = g.turn === WHITE ? BLACK : WHITE;
  }

  g.history.push(move);
  return undo;
}

function unmakeMove(g, undo) {
  const { from, to, piece, captured, flag } = undo;
  g.board[from] = piece;
  g.board[to] = captured || null;

  if (undo.exploded) {
    undo.exploded.forEach(e => { g.board[e.sq] = e.piece; });
  }

  if (flag === 'ep') {
    g.board[undo.epCapSq] = undo.epCaptured;
  }
  if (flag === 'castle-k') {
    const [row, kc] = MCE.rc(from, g);
    const rookTo = MCE.sq(row, kc + 1, g);
    const rookFrom = MCE.sq(row, g.cols - 1, g);
    g.board[rookFrom] = g.board[rookTo];
    g.board[rookTo] = null;
  }
  if (flag === 'castle-q') {
    const [row, kc] = MCE.rc(from, g);
    const rookTo = MCE.sq(row, kc - 1, g);
    const rookFrom = MCE.sq(row, 0, g);
    g.board[rookFrom] = g.board[rookTo];
    g.board[rookTo] = null;
  }

  g.castling = undo.castling;
  g.enPassant = undo.enPassant;
  g.halfmove = undo.halfmove;
  g.turn = undo.turn;
  if (undo.movesThisTurn !== undefined) g.movesThisTurn = undo.movesThisTurn;
  if (undo.duckPhase !== undefined) g.duckPhase = undo.duckPhase;
  g.history.pop();
}

function updateCastlingRights(g, from, to, piece) {
  if (piece === 'K') { g.castling.K = false; g.castling.Q = false; }
  if (piece === 'k') { g.castling.k = false; g.castling.q = false; }
  const lastSq = g.rows * g.cols - 1;
  const wRookK = MCE.sq(g.rows - 1, g.cols - 1, g);
  const wRookQ = MCE.sq(g.rows - 1, 0, g);
  const bRookK = MCE.sq(0, g.cols - 1, g);
  const bRookQ = MCE.sq(0, 0, g);
  if (from === wRookK || to === wRookK) g.castling.K = false;
  if (from === wRookQ || to === wRookQ) g.castling.Q = false;
  if (from === bRookK || to === bRookK) g.castling.k = false;
  if (from === bRookQ || to === bRookQ) g.castling.q = false;
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
