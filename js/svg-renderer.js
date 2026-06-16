// Pure-string SVG generator for board position diagrams.
// Supports chess and draughts families across three board styles.
// Works in browser and Node.js — no DOM dependencies.

export const BOARD_STYLES = {
  CHECKERED: 'checkered',
  MONO_GRID:  'mono-grid',
  ALQUERQUE:  'alquerque',
};

export const DEFAULT_COLORS = {
  lightSquare:      '#f0d9b5',
  darkSquare:       '#b58863',
  monoSquare:       '#d9b483',
  gridLine:         '#8b6914',
  labelText:        '#5c3a1e',
  background:       '#f0d9b5',
  whitePieceFill:   '#ffffff',
  whitePieceStroke: '#333333',
  blackPieceFill:   '#1c1c1c',
  blackPieceStroke: '#888888',
};

const CHESS_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

function esc(v) {
  return String(v)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function algToRC(alg, rows) {
  return [rows - parseInt(alg.slice(1), 10), alg.charCodeAt(0) - 97];
}

/**
 * Render a board position as a standalone SVG string.
 *
 * opts.rows        {number}  Board rows (default 8)
 * opts.cols        {number}  Board columns (default 8)
 * opts.tileSize    {number}  Pixels per square / point-spacing (default 56)
 * opts.boardStyle  {string}  'checkered' | 'mono-grid' | 'alquerque'
 * opts.position    {object}  Algebraic square → piece descriptor
 *                              Chess:    'K'/'q'/... — letter case sets color
 *                              Draughts: { type:'man'|'king', color:'white'|'black' }
 * opts.showLabels  {boolean} Draw coordinate labels (default true)
 * opts.colors      {object}  Override any DEFAULT_COLORS key
 * @returns {string}
 */
export function renderBoardSVG(opts) {
  opts = opts || {};
  const rows       = opts.rows       || 8;
  const cols       = opts.cols       || 8;
  const tileSize   = opts.tileSize   || 56;
  const boardStyle = opts.boardStyle || BOARD_STYLES.CHECKERED;
  const position   = opts.position   || {};
  const showLabels = opts.showLabels !== false;
  const pad        = showLabels ? 24 : 0;
  const C          = Object.assign({}, DEFAULT_COLORS, opts.colors || {});

  const isAlq  = boardStyle === BOARD_STYLES.ALQUERQUE;
  const boardW = isAlq ? (cols - 1) * tileSize : cols * tileSize;
  const boardH = isAlq ? (rows - 1) * tileSize : rows * tileSize;
  const W      = boardW + pad * 2;
  const H      = boardH + pad * 2;
  const ox     = pad;
  const oy     = pad;

  const parts = [
    `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`,
    `<rect width="${W}" height="${H}" fill="${esc(C.background)}"/>`,
  ];

  if      (isAlq)                                parts.push(drawAlquerque(rows, cols, tileSize, ox, oy, C));
  else if (boardStyle === BOARD_STYLES.MONO_GRID) parts.push(drawMonoGrid(rows, cols, tileSize, ox, oy, C));
  else                                            parts.push(drawCheckered(rows, cols, tileSize, ox, oy, C));

  for (const [alg, raw] of Object.entries(position)) {
    const [r, c] = algToRC(alg, rows);
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
    const piece      = normalisePiece(raw);
    const isDraughts = piece.type === 'man' || piece.type === 'king';
    if (isAlq || isDraughts) {
      const cx = isAlq ? ox + c * tileSize : ox + c * tileSize + tileSize / 2;
      const cy = isAlq ? oy + r * tileSize : oy + r * tileSize + tileSize / 2;
      parts.push(drawDraughtsPiece(piece, cx, cy, tileSize * (isAlq ? 0.3 : 0.38), C));
    } else {
      parts.push(drawChessPiece(piece, ox + c * tileSize, oy + r * tileSize, tileSize, C));
    }
  }

  if (showLabels) parts.push(drawLabels(rows, cols, tileSize, ox, oy, pad, C, isAlq));

  parts.push('</svg>');
  return parts.join('');
}

function normalisePiece(raw) {
  if (raw && typeof raw === 'object') return raw;
  const s = String(raw);
  return { type: s, color: s === s.toUpperCase() ? 'white' : 'black' };
}

function drawCheckered(rows, cols, tileSize, ox, oy, C) {
  const parts = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const fill = (r + c) % 2 === 0 ? C.lightSquare : C.darkSquare;
      parts.push(`<rect x="${ox + c * tileSize}" y="${oy + r * tileSize}" width="${tileSize}" height="${tileSize}" fill="${esc(fill)}"/>`);
    }
  }
  return parts.join('');
}

function drawMonoGrid(rows, cols, tileSize, ox, oy, C) {
  const bw    = cols * tileSize;
  const bh    = rows * tileSize;
  const parts = [`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="${esc(C.monoSquare)}"/>` ];
  for (let c = 0; c <= cols; c++) {
    const x = ox + c * tileSize;
    parts.push(`<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + bh}" stroke="${esc(C.gridLine)}" stroke-width="1.5"/>`);
  }
  for (let r = 0; r <= rows; r++) {
    const y = oy + r * tileSize;
    parts.push(`<line x1="${ox}" y1="${y}" x2="${ox + bw}" y2="${y}" stroke="${esc(C.gridLine)}" stroke-width="1.5"/>`);
  }
  return parts.join('');
}

function drawAlquerque(rows, cols, tileSize, ox, oy, C) {
  const bw    = (cols - 1) * tileSize;
  const bh    = (rows - 1) * tileSize;
  const parts = [`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="${esc(C.monoSquare)}"/>` ];

  for (let r = 0; r < rows; r++) {
    const y = oy + r * tileSize;
    parts.push(`<line x1="${ox}" y1="${y}" x2="${ox + bw}" y2="${y}" stroke="${esc(C.gridLine)}" stroke-width="2"/>`);
  }
  for (let c = 0; c < cols; c++) {
    const x = ox + c * tileSize;
    parts.push(`<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + bh}" stroke="${esc(C.gridLine)}" stroke-width="2"/>`);
  }
  for (let r = 0; r < rows - 1; r++) {
    for (let c = 0; c < cols - 1; c++) {
      if ((r + c) % 2 !== 0) continue;
      const x1 = ox + c * tileSize,       y1 = oy + r * tileSize;
      const x2 = ox + (c + 1) * tileSize, y2 = oy + (r + 1) * tileSize;
      parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${esc(C.gridLine)}" stroke-width="1.5"/>`);
      parts.push(`<line x1="${x2}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="${esc(C.gridLine)}" stroke-width="1.5"/>`);
    }
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      parts.push(`<circle cx="${ox + c * tileSize}" cy="${oy + r * tileSize}" r="3" fill="${esc(C.gridLine)}"/>`);
    }
  }
  return parts.join('');
}

function drawDraughtsPiece(piece, cx, cy, r, C) {
  const isW    = piece.color === 'white';
  const fill   = isW ? C.whitePieceFill   : C.blackPieceFill;
  const stroke = isW ? C.whitePieceStroke : C.blackPieceStroke;
  const parts  = [`<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="2"/>` ];
  if (piece.type === 'king') {
    parts.push(`<circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="${esc(stroke)}" stroke-width="1.5" opacity="0.6"/>`);
  }
  return parts.join('');
}

function drawChessPiece(piece, x, y, ts, C) {
  const t    = piece.type;
  const sym  = CHESS_UNICODE[t] || t;
  const isW  = piece.color === 'white';
  const fill = isW ? C.whitePieceFill   : C.blackPieceFill;
  const strk = isW ? C.whitePieceStroke : C.blackPieceStroke;
  const fs   = ts * 0.72;
  const tx   = x + ts / 2;
  const ty   = y + ts * 0.73;
  return [
    `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="${fs}" fill="${esc(strk)}" stroke="${esc(strk)}" stroke-width="3" stroke-linejoin="round" font-family="serif">${esc(sym)}</text>`,
    `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="${fs}" fill="${esc(fill)}" font-family="serif">${esc(sym)}</text>`,
  ].join('');
}

function drawLabels(rows, cols, tileSize, ox, oy, pad, C, isAlq) {
  const fs      = Math.min(13, pad * 0.55);
  const parts   = [];
  const bottomY = oy + (isAlq ? (rows - 1) : rows) * tileSize + pad * 0.7;

  for (let c = 0; c < cols; c++) {
    const lx = isAlq ? ox + c * tileSize : ox + c * tileSize + tileSize / 2;
    parts.push(`<text x="${lx}" y="${bottomY}" text-anchor="middle" font-size="${fs}" fill="${esc(C.labelText)}" font-family="monospace">${esc(String.fromCharCode(97 + c))}</text>`);
  }
  for (let r = 0; r < rows; r++) {
    const num = rows - r;
    const ly  = isAlq ? oy + r * tileSize : oy + r * tileSize + tileSize / 2;
    parts.push(`<text x="${pad * 0.5}" y="${ly + fs * 0.35}" text-anchor="middle" font-size="${fs}" fill="${esc(C.labelText)}" font-family="monospace">${esc(num)}</text>`);
  }
  return parts.join('');
}

export default { renderBoardSVG, BOARD_STYLES, DEFAULT_COLORS };
