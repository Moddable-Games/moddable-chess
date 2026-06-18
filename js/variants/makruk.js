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
  evaluate: function(g, defaultEval) {
    var VALS = { p: 100, n: 300, s: 300, m: 150, r: 500, k: 0 };
    var score = 0;
    var myKingSq = -1, oppKingSq = -1;
    var myPieces = 0, oppPieces = 0;
    var myAttackers = [];
    for (var i = 0; i < g.board.length; i++) {
      var p = g.board[i];
      if (!p) continue;
      var color = MCE.pieceColor(p);
      var type = MCE.pieceType(p);
      var val = VALS[type] || 100;
      var rank = MCE.rc(i, g)[0];
      var bonus = 0;
      if (type === 'p') {
        bonus = color === MCE.WHITE ? (6 - rank) * 20 : (rank - 1) * 20;
      }
      if (type === 'k') {
        if (color === g.turn) myKingSq = i;
        else oppKingSq = i;
      } else {
        if (color === g.turn) { myPieces++; myAttackers.push(i); }
        else oppPieces++;
      }
      score += color === g.turn ? (val + bonus) : -(val + bonus);
    }
    if (oppKingSq >= 0 && myPieces > oppPieces) {
      var or = MCE.rc(oppKingSq, g);
      var oRow = or[0], oCol = or[1];
      var edgeBonus = (Math.max(0, 3 - oRow) + Math.max(0, oRow - 4)) * 25;
      edgeBonus += (Math.max(0, 3 - oCol) + Math.max(0, oCol - 4)) * 25;
      score += edgeBonus;
      for (var a = 0; a < myAttackers.length; a++) {
        var ar = MCE.rc(myAttackers[a], g);
        var dist = Math.abs(ar[0] - oRow) + Math.abs(ar[1] - oCol);
        score += (10 - dist) * 8;
      }
      if (myKingSq >= 0) {
        var kr = MCE.rc(myKingSq, g);
        var kDist = Math.abs(kr[0] - oRow) + Math.abs(kr[1] - oCol);
        score += (14 - kDist) * 15;
      }
    }
    return score;
  },
});
