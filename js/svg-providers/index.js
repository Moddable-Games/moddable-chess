import { checkered } from './checkered.js';
import { monoGrid } from './mono-grid.js';
import { alquerque } from './alquerque.js';
import { go } from './go.js';
import { morris } from './morris.js';
import { dungeon } from './dungeon.js';
import { royalUr } from './royal-ur.js';
import { xiangqi } from './xiangqi.js';
import { shogi } from './shogi.js';

export const providers = {
  'checkered': checkered,
  'mono-grid': monoGrid,
  'alquerque': alquerque,
  'go': go,
  'morris': morris,
  'dungeon': dungeon,
  'royal-ur': royalUr,
  'xiangqi': xiangqi,
  'shogi': shogi,
};
