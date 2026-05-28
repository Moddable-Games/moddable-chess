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
