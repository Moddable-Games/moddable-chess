'use strict';
MCE.registerVariant('duckChess', {
  label: 'Duck Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  noCheck: true,
  title: 'Duck Chess',
  description: 'After each move, place the duck (yellow blocker) on any empty square. The duck blocks all movement. Win by capturing the opponent\'s king — no check warnings.',
  rule: 'Board: 8×8 · Win: Capture king',
  turnLogic: function(g, undo) {
    if (!g.duckPhase) {
      g.duckPhase = true;
    } else {
      g.duckPhase = false;
      if (g.turn === MCE.BLACK) g.fullmove++;
      MCE.advanceTurn(g);
    }
    undo.duckPhase = !g.duckPhase;
  },
  restoreState: function(g, undo) {
    if (undo.duckPhase !== undefined) g.duckPhase = undo.duckPhase;
  },
});
