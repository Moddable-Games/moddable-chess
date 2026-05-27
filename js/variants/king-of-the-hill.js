'use strict';
MCE.registerVariant('kingOfTheHill', {
  label: 'King of the Hill',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'King of the Hill',
  description: 'Standard rules, plus an instant win if your king reaches any of the four centre squares (d4, d5, e4, e5).',
  rule: 'Board: 8×8 · Win: Checkmate or king reaches centre',
  winCondition: function(g) {
    var center = [27, 28, 35, 36];
    for (var i = 0; i < center.length; i++) {
      var p = g.board[center[i]];
      if (p && MCE.pieceType(p) === 'k') {
        var winner = MCE.pieceColor(p);
        if (winner !== g.turn) return 'koth-' + winner;
      }
    }
    return null;
  },
});
