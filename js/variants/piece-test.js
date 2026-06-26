import MCE from '../chess-engine.js';
MCE.registerVariant('pieceTest', {
  label: 'Piece Test',
  group: 'Dev',
  rows: 8,
  cols: 8,
  fen: 'KQRBNFAC/PSWGYLHE/7M/8/8/7m/pswgylhe/kqrbnfac w - - 0 1',
  noCastling: true,
  title: 'Piece Test',
  description: 'Dev-only: all piece glyphs on one board.',
  rule: 'Board: 8×8',
});
