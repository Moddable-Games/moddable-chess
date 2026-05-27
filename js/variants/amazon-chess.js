'use strict';
MCE.registerVariant('amazonChess', {
  label: 'Amazon Chess',
  group: 'Classic',
  rows: 8,
  cols: 8,
  fen: 'rnbmkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBMKBNR w KQkq - 0 1',
  title: 'Amazon Chess',
  description: 'Both sides have an Amazon (Queen + Knight compound) instead of a regular Queen. The most powerful piece in fairy chess on a standard board.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
