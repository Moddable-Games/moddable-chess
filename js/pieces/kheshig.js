import MCE from '../chess-engine.js';

MCE.registerPiece('w', {
  name: 'Kheshig',
  category: 'compound',
  movement: 'One square in any direction (king) or L-shaped jump (knight)',
  capture: null,
  variants: ['ordaChess'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    const kingDirs = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    const knightJumps = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
    const allDirs = kingDirs.concat(knightJumps);
    for (const [dr, dc] of allDirs) {
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
    const dr = Math.abs(tr - fr), dc = Math.abs(tc - fc);
    if (dr <= 1 && dc <= 1 && (dr + dc > 0)) return true;
    return (dr * dc === 2 && dr + dc === 3);
  },
});
