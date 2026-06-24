import MCE from '../chess-engine.js';
MCE.registerVariant('pieceTest', {
  label: 'Piece Test',
  group: 'Dev',
  rows: 1,
  cols: 2,
  fen: 'Aa w - - 0 1',
  noCastling: true,
  title: 'Piece Test',
  description: 'Dev-only: 1x2 board for piece glyph comparison.',
  rule: 'Board: 1×2',
});
