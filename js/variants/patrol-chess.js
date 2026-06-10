import MCE from '../chess-engine.js';
MCE.registerVariant('patrolChess', {
  label: 'Patrol Chess',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Patrol Chess',
  description: 'A piece can only capture if it is patrolled (defended by a friendly piece). Non-capturing moves are unrestricted.',
  rule: 'Board: 8×8 · Win: Checkmate',
  moveFilter: function(g, moves) {
    return moves.filter(function(m) {
      var isCapture = g.board[m.to] || m.flag === 'ep';
      if (!isCapture) return true;
      var side = MCE.pieceColor(g.board[m.from]);
      var fromSq = m.from;
      var savedPiece = g.board[fromSq];
      g.board[fromSq] = null;
      var patrolled = false;
      var total = g.rows * g.cols;
      for (var i = 0; i < total; i++) {
        var p = g.board[i];
        if (!p || MCE.pieceColor(p) !== side) continue;
        var tempG = Object.assign({}, g, { turn: side });
        var pMoves = MCE.pseudoLegalMoves(tempG);
        for (var j = 0; j < pMoves.length; j++) {
          if (pMoves[j].from === i && pMoves[j].to === fromSq) {
            patrolled = true;
            break;
          }
        }
        if (patrolled) break;
      }
      g.board[fromSq] = savedPiece;
      return patrolled;
    });
  },
});
