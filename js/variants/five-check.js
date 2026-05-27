'use strict';
MCE.registerVariant('fiveCheck', {
  label: 'Five-Check',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  checkThreshold: 5,
  title: 'Five-Check',
  description: 'Like Three-Check but you need five checks to win. More strategic than Single-Check, more aggressive than standard.',
  rule: 'Board: 8×8 · Win: 5 checks or checkmate',
  winCondition: function(g) {
    if (g.checkCount.w >= 5) return 'checkmate';
    if (g.checkCount.b >= 5) return 'checkmate';
    return null;
  },
});
