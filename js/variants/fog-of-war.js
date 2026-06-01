'use strict';
MCE.registerVariant('fogOfWar', {
  label: 'Fog of War',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Fog of War',
  description: 'You can only see squares your pieces can legally move to. Hidden squares are darkened. No check warnings — you must capture the king to win.',
  rule: 'Board: 8×8 · Win: Capture king',
  visibility: function(g, side) {
    var visible = new Set();
    var total = g.rows * g.cols;
    for (var i = 0; i < total; i++) {
      var p = g.board[i];
      if (!p || MCE.pieceColor(p) !== side) continue;
      visible.add(i);
    }
    var tempG = Object.assign({}, g, { turn: side });
    var moves = MCE.pseudoLegalMoves(tempG);
    for (var j = 0; j < moves.length; j++) {
      visible.add(moves[j].to);
    }
    return visible;
  },
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var myActivity = 0, oppActivity = 0;
    var total = g.rows * g.cols;
    for (var i = 0; i < total; i++) {
      var p = g.board[i];
      if (!p) continue;
      if (MCE.pieceColor(p) === g.turn) {
        var rc = MCE.rc(i, g);
        var centerDist = Math.abs(rc[0] - 3.5) + Math.abs(rc[1] - 3.5);
        myActivity += (7 - centerDist) * 10;
      }
    }
    return material + myActivity;
  },
  winCondition: function(g) {
    var whiteKing = false, blackKing = false;
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
