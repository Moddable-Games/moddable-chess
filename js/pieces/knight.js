import MCE from '../chess-engine.js';

MCE.registerPiece('n', {
  name: 'Knight',
  category: 'standard',
  movement: 'L-shaped jump: two squares in one direction, one square perpendicular',
  capture: null,
  variants: ['standard', 'capablanca', 'grand'],

  genMoves(g, from, side) {
    const moves = [];
    const [r, c] = MCE.rc(from, g);
    MCE.genJumps(g, from, r, c, side, MCE.KNIGHT_OFFSETS, moves);
    return moves;
  },

  attacks(g, from, target) {
    const [fr, fc] = MCE.rc(from, g);
    const [tr, tc] = MCE.rc(target, g);
    return MCE.KNIGHT_OFFSETS.some(([dr, dc]) => fr + dr === tr && fc + dc === tc);
  },
});
