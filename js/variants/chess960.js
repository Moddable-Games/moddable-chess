'use strict';
MCE.registerVariant('chess960', {
  label: 'Fischer Random (960)',
  group: 'Classic',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Fischer Random (Chess960)',
  description: 'Standard rules but the back rank is randomised from 960 possible positions. Bishops on opposite colours, king between rooks.',
  rule: 'Board: 8×8 · Win: Checkmate',
  init: function(g) {
    MCE.loadFEN(g, MCE.randomFEN960());
    g.positionHistory = [MCE.positionKey(g)];
  },
});
