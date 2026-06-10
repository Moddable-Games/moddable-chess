import MCE from '../chess-engine.js';
MCE.registerVariant('toroidalChess', {
  label: 'Toroidal Chess',
  group: 'Alternate Rules',
  rows: 8,
  cols: 8,
  fen: null,
  wrapFiles: true,
  wrapRanks: true,
  noCastling: true,
  noEnPassant: true,
  title: 'Toroidal Chess',
  description: 'The board wraps in both directions — files and ranks connect to their opposites, forming a torus. No castling or en passant. Every square is connected to every other.',
  rule: 'Board: 8×8 · Win: Checkmate',
});
