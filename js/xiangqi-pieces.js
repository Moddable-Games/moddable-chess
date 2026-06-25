import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadPieceMap(filename) {
  const svg = readFileSync(join(__dirname, '..', 'assets', filename), 'utf8');
  const map = {};
  const re = /<symbol id="piece-([^"]+)" viewBox="[^"]*">([\s\S]*?)<\/symbol>/g;
  let m;
  while ((m = re.exec(svg)) !== null) {
    map[m[1]] = m[2].trim();
  }
  return map;
}

export const XIANGQI_PIECES_TRAD = loadPieceMap('pieces-xiangqi-trad.svg');
export const XIANGQI_PIECES_WEST = loadPieceMap('pieces-xiangqi-west.svg');
