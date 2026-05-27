'use strict';
MCE.registerVariant('atomic', {
  label: 'Atomic',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Atomic Chess',
  description: 'Captures cause explosions that destroy all non-pawn pieces on adjacent squares, including the capturer. If a king is caught in the blast, that side loses.',
  rule: 'Board: 8×8 · Win: Explode opponent\'s king',
  beforeMove: function(g, move, undo) {
    if (g.board[move.to] && move.flag !== 'ep') {
      g.board[move.to] = undo.piece;
      g.board[move.from] = null;
      if (g.pieceData) {
        g.pieceData[move.to] = undo.pieceData || null;
        g.pieceData[move.from] = null;
      }
      g.board[move.to] = null;
      if (g.pieceData) g.pieceData[move.to] = null;
      undo.exploded = [];
      var rc = MCE.rc(move.to, g);
      for (var dr = -1; dr <= 1; dr++) {
        for (var dc = -1; dc <= 1; dc++) {
          if (dr === 0 && dc === 0) continue;
          var r = rc.r + dr;
          var c = rc.c + dc;
          if (!MCE.onBoard(r, c, g)) continue;
          var sq = MCE.sq(r, c, g);
          if (g.board[sq] && MCE.pieceType(g.board[sq]) !== 'p') {
            undo.exploded.push({ sq: sq, piece: g.board[sq] });
            g.board[sq] = null;
            if (g.pieceData) g.pieceData[sq] = null;
          }
        }
      }
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
