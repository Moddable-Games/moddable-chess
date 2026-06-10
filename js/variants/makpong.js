import MCE from '../chess-engine.js';
MCE.registerVariant('makpong', {
  label: 'Makpong',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Makpong',
  description: 'Thai chess variant where the king cannot move out of check — must block or capture the attacker. If neither is possible, checkmate. Based on Makruk.',
  rule: 'Board: 8×8 · Win: Checkmate',
  moveFilter: function(g, moves) {
    if (MCE.inCheck(g, g.turn)) {
      return moves.filter(function(m) {
        return MCE.pieceType(g.board[m.from]) !== 'k';
      });
    }
    return moves;
  },
});
