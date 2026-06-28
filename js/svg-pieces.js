import svg from '../assets/pieces.svg';

export const CHESS_PIECES = {};
const re = /<symbol id="piece-([^"]+)" viewBox="[^"]*">([\s\S]*?)<\/symbol>/g;
let m;
while ((m = re.exec(svg)) !== null) {
  CHESS_PIECES[m[1]] = m[2].trim();
}
