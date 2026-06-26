import MCE from '../chess-engine.js';

MCE.registerPiece('c', {
  name: 'Chancellor',
  category: 'compound',
  movement: 'Slides orthogonally (rook) and L-shaped jump (knight)',
  capture: null,
  variants: ['capablanca', 'grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const rookDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of rookDirs) {
      let nr = r + dr, nc = c + dc;
      while (MCE.onBoard(nr, nc, g)) {
        const target = MCE.sq(nr, nc, g);
        const tp = g.board[target];
        if (tp) {
          if (!MCE.isFriendly(target, side, g)) moves.push({ from, to: target, flag: 'capture' });
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
      if (g.board[target] && MCE.isFriendly(target, side, g)) continue;
      if (g.board[target]) moves.push({ from, to: target, flag: 'capture' });
      else moves.push({ from, to: target, flag: null });
    }
    return moves;
  },

  attacks(g, from, target) {
    const [fr, fc] = MCE.rc(from, g);
    const [tr, tc] = MCE.rc(target, g);
    const dr = Math.abs(tr - fr), dc = Math.abs(tc - fc);
    if (dr * dc === 2 && dr + dc === 3) return true;
    if (dr === 0 && dc === 0) return false;
    if (dr === 0 || dc === 0) return MCE.slidesTo(g, from, target, [[-1, 0], [1, 0], [0, -1], [0, 1]]);
    return false;
  },
});
