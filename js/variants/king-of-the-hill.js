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
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var myKingSq = -1, oppKingSq = -1;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (p && MCE.pieceType(p) === 'k') {
        if (MCE.pieceColor(p) === g.turn) myKingSq = i;
        else oppKingSq = i;
      }
    }
    var score = material;
    if (myKingSq >= 0) {
      var rc = MCE.rc(myKingSq, g);
      var distR = Math.abs(rc[0] - 3.5);
      var distC = Math.abs(rc[1] - 3.5);
      var myDist = distR + distC;
      score += (7 - myDist) * 150;
    }
    if (oppKingSq >= 0) {
      var rc2 = MCE.rc(oppKingSq, g);
      var distR2 = Math.abs(rc2[0] - 3.5);
      var distC2 = Math.abs(rc2[1] - 3.5);
      var oppDist = distR2 + distC2;
      score -= (7 - oppDist) * 150;
    }
    return score;
  },
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
