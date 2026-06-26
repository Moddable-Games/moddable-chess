import MCE from '../chess-engine.js';

import './fers.js';
import './khon.js';
import './elephant.js';
import './yurt.js';
import './lancer.js';
import './archer.js';
import './kheshig.js';
import './sit.js';
import './archbishop.js';
import './chancellor.js';
import './sage.js';
import './maharaja.js';

import { PAWN_META } from './pawn.js';
import { KNIGHT_META } from './knight.js';
import { BISHOP_META } from './bishop.js';
import { ROOK_META } from './rook.js';
import { QUEEN_META } from './queen.js';
import { KING_META } from './king.js';

const registry = MCE.getPieceRegistry();

export const PIECES = {};

for (const [char, handler] of Object.entries(registry)) {
  PIECES[char] = {
    char,
    name: handler.name || char.toUpperCase(),
    category: handler.category || 'unknown',
    movement: handler.movement || null,
    capture: handler.capture || null,
    variants: handler.variants || [],
  };
}

const standardMeta = [PAWN_META, KNIGHT_META, BISHOP_META, ROOK_META, QUEEN_META, KING_META];
for (const meta of standardMeta) {
  if (!PIECES[meta.char]) {
    PIECES[meta.char] = meta;
  }
}

export const PIECE_NAMES = Object.fromEntries(
  Object.entries(PIECES).map(([k, v]) => [k, v.name])
);

export function getPieceInfo(char) {
  return PIECES[char] || null;
}

Object.assign(MCE, { PIECES, PIECE_NAMES, getPieceInfo });
