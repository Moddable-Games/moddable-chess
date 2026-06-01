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
  evaluate: function(g) {
    var myKingRank = 7, oppKingRank = 7;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (p && MCE.pieceType(p) === 'k') {
        var rank = MCE.rc(i, g)[0];
        if (MCE.pieceColor(p) === g.turn) myKingRank = rank;
        else oppKingRank = rank;
      }
    }
    var score = (oppKingRank - myKingRank) * 300;
    if (myKingRank === 0) score = 100000;
    if (oppKingRank === 0) score = -100000;
    return score;
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
