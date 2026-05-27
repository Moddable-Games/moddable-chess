'use strict';
MCE.registerVariant('torpedo', {
  label: 'Torpedo',
  group: 'Classic',
  rows: 8,
  cols: 8,
  fen: null,
  torpedo: true,
  title: 'Torpedo Chess',
  description: 'Pawns can always move two squares forward, not just from their starting rank. Makes pawns far more dynamic and endgames completely different.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
