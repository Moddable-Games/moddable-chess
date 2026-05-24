'use strict';
/**
 * Move generation — extends MCE
 */
(function() {

const { PIECE, WHITE, BLACK, rc, sq, onBoard, pieceColor, pieceType } = MCE;

const KNIGHT_OFFSETS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];
const BISHOP_DIRS = [[-1,-1],[-1,1],[1,-1],[1,1]];
const ROOK_DIRS = [[-1,0],[1,0],[0,-1],[0,1]];
const QUEEN_DIRS = [...ROOK_DIRS, ...BISHOP_DIRS];
const KING_DIRS = QUEEN_DIRS;

function pseudoLegalMoves(g) {
  const moves = [];
  const side = g.turn;
  for (let i = 0; i < 64; i++) {
    const p = g.board[i];
    if (!p || pieceColor(p) !== side) continue;
    const type = pieceType(p);
    const [r, c] = rc(i);
    if (type === PIECE.P) genPawnMoves(g, i, r, c, side, moves);
    else if (type === PIECE.N) genJumps(g, i, r, c, side, KNIGHT_OFFSETS, moves);
    else if (type === PIECE.B) genSlides(g, i, r, c, side, BISHOP_DIRS, moves);
    else if (type === PIECE.R) genSlides(g, i, r, c, side, ROOK_DIRS, moves);
    else if (type === PIECE.Q) genSlides(g, i, r, c, side, QUEEN_DIRS, moves);
    else if (type === PIECE.K) {
      genJumps(g, i, r, c, side, KING_DIRS, moves);
      genCastling(g, i, r, c, side, moves);
    }
  }
  return moves;
}

function genPawnMoves(g, from, r, c, side, moves) {
  const dir = side === WHITE ? -1 : 1;
  const startRow = side === WHITE ? 6 : 1;
  const promoRow = side === WHITE ? 0 : 7;
  const fwd = sq(r + dir, c);
  if (onBoard(r + dir, c) && !g.board[fwd]) {
    addPawnMove(from, fwd, r + dir, promoRow, moves);
    if (r === startRow) {
      const fwd2 = sq(r + dir * 2, c);
      if (!g.board[fwd2]) moves.push({ from, to: fwd2, flag: 'double' });
    }
  }
  for (const dc of [-1, 1]) {
    const nc = c + dc;
    if (!onBoard(r + dir, nc)) continue;
    const target = sq(r + dir, nc);
    const tp = g.board[target];
    if (tp && pieceColor(tp) !== side) addPawnMove(from, target, r + dir, promoRow, moves);
    else if (target === g.enPassant) moves.push({ from, to: target, flag: 'ep' });
  }
}

function addPawnMove(from, to, toRow, promoRow, moves) {
  if (toRow === promoRow) {
    for (const promo of ['q','r','b','n']) moves.push({ from, to, flag: 'promo', promo });
  } else {
    moves.push({ from, to, flag: null });
  }
}

function genSlides(g, from, r, c, side, dirs, moves) {
  for (const [dr, dc] of dirs) {
    let nr = r + dr, nc = c + dc;
    while (onBoard(nr, nc)) {
      const target = sq(nr, nc);
      const tp = g.board[target];
      if (tp) {
        if (pieceColor(tp) !== side) moves.push({ from, to: target, flag: 'capture' });
        break;
      }
      moves.push({ from, to: target, flag: null });
      nr += dr; nc += dc;
    }
  }
}

function genJumps(g, from, r, c, side, offsets, moves) {
  for (const [dr, dc] of offsets) {
    const nr = r + dr, nc = c + dc;
    if (!onBoard(nr, nc)) continue;
    const target = sq(nr, nc);
    const tp = g.board[target];
    if (tp && pieceColor(tp) === side) continue;
    moves.push({ from, to: target, flag: tp ? 'capture' : null });
  }
}

function genCastling(g, from, r, c, side, moves) {
  if (isAttacked(g, from, side)) return;
  const row = side === WHITE ? 7 : 0;
  if (c !== 4 || r !== row) return;
  const ks = side === WHITE ? 'K' : 'k';
  const qs = side === WHITE ? 'Q' : 'q';
  if (g.castling[ks]) {
    const f = sq(row, 5), gs = sq(row, 6);
    if (!g.board[f] && !g.board[gs] && !isAttacked(g, f, side)) {
      moves.push({ from, to: gs, flag: 'castle-k' });
    }
  }
  if (g.castling[qs]) {
    const d = sq(row, 3), cs = sq(row, 2), bs = sq(row, 1);
    if (!g.board[d] && !g.board[cs] && !g.board[bs] && !isAttacked(g, d, side)) {
      moves.push({ from, to: cs, flag: 'castle-q' });
    }
  }
}

function isAttacked(g, target, bySide) {
  const opp = bySide === WHITE ? BLACK : WHITE;
  for (let i = 0; i < 64; i++) {
    const p = g.board[i];
    if (!p || pieceColor(p) !== opp) continue;
    if (attacks(g, i, target, p)) return true;
  }
  return false;
}

function attacks(g, from, target, piece) {
  const type = pieceType(piece);
  const [fr, fc] = rc(from);
  const [tr, tc] = rc(target);
  const dr = tr - fr, dc = tc - fc;
  if (type === PIECE.P) {
    const dir = pieceColor(piece) === WHITE ? -1 : 1;
    return dr === dir && Math.abs(dc) === 1;
  }
  if (type === PIECE.N) {
    return KNIGHT_OFFSETS.some(([r,c]) => fr+r===tr && fc+c===tc);
  }
  if (type === PIECE.K) {
    return Math.abs(dr) <= 1 && Math.abs(dc) <= 1;
  }
  const dirs = type === PIECE.B ? BISHOP_DIRS : type === PIECE.R ? ROOK_DIRS : QUEEN_DIRS;
  for (const [sdr, sdc] of dirs) {
    let r = fr + sdr, c = fc + sdc;
    while (onBoard(r, c)) {
      if (r === tr && c === tc) return true;
      if (g.board[sq(r, c)]) break;
      r += sdr; c += sdc;
    }
  }
  return false;
}

function legalMoves(g) {
  return pseudoLegalMoves(g).filter(m => {
    const undo = MCE.makeMove(g, m);
    const opp = g.turn === WHITE ? BLACK : WHITE;
    const legal = !inCheck(g, opp);
    MCE.unmakeMove(g, undo);
    return legal;
  });
}

function inCheck(g, side) {
  const kingChar = side === WHITE ? 'K' : 'k';
  const kingSq = g.board.indexOf(kingChar);
  if (kingSq < 0) return false;
  return isAttacked(g, kingSq, side);
}

Object.assign(MCE, { pseudoLegalMoves, legalMoves, inCheck, isAttacked });
})();
