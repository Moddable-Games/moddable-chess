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
  winCondition: function(g) {
    var royalW = g.board.some(function(p) { return p === 'N'; });
    if (!royalW) return 'knightmate-b';
    var royalB = g.board.some(function(p) { return p === 'n'; });
    if (!royalB) return 'knightmate-w';
    return null;
  },
});
