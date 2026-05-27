'use strict';
MCE.registerVariant('stalemateWins', {
  label: 'Stalemate Wins',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Stalemate Wins',
  description: 'Standard chess rules but stalemate is a WIN for the stalemating side (not a draw). Completely changes endgame theory.',
  rule: 'Board: 8×8 · Win: Checkmate or stalemate',
  stalemateMeaning: 'win',
});
