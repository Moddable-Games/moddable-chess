import MCE from '../chess-engine.js';

MCE.registerPiece('r', {
  name: 'Rook',
  category: 'standard',
  movement: 'Slides any number of squares orthogonally',
  capture: null,
  variants: ['standard', 'capablanca', 'grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    MCE.genSlides(g, from, r, c, side, MCE.ROOK_DIRS, moves);
    return moves;
  },

  attacks(g, from, target) {
    return MCE.slidesTo(g, from, target, MCE.ROOK_DIRS);
  },
});
