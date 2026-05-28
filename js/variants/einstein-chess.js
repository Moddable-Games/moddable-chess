'use strict';
MCE.registerVariant('einsteinChess', {
  label: 'Einstein Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Einstein Chess',
  description: 'After moving, non-capturing pieces demote (Q→R→B→N→P) and capturing pieces promote (P→N→B→R→Q). Kings are unaffected. Pieces cycle through the hierarchy.',
  rule: 'Board: 8×8 · Win: Checkmate',
  afterMove: function(g, move, undo) {
    var to = move.to;
    var p = g.board[to];
    if (!p) return;
    var type = MCE.pieceType(p);
    if (type === 'k') return;
    var isWhite = MCE.pieceColor(p) === MCE.WHITE;
    var hierarchy = ['p', 'n', 'b', 'r', 'q'];
    var idx = hierarchy.indexOf(type);
    if (idx < 0) return;
    var isCapture = move.flag === 'capture' || move.flag === 'ep';
    var newIdx;
    if (isCapture) {
      newIdx = Math.min(idx + 1, hierarchy.length - 1);
    } else {
      newIdx = Math.max(idx - 1, 0);
    }
    if (newIdx !== idx) {
      var newType = hierarchy[newIdx];
      undo.einsteinOriginal = p;
      g.board[to] = isWhite ? newType.toUpperCase() : newType;
    }
  },
});
