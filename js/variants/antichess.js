'use strict';
MCE.registerVariant('antichess', {
  label: 'Antichess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Antichess',
  description: 'Captures are mandatory. The goal is to lose all your pieces. No check, no castling — the king is just another piece.',
  rule: 'Board: 8×8 · Win: Lose all pieces or get stalemated',
  stalemateMeaning: 'win',
  moveFilter: function(g, moves) {
    var captures = moves.filter(function(m) {
      return g.board[m.to] || m.flag === 'ep';
    });
    return captures.length > 0 ? captures : moves;
  },
  evaluate: function(g) {
    var score = 0;
    var myCount = 0, oppCount = 0;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      if (MCE.pieceColor(p) === g.turn) myCount++;
      else oppCount++;
    }
    score = (oppCount - myCount) * 200;
    if (myCount === 0) score = 100000;
    return score;
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
