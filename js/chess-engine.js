'use strict';
/**
 * Moddable Chess Engine — core game logic
 * Zero dependencies. Handles board state, legal moves, check/checkmate.
 */

const MCE = (function() {

const PIECE = { P: 'p', N: 'n', B: 'b', R: 'r', Q: 'q', K: 'k' };
const WHITE = 'w', BLACK = 'b';

const INITIAL_FEN = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';

function createGame(variant) {
  const g = {
    board: Array(64).fill(null),
    turn: WHITE,
    castling: { K: true, Q: true, k: true, q: true },
    enPassant: -1,
    halfmove: 0,
    fullmove: 1,
    history: [],
    variant: variant || 'standard',
    checkCount: { w: 0, b: 0 },
    movesThisTurn: 0,
    duckSq: -1,
    duckPhase: false,
    status: 'active',
  };
  loadFEN(g, INITIAL_FEN);
  return g;
}

// Board indexing: 0=a8, 1=b8, ... 7=h8, 8=a7 ... 63=h1
function rc(sq) { return [sq >> 3, sq & 7]; }
function sq(r, c) { return r * 8 + c; }
function onBoard(r, c) { return r >= 0 && r < 8 && c >= 0 && c < 8; }

function pieceColor(p) { return p === p.toUpperCase() ? WHITE : BLACK; }
function pieceType(p) { return p.toLowerCase(); }

function loadFEN(g, fen) {
  const parts = fen.split(' ');
  const rows = parts[0].split('/');
  g.board.fill(null);
  for (let r = 0; r < 8; r++) {
    let c = 0;
    for (const ch of rows[r]) {
      if (ch >= '1' && ch <= '8') c += parseInt(ch);
      else { g.board[sq(r, c)] = ch; c++; }
    }
  }
  g.turn = parts[1] === 'b' ? BLACK : WHITE;
  const cas = parts[2] || '-';
  g.castling = { K: cas.includes('K'), Q: cas.includes('Q'), k: cas.includes('k'), q: cas.includes('q') };
  g.enPassant = parts[3] && parts[3] !== '-' ? algebraicToSq(parts[3]) : -1;
  g.halfmove = parseInt(parts[4]) || 0;
  g.fullmove = parseInt(parts[5]) || 1;
}

function toFEN(g) {
  let fen = '';
  for (let r = 0; r < 8; r++) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const p = g.board[sq(r, c)];
      if (!p) { empty++; }
      else { if (empty) { fen += empty; empty = 0; } fen += p; }
    }
    if (empty) fen += empty;
    if (r < 7) fen += '/';
  }
  fen += ' ' + g.turn;
  let cas = '';
  if (g.castling.K) cas += 'K'; if (g.castling.Q) cas += 'Q';
  if (g.castling.k) cas += 'k'; if (g.castling.q) cas += 'q';
  fen += ' ' + (cas || '-');
  fen += ' ' + (g.enPassant >= 0 ? sqToAlgebraic(g.enPassant) : '-');
  fen += ' ' + g.halfmove + ' ' + g.fullmove;
  return fen;
}

function algebraicToSq(s) { return sq(8 - parseInt(s[1]), s.charCodeAt(0) - 97); }
function sqToAlgebraic(i) { const [r, c] = rc(i); return String.fromCharCode(97 + c) + (8 - r); }

return { PIECE, WHITE, BLACK, INITIAL_FEN, createGame, loadFEN, toFEN, rc, sq, onBoard, pieceColor, pieceType, algebraicToSq, sqToAlgebraic };
})();
