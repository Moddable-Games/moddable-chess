import MCE from '../chess-engine.js';
MCE.registerVariant('pieceTest', {
  label: 'Piece Test',
  group: 'Dev',
  rows: 8,
  cols: 8,
  fen: 'KQRBNFAC/1SWGYLHE/7M/4P3/4p3/7m/1swgylhe/kqrbnfac w - - 0 1',
  noCastling: true,
  title: 'Piece Test',
  description: 'Dev-only: all piece glyphs on one board.',
  rule: 'Board: 8×8',
});
