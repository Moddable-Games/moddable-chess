import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(__dirname, '..', 'assets', 'pieces.svg'), 'utf8');
export const CHESS_PIECES = {};
const re = /<symbol id="piece-([^"]+)" viewBox="[^"]*">([\s\S]*?)<\/symbol>/g;
let m;
while ((m = re.exec(svg)) !== null) {
  CHESS_PIECES[m[1]] = m[2].trim();
}
