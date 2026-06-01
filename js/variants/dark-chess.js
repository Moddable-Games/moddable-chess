'use strict';
MCE.registerVariant('darkChess', {
  label: 'Dark Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Dark Chess',
  description: 'Complete fog of war — you can only see squares occupied by your own pieces. Enemy pieces are invisible. No check warnings; capture the opponent\'s king to win.',
  rule: 'Board: 8×8 · Win: Capture king',
  visibility: function(g, side) {
    var visible = new Set();
    var total = g.rows * g.cols;
    for (var i = 0; i < total; i++) {
      var p = g.board[i];
      if (p && MCE.pieceColor(p) === side) {
        visible.add(i);
      }
    }
    return visible;
  },
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var myActivity = 0;
    var total = g.rows * g.cols;
    for (var i = 0; i < total; i++) {
      var p = g.board[i];
      if (!p || MCE.pieceColor(p) !== g.turn) continue;
      var rc = MCE.rc(i, g);
      var centerDist = Math.abs(rc[0] - 3.5) + Math.abs(rc[1] - 3.5);
      myActivity += (7 - centerDist) * 10;
    }
    return material + myActivity;
  },
  winCondition: function(g) {
    var whiteKing = false;
    var blackKing = false;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      if (MCE.pieceType(p) === 'k') {
        if (MCE.pieceColor(p) === MCE.WHITE) whiteKing = true;
        else blackKing = true;
      }
    }
    if (!whiteKing) return 'checkmate';
    if (!blackKing) return 'checkmate';
    return null;
  },
});
