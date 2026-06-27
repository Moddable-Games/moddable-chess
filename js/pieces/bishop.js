import MCE from '../chess-engine.js';

MCE.registerPiece('b', {
  name: 'Bishop',
  category: 'standard',
  movement: 'Slides any number of squares diagonally',
  capture: null,
  variants: ['standard', 'capablanca', 'grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    MCE.genSlides(g, from, r, c, side, MCE.BISHOP_DIRS, moves);
    return moves;
  },

  attacks(g, from, target) {
    return MCE.slidesTo(g, from, target, MCE.BISHOP_DIRS);
  },
});
