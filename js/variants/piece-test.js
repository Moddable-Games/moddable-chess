import MCE from '../chess-engine.js';
MCE.registerVariant('pieceTest', {
  label: 'Piece Test',
  group: 'Dev',
  rows: 8,
  cols: 8,
  fen: 'KQRBNFAC/MSPGYLHE/7W/8/8/7w/mspgylhe/kqrbnfac w - - 0 1',
  noCastling: true,
  title: 'Piece Test',
  description: 'Dev-only: all piece glyphs on one board.',
  rule: 'Board: 8×8',
});
