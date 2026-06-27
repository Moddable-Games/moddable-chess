import MCE from '../chess-engine.js';

MCE.registerPiece('q', {
  name: 'Queen',
  category: 'standard',
  movement: 'Slides any number of squares in any direction (orthogonal + diagonal)',
  capture: null,
  variants: ['standard', 'capablanca', 'grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    MCE.genSlides(g, from, r, c, side, MCE.QUEEN_DIRS, moves);
    return moves;
  },

  attacks(g, from, target) {
    return MCE.slidesTo(g, from, target, MCE.QUEEN_DIRS);
  },
});
