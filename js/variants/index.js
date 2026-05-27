'use strict';
// Auto-loader: dynamically loads all variant plugin scripts.
// Include this single file after core engine scripts to load all plugins.
(function() {
  const base = document.currentScript.src.replace(/index\.js.*/, '');
  const plugins = [
    'standard.js',
    'chess960.js',
    'torpedo.js',
    'no-castling.js',
    'single-check.js',
    'los-alamos.js',
    'knightmate.js',
    'progressive.js',
    'marseillais.js',
    'monster-chess.js',
    'fog-of-war.js',
    'duck-chess.js',
    'antichess.js',
    'giveaway.js',
    'suicide-chess.js',
    'stalemate-wins.js',
    'makpong.js',
    'rifle.js',
    'atomic.js',
    'chigorin.js',
    'almost-chess.js',
    'amazon-chess.js',
    'upside-down.js',
    'endgame-chess.js',
    'peasants-revolt.js',
    'pawns-only.js',
    'breakthrough.js',
    'minichess.js',
    'capablanca.js',
    'grand.js',
    'courier.js',
    'maharaja.js',
    'king-of-the-hill.js',
    'three-check.js',
    'five-check.js',
    'racing-kings.js',
    'extinction.js',
    'horde.js',
    'codrus.js',
  ];
  plugins.forEach(file => {
    const script = document.createElement('script');
    script.src = base + file;
    document.head.appendChild(script);
  });
})();
