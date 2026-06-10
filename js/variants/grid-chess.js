import MCE from '../chess-engine.js';
MCE.registerVariant('gridChess', {
  label: 'Grid Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Grid Chess',
  description: 'The board is divided into 2×2 grid cells. A move is only legal if the piece crosses at least one grid line (between columns b-c, d-e, f-g and between rows 2-3, 4-5, 6-7).',
  rule: 'Board: 8×8 · Win: Checkmate',
  moveFilter: function(g, moves) {
    return moves.filter(function(m) {
      var fromRC = MCE.rc(m.from, g);
      var toRC = MCE.rc(m.to, g);
      var fromRow = fromRC[0];
      var fromCol = fromRC[1];
      var toRow = toRC[0];
      var toCol = toRC[1];
      var crossesCol = Math.floor(fromCol / 2) !== Math.floor(toCol / 2);
      var crossesRow = Math.floor(fromRow / 2) !== Math.floor(toRow / 2);
      return crossesCol || crossesRow;
    });
  },
});
