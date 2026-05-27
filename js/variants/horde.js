'use strict';
MCE.registerVariant('horde', {
  label: 'Horde Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: 'rnbqkbnr/pppppppp/8/1PP2PP1/PPPPPPPP/PPPPPPPP/PPPPPPPP/PPPPPPPP w kq - 0 1',
  title: 'Horde Chess',
  description: 'Massively asymmetric — White has 36 pawns filling ranks 1-4, Black has a normal army. Black wins by checkmate or eliminating all White pieces.',
  rule: 'Board: 8×8 · Win: Checkmate (Black) or eliminate horde (Black)',
  winCondition: function(g) {
    var whiteHasPieces = g.board.some(function(p) {
      return p && MCE.pieceColor(p) === MCE.WHITE;
    });
    if (!whiteHasPieces) return 'horde-b';
    if (g.turn === MCE.WHITE) {
      if (MCE.legalMoves(g).length === 0) return 'horde-b';
    }
    return null;
  },
});
