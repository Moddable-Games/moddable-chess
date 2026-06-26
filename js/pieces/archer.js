import MCE from '../chess-engine.js';

MCE.registerPiece('h', {
  name: 'Archer',
  category: 'fairy',
  movement: 'Slides any number of squares diagonally (like bishop)',
  capture: 'L-shaped jump (like knight)',
  variants: ['ordaChess'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const moveDirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
    for (const [dr, dc] of moveDirs) {
      let nr = r + dr, nc = c + dc;
      while (MCE.onBoard(nr, nc, g)) {
        const target = MCE.sq(nr, nc, g);
        if (g.board[target]) break;
        moves.push({ from, to: target, flag: null });
        nr += dr; nc += dc;
      }
    }
    const capOffsets = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    for (const [dr, dc] of capOffsets) {
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
    return (dr * dc === 2 && dr + dc === 3);
  },
});
