'use strict';
MCE.registerVariant('grand', {
  label: 'Grand Chess',
  group: 'Large Boards',
  rows: 10,
  cols: 10,
  fen: 'r8r/1nbqkcbn1/pppppppppp/10/10/10/10/PPPPPPPPPP/1NBQKCBN1/R8R w - - 0 1',
  promotionPieces: ['q', 'r', 'b', 'n', 'a', 'c'],
  pawnStartRow: function(side) { return side === 'w' ? 7 : 2; },
  title: 'Grand Chess',
  description: 'Same new pieces as Capablanca on a larger board. Pawns start on rank 3. No castling. Promotion only to previously captured pieces.',
  rule: 'Board: 10×10 · Win: Checkmate',
});
