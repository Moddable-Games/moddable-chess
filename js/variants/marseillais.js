'use strict';
MCE.registerVariant('marseillais', {
  label: 'Marseillais',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Marseillais Chess',
  description: 'Each player makes two moves per turn (except White\'s first turn). If your first move gives check, your turn ends immediately.',
  rule: 'Board: 8×8 · Win: Checkmate',
  turnLogic: function(g, undo) {
    g.movesThisTurn++;
    undo.movesThisTurn = g.movesThisTurn - 1;
    undo.fullmove = g.fullmove;
    var isFirstMove = g.fullmove === 1 && g.turn === MCE.WHITE;
    var opp = g.turn === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
    var givesCheck = MCE.inCheck(g, opp);
    if (g.movesThisTurn >= 2 || isFirstMove || givesCheck) {
      if (g.turn === MCE.BLACK) g.fullmove++;
      MCE.advanceTurn(g);
      g.movesThisTurn = 0;
    }
  },
  restoreState: function(g, undo) {
    if (undo.movesThisTurn !== undefined) g.movesThisTurn = undo.movesThisTurn;
    if (undo.fullmove !== undefined) g.fullmove = undo.fullmove;
  },
  statusText: function(g, helpers) {
    if (g.movesThisTurn === 1) {
      var turn = helpers.nameFor(g.turn);
      return turn + ' — second move';
    }
    return null;
  },
  aiMoveCount: function(g) {
    if (g.fullmove === 1 && g.turn === MCE.WHITE) return 1;
    return 2;
  },
});
