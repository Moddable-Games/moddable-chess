'use strict';
MCE.registerVariant('threeCheck', {
  label: 'Three-Check',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  checkThreshold: 3,
  title: 'Three-Check',
  description: 'Standard rules, but delivering three checks to your opponent wins immediately — no need for checkmate.',
  rule: 'Board: 8×8 · Win: Checkmate or 3 checks',
  winCondition: function(g) {
    if (g.checkCount.w >= 3) return 'checkmate';
    if (g.checkCount.b >= 3) return 'checkmate';
    return null;
  },
});
