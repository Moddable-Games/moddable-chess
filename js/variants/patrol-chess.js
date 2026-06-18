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
      var opp = side === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
      var patrolled = MCE.isAttacked(g, m.from, opp);
      return patrolled;
    });
  },
});
