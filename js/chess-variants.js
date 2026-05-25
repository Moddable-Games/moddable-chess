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
  noCastling: { label: 'No Castling' },
  torpedo: { label: 'Torpedo Chess' },
  horde: { label: 'Horde Chess' },
  extinction: { label: 'Extinction Chess' },
  breakthrough: { label: 'Breakthrough' },
  maharaja: { label: 'Maharaja' },
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
  if (v === 'horde') {
    const whiteHasPieces = g.board.some(p => p && pieceColor(p) === WHITE);
    if (!whiteHasPieces) return 'horde-b';
    if (g.turn === WHITE) {
      const moves = legalMoves(g);
      if (moves.length === 0) return 'horde-b';
    }
  }
  if (v === 'extinction') {
    const initial = { w: new Set(['p','n','b','r','q','k']), b: new Set(['p','n','b','r','q','k']) };
    const current = { w: new Set(), b: new Set() };
    for (const p of g.board) {
      if (!p) continue;
      current[pieceColor(p)].add(pieceType(p));
    }
    for (const side of [WHITE, BLACK]) {
      for (const t of initial[side]) {
        if (!current[side].has(t)) return 'extinction-' + (side === WHITE ? 'b' : 'w');
      }
    }
  }
  if (v === 'breakthrough') {
    for (let c = 0; c < g.cols; c++) {
      const topPiece = g.board[sq(0, c, g)];
      if (topPiece === 'P') return 'breakthrough-w';
      const botPiece = g.board[sq(g.rows - 1, c, g)];
      if (botPiece === 'p') return 'breakthrough-b';
    }
    const whiteHas = g.board.some(p => p && pieceColor(p) === WHITE);
    if (!whiteHas) return 'breakthrough-b';
    const blackHas = g.board.some(p => p && pieceColor(p) === BLACK);
    if (!blackHas) return 'breakthrough-w';
  }
  if (v === 'maharaja') {
    const hasM = g.board.some(p => p === 'M');
    if (!hasM) return 'maharaja-b';
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

// Maharaja piece (Queen + Knight compound)
const QUEEN_DIRS = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];
const KNIGHT_JUMPS = [[-2,-1],[-2,1],[-1,-2],[-1,2],[1,-2],[1,2],[2,-1],[2,1]];

MCE.registerPiece('m', {
  genMoves: function(g, from, side) {
    const moves = [];
    const [r, c] = rc(from, g);
    for (const [dr, dc] of QUEEN_DIRS) {
      let nr = r + dr, nc = c + dc;
      while (onBoard(nr, nc, g)) {
        const target = sq(nr, nc, g);
        const tp = g.board[target];
        if (tp) {
          if (pieceColor(tp) !== side) moves.push({ from, to: target, flag: null });
          break;
        }
        moves.push({ from, to: target, flag: null });
        nr += dr; nc += dc;
      }
    }
    for (const [dr, dc] of KNIGHT_JUMPS) {
      const nr = r + dr, nc = c + dc;
      if (!onBoard(nr, nc, g)) continue;
      const target = sq(nr, nc, g);
      const tp = g.board[target];
      if (!tp || pieceColor(tp) !== side) moves.push({ from, to: target, flag: null });
    }
    return moves;
  },
  attacks: function(g, from, target) {
    const [fr, fc] = rc(from, g);
    const [tr, tc] = rc(target, g);
    const dr = tr - fr, dc = tc - fc;
    if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true;
    if (dr === 0 && dc === 0) return false;
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      let cr = fr + stepR, cc = fc + stepC;
      while (cr !== tr || cc !== tc) {
        if (g.board[sq(cr, cc, g)]) return false;
        cr += stepR; cc += stepC;
      }
      return true;
    }
    return false;
  }
});

Object.assign(MCE, { VARIANTS, getVariantStatus, variantLegalMoves, randomFEN960 });
})();
