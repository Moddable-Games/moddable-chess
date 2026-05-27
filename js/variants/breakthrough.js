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
