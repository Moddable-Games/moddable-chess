'use strict';
MCE.registerVariant('knightmate', {
  label: 'Knightmate',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: 'rkbqnbkr/pppppppp/8/8/8/8/PPPPPPPP/RKBQNBKR w KQkq - 0 1',
  royalPiece: 'n',
  pieceRoles: { n: 'k', k: 'n' },
  title: 'Knightmate',
  description: 'The roles of king and knight are swapped. The knight is the royal piece that must be checkmated, while the king moves like a knight and is expendable.',
  rule: 'Board: 8×8 · Win: Checkmate knight',
  evaluate: function(g, defaultEval) {
    var material = defaultEval(g);
    var myRoyalSq = -1, oppRoyalSq = -1;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      if ((p === 'N' && g.turn === MCE.WHITE) || (p === 'n' && g.turn === MCE.BLACK)) myRoyalSq = i;
      if ((p === 'N' && g.turn === MCE.BLACK) || (p === 'n' && g.turn === MCE.WHITE)) oppRoyalSq = i;
    }
    var score = material;
    if (myRoyalSq >= 0) {
      var rc = MCE.rc(myRoyalSq, g);
      var edgeDist = Math.min(rc[0], 7 - rc[0], rc[1], 7 - rc[1]);
      score += edgeDist * 30;
    }
    if (oppRoyalSq >= 0) {
      var rc2 = MCE.rc(oppRoyalSq, g);
      var edgeDist2 = Math.min(rc2[0], 7 - rc2[0], rc2[1], 7 - rc2[1]);
      score -= edgeDist2 * 30;
    }
    return score;
  },
  winCondition: function(g) {
    var royalW = g.board.some(function(p) { return p === 'N'; });
    if (!royalW) return 'knightmate-b';
    var royalB = g.board.some(function(p) { return p === 'n'; });
    if (!royalB) return 'knightmate-w';
    return null;
  },
});
