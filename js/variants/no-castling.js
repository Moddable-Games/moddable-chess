'use strict';
MCE.registerVariant('noCastling', {
  label: 'No Castling',
  group: 'Classic',
  rows: 8,
  cols: 8,
  fen: null,
  noCastling: true,
  title: 'No Castling',
  description: 'Standard chess with castling disabled. Endorsed by Vladimir Kramnik and played in elite tournaments. Forces creative king safety solutions.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
