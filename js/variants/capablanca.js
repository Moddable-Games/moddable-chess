'use strict';
MCE.registerVariant('capablanca', {
  label: 'Capablanca',
  group: 'Large Boards',
  rows: 8,
  cols: 10,
  fen: 'rnabqkbcnr/pppppppppp/10/10/10/10/PPPPPPPPPP/RNABQKBCNR w KQkq - 0 1',
  promotionPieces: ['q', 'r', 'b', 'n', 'a', 'c'],
  title: 'Capablanca Chess',
  description: 'Invented by world champion José Capablanca. Adds two new pieces: the Archbishop (bishop + knight) and Chancellor (rook + knight) on a wider board.',
  rule: 'Board: 10×8 · Win: Checkmate',
});
