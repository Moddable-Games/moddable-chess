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
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var mySide = g.turn === MCE.WHITE ? 'b' : 'w';
    var oppSide = g.turn === MCE.WHITE ? 'w' : 'b';
    var myChecks = g.checkCount[mySide] || 0;
    var oppChecks = g.checkCount[oppSide] || 0;
    return material + myChecks * 400 - oppChecks * 400;
  },
  winCondition: function(g) {
    if (g.checkCount.w >= 3) return 'checkmate';
    if (g.checkCount.b >= 3) return 'checkmate';
    return null;
  },
});
