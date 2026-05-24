'use strict';
/**
 * Variant rule modifiers — extends MCE
 */
(function() {

const { WHITE, BLACK, rc, sq, onBoard, pieceColor, pieceType, inCheck, legalMoves, makeMove, unmakeMove } = MCE;

const VARIANTS = {
  standard: { label: 'Regular Chess' },
  kingOfTheHill: { label: 'King of the Hill' },
  threeCheck: { label: 'Three-Check' },
  antichess: { label: 'Antichess' },
  racingKings: { label: 'Racing Kings' },
  fogOfWar: { label: 'Fog of War' },
  atomic: { label: 'Atomic' },
  duckChess: { label: 'Duck Chess' },
  rifle: { label: 'Rifle Chess' },
  marseillais: { label: 'Marseillais' },
  chess960: { label: 'Fischer Random' },
};

function getVariantStatus(g) {
  const v = g.variant;
  if (v === 'kingOfTheHill') {
    const center = [27, 28, 35, 36]; // d4,e4,d5,e5
    for (const s of center) {
      const p = g.board[s];
      if (p && pieceType(p) === 'k') {
        const winner = pieceColor(p);
        if (winner !== g.turn) return 'koth-' + winner;
      }
    }
  }
  if (v === 'threeCheck') {
    if (g.checkCount.w >= 3) return 'checkmate';
    if (g.checkCount.b >= 3) return 'checkmate';
  }
  if (v === 'racingKings') {
    for (let c = 0; c < 8; c++) {
      const p = g.board[sq(0, c)];
      if (p && pieceType(p) === 'k') {
        const winner = pieceColor(p);
        if (winner !== g.turn) return 'race-' + winner;
      }
    }
  }
  if (v === 'antichess') {
    const side = g.turn;
    const hasPieces = g.board.some(p => p && pieceColor(p) === side);
    if (!hasPieces) return 'antichess-' + side;
  }
  return null;
}

function variantLegalMoves(g) {
  const v = g.variant;
  let moves = legalMoves(g);

  if (v === 'antichess') {
    const captures = moves.filter(m => g.board[m.to] || m.flag === 'ep');
    if (captures.length > 0) moves = captures;
  }

  if (v === 'racingKings') {
    moves = moves.filter(m => {
      const undo = makeMove(g, m);
      const opp = g.turn;
      const legal = !inCheck(g, opp);
      unmakeMove(g, undo);
      return legal;
    });
  }

  return moves;
}

function randomFEN960() {
  const pieces = Array(8).fill(null);
  const empty = () => pieces.map((p,i) => p===null ? i : -1).filter(i => i>=0);
  // Bishops on opposite colors
  const darkSqs = [0,2,4,6], lightSqs = [1,3,5,7];
  pieces[darkSqs[Math.floor(Math.random()*4)]] = 'b';
  pieces[lightSqs[Math.floor(Math.random()*4)]] = 'b';
  // Queen on random empty
  let e = empty(); pieces[e[Math.floor(Math.random()*e.length)]] = 'q';
  // Knights on random empty
  e = empty(); pieces[e[Math.floor(Math.random()*e.length)]] = 'n';
  e = empty(); pieces[e[Math.floor(Math.random()*e.length)]] = 'n';
  // Remaining 3 squares: R K R (king between rooks)
  e = empty();
  pieces[e[0]] = 'r'; pieces[e[1]] = 'k'; pieces[e[2]] = 'r';

  const blackRank = pieces.join('');
  const whiteRank = blackRank.toUpperCase();
  return blackRank + '/pppppppp/8/8/8/8/PPPPPPPP/' + whiteRank + ' w KQkq - 0 1';
}

Object.assign(MCE, { VARIANTS, getVariantStatus, variantLegalMoves, randomFEN960 });
})();
