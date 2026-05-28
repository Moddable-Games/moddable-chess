'use strict';
MCE.registerVariant('shatar', {
  label: 'Shatar',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Shatar (Mongolian Chess)',
  description: 'Mongolian chess where check does not exist. You win by leaving the opponent with a bare king — their last remaining piece. Standard moves otherwise.',
  rule: 'Board: 8×8 · Win: Bare king',
  winCondition: function(g) {
    var wCount = 0, bCount = 0;
    for (var i = 0; i < g.board.length; i++) {
      if (!g.board[i]) continue;
      if (MCE.pieceColor(g.board[i]) === MCE.WHITE) wCount++;
      else bCount++;
    }
    if (wCount === 1) return 'shatar-b';
    if (bCount === 1) return 'shatar-w';
    return null;
  },
});
