'use strict';
MCE.registerVariant('singleCheck', {
  label: 'Single-Check',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  checkThreshold: 1,
  title: 'Single-Check',
  description: 'Deliver just one check to win instantly. Ultra-aggressive variant where every move is a potential game-ender. King safety is everything.',
  rule: 'Board: 8×8 · Win: One check',
  winCondition: function(g) {
    if (g.checkCount.w >= 1) return 'checkmate';
    if (g.checkCount.b >= 1) return 'checkmate';
    return null;
  },
});
