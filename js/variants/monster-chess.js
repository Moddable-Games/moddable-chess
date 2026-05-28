'use strict';
MCE.registerVariant('monsterChess', {
  label: 'Monster Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/R3K2R w KQkq - 0 1',
  title: 'Monster Chess',
  description: 'White has only a king and rooks but gets two moves per turn. Black has a full army with one move per turn. Giving check ends your turn early.',
  rule: 'Board: 8×8 · Win: Checkmate',
  init: function(g) {
    g.maxMovesPerTurn = { w: 2, b: 1 };
    g.lastMovedSq = -1;
  },
  turnLogic: function(g, undo) {
    g.movesThisTurn++;
    undo.movesThisTurn = g.movesThisTurn - 1;
    undo.lastMovedSq = g.lastMovedSq;
    undo.fullmove = g.fullmove;
    var max = g.maxMovesPerTurn[g.turn] || 1;
    var opp = g.turn === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
    var givesCheck = MCE.inCheck(g, opp);
    if (g.movesThisTurn >= max || givesCheck) {
      if (g.turn === MCE.BLACK) g.fullmove++;
      MCE.advanceTurn(g);
      g.movesThisTurn = 0;
      g.lastMovedSq = -1;
    } else {
      g.lastMovedSq = undo.to;
    }
  },
  restoreState: function(g, undo) {
    if (undo.movesThisTurn !== undefined) g.movesThisTurn = undo.movesThisTurn;
    if (undo.lastMovedSq !== undefined) g.lastMovedSq = undo.lastMovedSq;
    if (undo.fullmove !== undefined) g.fullmove = undo.fullmove;
  },
  statusText: function(g, helpers) {
    if (g.movesThisTurn > 0) {
      var max = g.maxMovesPerTurn[g.turn] || 1;
      var turn = helpers.nameFor(g.turn);
      return turn + ' — move ' + (g.movesThisTurn + 1) + ' of ' + max;
    }
    return null;
  },
  aiMoveCount: function(g) {
    return g.maxMovesPerTurn[g.turn] || 1;
  },
});
