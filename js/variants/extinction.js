'use strict';
MCE.registerVariant('extinction', {
  label: 'Extinction Chess',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Extinction Chess',
  description: 'You lose when any one piece type is completely eliminated from your army. Protecting your last bishop matters more than protecting your king.',
  rule: 'Board: 8×8 · Win: Eliminate a piece type',
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var myCounts = {}, oppCounts = {};
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      var t = MCE.pieceType(p);
      if (MCE.pieceColor(p) === g.turn) {
        myCounts[t] = (myCounts[t] || 0) + 1;
      } else {
        oppCounts[t] = (oppCounts[t] || 0) + 1;
      }
    }
    var score = material;
    var types = ['p', 'n', 'b', 'r', 'q', 'k'];
    for (var j = 0; j < types.length; j++) {
      var tt = types[j];
      if ((myCounts[tt] || 0) === 1) score -= 400;
      if ((oppCounts[tt] || 0) === 1) score += 300;
      if ((oppCounts[tt] || 0) === 0) score = 100000;
      if ((myCounts[tt] || 0) === 0) score = -100000;
    }
    return score;
  },
  winCondition: function(g) {
    var initial = ['p', 'n', 'b', 'r', 'q', 'k'];
    var currentW = {};
    var currentB = {};
    var i, p, t;
    for (i = 0; i < g.board.length; i++) {
      p = g.board[i];
      if (!p) continue;
      t = MCE.pieceType(p);
      if (MCE.pieceColor(p) === MCE.WHITE) {
        currentW[t] = true;
      } else {
        currentB[t] = true;
      }
    }
    for (i = 0; i < initial.length; i++) {
      t = initial[i];
      if (!currentW[t]) return 'extinction-b';
      if (!currentB[t]) return 'extinction-w';
    }
    return null;
  },
});
