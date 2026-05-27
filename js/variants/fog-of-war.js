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
});
