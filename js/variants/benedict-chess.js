'use strict';
MCE.registerVariant('benedictChess', {
  label: 'Benedict',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Benedict Chess',
  description: 'Pieces never capture — instead, after your move, any enemy piece your moved piece now attacks is converted to your colour. Win by converting the opponent\'s king.',
  rule: 'Board: 8×8 · Win: Convert king',
  afterMove: function(g, move, undo) {
    var piece = g.board[move.to];
    if (!piece) return;
    var side = MCE.pieceColor(piece);
    var opp = side === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
    var tempG = Object.assign({}, g, { turn: side });
    tempG.board = g.board;
    var moves = MCE.pseudoLegalMoves(tempG);
    var attacked = new Set();
    for (var i = 0; i < moves.length; i++) {
      if (moves[i].from === move.to) {
        attacked.add(moves[i].to);
      }
    }
    undo.flipped = [];
    attacked.forEach(function(sq) {
      var target = g.board[sq];
      if (target && MCE.pieceColor(target) === opp) {
        undo.flipped.push({ sq: sq, piece: target });
        if (target === target.toUpperCase()) {
          g.board[sq] = target.toLowerCase();
        } else {
          g.board[sq] = target.toUpperCase();
        }
      }
    });
  },
  restoreState: function(g, undo) {
    if (undo.flipped) {
      for (var i = 0; i < undo.flipped.length; i++) {
        g.board[undo.flipped[i].sq] = undo.flipped[i].piece;
      }
    }
  },
  winCondition: function(g) {
    var whiteKing = false;
    var blackKing = false;
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      if (MCE.pieceType(p) === 'k') {
        if (MCE.pieceColor(p) === MCE.WHITE) whiteKing = true;
        else blackKing = true;
      }
    }
    if (!whiteKing) return 'checkmate';
    if (!blackKing) return 'checkmate';
    return null;
  },
});
