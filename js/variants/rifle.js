'use strict';
MCE.registerVariant('rifle', {
  label: 'Rifle',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Rifle Chess',
  description: 'When you capture a piece, your piece stays on its original square — it \'shoots\' the target from a distance.',
  rule: 'Board: 8×8 · Win: Checkmate',
  beforeMove: function(g, move, undo) {
    if (g.board[move.to] && move.flag !== 'ep') {
      g.board[move.to] = null;
      if (g.pieceData) g.pieceData[move.to] = null;
      g.board[move.from] = undo.piece;
      if (g.pieceData) g.pieceData[move.from] = undo.pieceData || null;
    } else {
      g.board[move.to] = undo.piece;
      g.board[move.from] = null;
      if (g.pieceData) {
        g.pieceData[move.to] = undo.pieceData || null;
        g.pieceData[move.from] = null;
      }
    }
  },
});
