import MCE from './chess-engine.js';
import { CHESS_PIECES as PIECE_SVG } from './svg-pieces.js';



const THEMES = {
  classic: { light: '#f0d9b5', dark: '#b58863', border: '#8b6914' },
  cosmic: { light: '#2d3760', dark: '#141c37', border: '#0c4f8d' },
  wood: { light: '#deb887', dark: '#8b5e3c', border: '#5c3317' },
  marble: { light: '#f2f0ec', dark: '#b8b5af', border: '#9e9b95' },
  neon: { light: '#1a1a2e', dark: '#0f0f1a', border: '#00ff88' },
  minimal: { light: '#fafafa', dark: '#e8e8e8', border: '#ddd' },
};

export function renderSvg(options) {
  const variant = options.variant || 'standard';
  const fen = options.fen || null;
  const themeName = options.theme || 'classic';
  const highlights = options.highlights || [];
  const size = options.size || 480;

  const vc = MCE.getVariantConfig(variant);
  if (!vc && variant !== 'standard') return null;

  const game = MCE.createGame(variant);
  if (fen) MCE.loadFEN(game, fen);

  const rows = game.rows;
  const cols = game.cols;
  const tileSize = size / cols;
  const height = tileSize * rows;
  const theme = THEMES[themeName] || THEMES.classic;

  const usedPieces = collectUsedPieces(game, rows, cols);

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${height}" width="${size}" height="${height}">\n`;
  svg += renderDefs(usedPieces, tileSize, cols);
  svg += renderSquares(game, rows, cols, tileSize, theme, highlights);
  svg += renderPieces(game, rows, cols, tileSize, usedPieces);
  svg += renderLabels(rows, cols, tileSize, height, theme);
  svg += '</svg>';
  return svg;
}

function collectUsedPieces(game, rows, cols) {
  const used = new Set();
  const total = rows * cols;
  for (let i = 0; i < total; i++) {
    const p = game.board[i];
    if (p) used.add(p);
  }
  return used;
}

function renderDefs(usedPieces, tileSize, cols) {
  let defs = '<defs>\n';
  const scale = tileSize / 45;
  for (const piece of usedPieces) {
    const svgContent = PIECE_SVG[piece];
    if (svgContent) {
      defs += `<symbol id="p-${piece}" viewBox="0 0 45 45">${svgContent}</symbol>\n`;
    }
  }
  defs += '</defs>\n';
  return defs;
}

function renderSquares(game, rows, cols, tileSize, theme, highlights) {
  let out = '';
  const hlSet = new Set(highlights.map(h => {
    if (typeof h === 'number') return h;
    const col = h.charCodeAt(0) - 97;
    const row = rows - parseInt(h.slice(1));
    return row * cols + col;
  }));

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c * tileSize;
      const y = r * tileSize;
      const isDark = (r + c) % 2 === 1;
      const fill = isDark ? theme.dark : theme.light;
      out += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${fill}"/>\n`;

      const sq = r * cols + c;
      if (hlSet.has(sq)) {
        out += `<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="rgba(255,255,0,0.4)"/>\n`;
      }
    }
  }
  return out;
}

function renderPieces(game, rows, cols, tileSize) {
  let out = '';
  const pieceSize = tileSize * 0.9;
  const offset = tileSize * 0.05;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const sq = r * cols + c;
      const piece = game.board[sq];
      if (!piece) continue;

      if (piece === 'D') {
        const cx = c * tileSize + tileSize / 2;
        const cy = r * tileSize + tileSize / 2;
        out += `<circle cx="${cx}" cy="${cy}" r="${tileSize * 0.35}" fill="#f5c542" stroke="#b8860b" stroke-width="2"/>\n`;
        out += `<text x="${cx}" y="${cy + tileSize * 0.08}" text-anchor="middle" font-size="${tileSize * 0.3}" fill="#6b4c00">D</text>\n`;
        continue;
      }

      const x = c * tileSize + offset;
      const y = r * tileSize + offset;

      if (PIECE_SVG[piece]) {
        out += `<use href="#p-${piece}" x="${x}" y="${y}" width="${pieceSize}" height="${pieceSize}"/>\n`;
      } else {
        const isWhite = piece === piece.toUpperCase();
        const fill = isWhite ? '#fff' : '#000';
        const stroke = isWhite ? '#000' : '#fff';
        const cx = c * tileSize + tileSize / 2;
        const cy = r * tileSize + tileSize * 0.65;
        const fs = tileSize * 0.55;
        out += `<text x="${cx}" y="${cy}" text-anchor="middle" font-size="${fs}" font-weight="bold" fill="${fill}" stroke="#000" stroke-width="0.5" font-family="serif">${piece.toUpperCase()}</text>\n`;
      }
    }
  }
  return out;
}

function renderLabels(rows, cols, tileSize, height, theme) {
  let out = '';
  const fontSize = tileSize * 0.22;
  const labelColor = theme.border;

  for (let c = 0; c < cols; c++) {
    const x = c * tileSize + tileSize - fontSize * 0.4;
    const y = height - fontSize * 0.3;
    const label = String.fromCharCode(97 + c);
    out += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${labelColor}" font-family="sans-serif">${label}</text>\n`;
  }

  for (let r = 0; r < rows; r++) {
    const x = fontSize * 0.3;
    const y = r * tileSize + fontSize * 1.1;
    const label = String(rows - r);
    out += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="${labelColor}" font-family="sans-serif">${label}</text>\n`;
  }
  return out;
}
