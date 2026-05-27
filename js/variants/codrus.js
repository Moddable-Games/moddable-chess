'use strict';
MCE.registerVariant('codrus', {
  label: 'Codrus',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCastling: true,
  noCheck: true,
  title: 'Codrus',
  description: 'Named after the Athenian king who sacrificed himself. Lose your king to win. No check concept — you must arrange for your own king to be captured.',
  rule: 'Board: 8×8 · Win: Lose your king',
  winCondition: function(g) {
    var hasWhiteK = g.board.some(function(p) { return p === 'K'; });
    if (!hasWhiteK) return 'codrus-w';
    var hasBlackK = g.board.some(function(p) { return p === 'k'; });
    if (!hasBlackK) return 'codrus-b';
    return null;
  },
});
