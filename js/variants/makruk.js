import MCE from '../chess-engine.js';
var makrukOpeningBook = {
  "rnsmksnr/8/pppppppp/8/8/PPPPPPPP/8/RNSMKSNR w - -": ["e3e4", "d3d4", "f3f4", "c3c4"],
  "rnsmksnr/8/pppppppp/8/4P3/PPPP1PPP/8/RNSMKSNR b - -": ["e6e5", "d6d5", "f6f5"],
  "rnsmksnr/8/pppppppp/8/3P4/PPP1PPPP/8/RNSMKSNR b - -": ["d6d5", "e6e5", "c6c5"],
  "rnsmksnr/8/pppp1ppp/4p3/4P3/PPPP1PPP/8/RNSMKSNR w - -": ["d3d4", "f3f4", "b1c3"],
  "rnsmksnr/8/ppp1pppp/3p4/3P4/PPP1PPPP/8/RNSMKSNR w - -": ["e3e4", "c3c4", "b1c3"],
};

MCE.registerPiece('m', {
  genMoves: function(g, from, side) {
    var moves = [];
    var dirs = [[-1,-1],[-1,1],[1,-1],[1,1]];
    var r = MCE.rc(from, g)[0], c = MCE.rc(from, g)[1];
    for (var i = 0; i < dirs.length; i++) {
      var nr = r + dirs[i][0], nc = c + dirs[i][1];
      var coords = MCE.wrapCoords(nr, nc, g);
      nr = coords[0]; nc = coords[1];
      if (!MCE.onBoard(nr, nc, g)) continue;
      var target = MCE.sq(nr, nc, g);
      if (g.board[target] && MCE.isFriendly(target, side, g)) continue;
      moves.push({ from: from, to: target, flag: g.board[target] ? 'capture' : null });
    }
    return moves;
  },
  attacks: function(g, from, target) {
    var fr = MCE.rc(from, g)[0], fc = MCE.rc(from, g)[1];
    var tr = MCE.rc(target, g)[0], tc = MCE.rc(target, g)[1];
    return Math.abs(tr - fr) === 1 && Math.abs(tc - fc) === 1;
  }
});

MCE.registerVariant('makruk', {
  openingBook: makrukOpeningBook,
  label: 'Makruk',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: 'rnsmksnr/8/pppppppp/8/8/PPPPPPPP/8/RNSMKSNR w - - 0 1',
  noCastling: true,
  noEnPassant: true,
  promotionRank: function(side) { return side === MCE.WHITE ? 2 : 5; },
  promotionPieces: ['m'],
  title: 'Makruk (Thai Chess)',
  description: 'Thai chess played since the 16th century. Pawns promote on the 6th rank to Met (a piece that moves one step diagonally). No castling, no en passant.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
