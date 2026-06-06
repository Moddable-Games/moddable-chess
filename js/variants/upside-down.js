'use strict';
MCE.registerVariant('upsideDown', {
  group: 'Classic',
  label: 'Upside-Down',
  group: 'Classic',
  rows: 8,
  cols: 8,
  fen: 'RNBQKBNR/PPPPPPPP/8/8/8/8/pppppppp/rnbqkbnr w KQkq - 0 1',
  noCastling: true,
  pawnDirection: function(side) { return side === 'w' ? 1 : -1; },
  title: 'Upside-Down Chess',
  description: 'Pieces start on the opponent\'s back rank — white pieces on rank 8, black on rank 1. Pawns march \'backward\' toward promotion. Chaotic opening.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
