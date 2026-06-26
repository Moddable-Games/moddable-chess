import MCE from '../chess-engine.js';

MCE.registerPiece('y', {
  name: 'Yurt',
  category: 'fairy',
  movement: 'One square diagonally in any direction',
  capture: 'One square orthogonally (forward, backward, left, right)',
  variants: ['ordaChess'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const moveDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of moveDirs) {
      const nr = r + dr, nc = c + dc;
      if (!MCE.onBoard(nr, nc, g)) continue;
      const target = MCE.sq(nr, nc, g);
      if (g.board[target]) continue;
      moves.push({ from, to: target, flag: null });
    }
    const capDirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];
    for (const [dr, dc] of capDirs) {
      const nr = r + dr, nc = c + dc;
      if (!MCE.onBoard(nr, nc, g)) continue;
      const target = MCE.sq(nr, nc, g);
      if (g.board[target] && MCE.isEnemy(target, side, g)) {
        moves.push({ from, to: target, flag: 'capture' });
      }
    }
    return moves;
  },

  attacks(g, from, target) {
    const [fr, fc] = MCE.rc(from, g);
    const [tr, tc] = MCE.rc(target, g);
    const dr = Math.abs(tr - fr), dc = Math.abs(tc - fc);
    return (dr + dc === 1);
  },
});
