'use strict';
MCE.registerVariant('racingKings', {
  label: 'Racing Kings',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1',
  noCastling: true,
  title: 'Racing Kings',
  description: 'No checks allowed at any point. Both sides race their king to rank 8. First to arrive wins.',
  rule: 'Board: 8×8 · Win: King reaches rank 8',
  winCondition: function(g) {
    for (var c = 0; c < 8; c++) {
      var p = g.board[MCE.sq(0, c, g)];
      if (p && MCE.pieceType(p) === 'k') {
        var winner = MCE.pieceColor(p);
        if (winner !== g.turn) return 'race-' + winner;
      }
    }
    return null;
  },
  moveFilter: function(g, moves) {
    return moves.filter(function(m) {
      var undo = MCE.makeMove(g, m);
      var oppSide = g.turn;
      var movingSide = oppSide === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
      var legal = !MCE.inCheck(g, oppSide) && !MCE.inCheck(g, movingSide);
      MCE.unmakeMove(g, undo);
      return legal;
    });
  },
});
