'use strict';
MCE.registerVariant('maharaja', {
  label: 'Maharaja & Sepoys',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/8/4M3 w kq - 0 1',
  noCastling: true,
  title: 'Maharaja & Sepoys',
  description: 'Extreme asymmetry — White has only a Maharaja (Queen + Knight compound piece) against Black\'s full army. The Maharaja must checkmate Black\'s king alone.',
  rule: 'Board: 8×8 · Win: Checkmate',
  winCondition: function(g) {
    var hasM = g.board.some(function(p) { return p === 'M'; });
    if (!hasM) return 'maharaja-b';
    return null;
  },
});
