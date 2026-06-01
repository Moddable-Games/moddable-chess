'use strict';
MCE.registerVariant('breakthrough', {
  label: 'Breakthrough',
  group: 'Small Boards',
  rows: 7,
  cols: 7,
  fen: 'ppppppp/ppppppp/7/7/7/PPPPPPP/PPPPPPP w - - 0 1',
  noCastling: true,
  noEnPassant: true,
  noPromotion: true,
  title: 'Breakthrough',
  description: 'Only pawns on a 7×7 board. First to reach the far rank wins. No promotion — just push through. Simple to learn, deep to master. Used in AI competitions.',
  rule: 'Board: 7×7 · Win: Reach far rank',
  evaluate: function(g) {
    var score = 0;
    var myCount = 0, oppCount = 0;
    var rows = g.rows;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      var rank = MCE.rc(i, g)[0];
      if (MCE.pieceColor(p) === g.turn) {
        myCount++;
        var advancement = (g.turn === MCE.WHITE) ? (rows - 1 - rank) : rank;
        score += advancement * 50 + 30;
        if (advancement >= rows - 2) score += 500;
      } else {
        oppCount++;
        var oppAdv = (g.turn === MCE.WHITE) ? rank : (rows - 1 - rank);
        score -= oppAdv * 50 + 30;
        if (oppAdv >= rows - 2) score -= 500;
      }
    }
    score += (myCount - oppCount) * 20;
    return score;
  },
  winCondition: function(g) {
    var c;
    for (c = 0; c < g.cols; c++) {
      if (g.board[MCE.sq(0, c, g)] === 'P') return 'breakthrough-w';
      if (g.board[MCE.sq(g.rows - 1, c, g)] === 'p') return 'breakthrough-b';
    }
    var whiteHas = g.board.some(function(p) {
      return p && MCE.pieceColor(p) === MCE.WHITE;
    });
    if (!whiteHas) return 'breakthrough-b';
    var blackHas = g.board.some(function(p) {
      return p && MCE.pieceColor(p) === MCE.BLACK;
    });
    if (!blackHas) return 'breakthrough-w';
    return null;
  },
});
