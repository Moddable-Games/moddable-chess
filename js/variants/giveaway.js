'use strict';
MCE.registerVariant('giveaway', {
  label: 'Giveaway',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Giveaway Chess',
  description: 'Captures are mandatory. Lose all your pieces to win. Unlike Antichess, being stalemated means you LOSE (not win). FICS rules.',
  rule: 'Board: 8×8 · Win: Lose all pieces',
  stalemateMeaning: 'loss',
  moveFilter: function(g, moves) {
    var captures = moves.filter(function(m) {
      return g.board[m.to] || m.flag === 'ep';
    });
    return captures.length > 0 ? captures : moves;
  },
  winCondition: function(g) {
    var hasPiece = false;
    for (var i = 0; i < g.board.length; i++) {
      if (g.board[i] && MCE.pieceColor(g.board[i]) === g.turn) {
        hasPiece = true;
        break;
      }
    }
    if (!hasPiece) return 'antichess-' + g.turn;
    return null;
  },
});
