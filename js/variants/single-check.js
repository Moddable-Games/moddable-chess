'use strict';
MCE.registerVariant('singleCheck', {
  label: 'Single-Check',
  group: 'Tactical',
  rows: 8,
  cols: 8,
  fen: null,
  title: 'Single-Check',
  description: 'Deliver just one check to win instantly. Ultra-aggressive variant where every move is a potential game-ender. King safety is everything.',
  rule: 'Board: 8×8 · Win: One check',
});
