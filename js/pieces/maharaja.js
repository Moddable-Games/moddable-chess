import MCE from '../chess-engine.js';

MCE.registerPiece('m', {
  name: 'Maharaja',
  category: 'compound',
  movement: 'Slides in any direction (queen) and L-shaped jump (knight)',
  capture: null,
  variants: ['maharaja'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const queenDirs = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of queenDirs) {
      let nr = r + dr, nc = c + dc;
      while (MCE.onBoard(nr, nc, g)) {
        const target = MCE.sq(nr, nc, g);
        const tp = g.board[target];
        if (tp) {
          if (MCE.pieceColor(tp) !== side) moves.push({ from, to: target, flag: 'capture' });
          break;
        }
        moves.push({ from, to: target, flag: null });
        nr += dr; nc += dc;
      }
    }
    const knightJumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of knightJumps) {
      const nr = r + dr, nc = c + dc;
      if (!MCE.onBoard(nr, nc, g)) continue;
      const target = MCE.sq(nr, nc, g);
      const tp = g.board[target];
      if (tp) {
        if (MCE.pieceColor(tp) !== side) moves.push({ from, to: target, flag: 'capture' });
      } else {
        moves.push({ from, to: target, flag: null });
      }
    }
    return moves;
  },

  attacks(g, from, target) {
    const [fr, fc] = MCE.rc(from, g);
    const [tr, tc] = MCE.rc(target, g);
    const dr = tr - fr, dc = tc - fc;
    if ((Math.abs(dr) === 2 && Math.abs(dc) === 1) || (Math.abs(dr) === 1 && Math.abs(dc) === 2)) return true;
    if (dr === 0 && dc === 0) return false;
    if (dr === 0 || dc === 0 || Math.abs(dr) === Math.abs(dc)) {
      const stepR = dr === 0 ? 0 : dr / Math.abs(dr);
      const stepC = dc === 0 ? 0 : dc / Math.abs(dc);
      let cr = fr + stepR, cc = fc + stepC;
      while (cr !== tr || cc !== tc) {
        if (g.board[MCE.sq(cr, cc, g)]) return false;
        cr += stepR; cc += stepC;
      }
      return true;
    }
    return false;
  },
});
