import MCE from '../chess-engine.js';
MCE.registerVariant('andernachChess', {
  label: 'Andernach',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Andernach Chess',
  description: 'When a piece makes a capture, it changes colour (switches sides). Kings are exempt from colour change. Standard check and checkmate rules apply.',
  rule: 'Board: 8×8 · Win: Checkmate',
  beforeMove: function(g, move, undo) {
    g.board[move.to] = undo.piece;
    g.board[move.from] = null;
    if (g.pieceData) {
      g.pieceData[move.to] = undo.pieceData || null;
      g.pieceData[move.from] = null;
    }
    if ((undo.captured || move.flag === 'ep') && MCE.pieceType(undo.piece) !== 'k') {
      var p = g.board[move.to];
      var flipped = (p === p.toUpperCase()) ? p.toLowerCase() : p.toUpperCase();
      MCE.mutateBoard(g, undo, [{ sq: move.to, piece: flipped }]);
    }
  },
});
