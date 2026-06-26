import MCE from '../chess-engine.js';

MCE.registerPiece('s', {
  name: 'Sage',
  category: 'compound',
  movement: 'One square in any direction (like king, but not royal)',
  capture: null,
  variants: ['grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const dirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
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
    return Math.abs(tr - fr) <= 1 && Math.abs(tc - fc) <= 1 && (fr !== tr || fc !== tc);
  },
});
