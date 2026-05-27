'use strict';
MCE.registerVariant('omnicide', {
  label: 'Omnicide Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Omnicide Chess',
  description: 'The goal is to lose all your pieces. Unlike Antichess, captures are NOT forced — you choose freely. The king is just another piece (no check).',
  rule: 'Board: 8×8 · Win: Lose all pieces',
  winCondition: function(g) {
    var hasPiece = false;
    for (var i = 0; i < g.board.length; i++) {
      if (g.board[i] && MCE.pieceColor(g.board[i]) === g.turn) {
        hasPiece = true;
        break;
      }
    }
    if (!hasPiece) return 'omnicide-' + g.turn;
    return null;
  },
});
