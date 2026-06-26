import MCE from '../chess-engine.js';

MCE.registerPiece('e', {
  name: 'Elephant',
  category: 'fairy',
  movement: 'Leaps exactly two squares diagonally (no blocking)',
  capture: null,
  variants: ['chaturanga'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const dirs = [[-2, -2], [-2, 2], [2, -2], [2, 2]];
    for (const [dr, dc] of dirs) {
      let nr = r + dr, nc = c + dc;
      [nr, nc] = MCE.wrapCoords(nr, nc, g);
      if (!MCE.onBoard(nr, nc, g)) continue;
      const target = MCE.sq(nr, nc, g);
      if (g.board[target] && MCE.isFriendly(target, side, g)) continue;
      moves.push({ from, to: target, flag: g.board[target] ? 'capture' : null });
    }
    return moves;
  },

  attacks(g, from, target) {
    const [fr, fc] = MCE.rc(from, g);
    const [tr, tc] = MCE.rc(target, g);
    return Math.abs(tr - fr) === 2 && Math.abs(tc - fc) === 2;
  },
});
