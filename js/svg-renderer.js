import { providers } from './svg-providers/index.js';

export const BOARD_STYLES = {
  CHECKERED: 'checkered',
  MONO_GRID: 'mono-grid',
  ALQUERQUE: 'alquerque',
  GO: 'go',
  MORRIS: 'morris',
  DUNGEON: 'dungeon',
  ROYAL_UR: 'royal-ur',
};

export const DEFAULT_COLORS = {
  lightSquare: '#f0d9b5',
  darkSquare: '#b58863',
  monoSquare: '#d9b483',
  gridLine: '#8b6914',
  labelText: '#5c3a1e',
  background: '#f0d9b5',
  whitePieceFill: '#ffffff',
  whitePieceStroke: '#333333',
  blackPieceFill: '#1c1c1c',
  blackPieceStroke: '#888888',
};

const CHESS_UNICODE = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

const ANNOTATION_STYLES = {
  valid: { stroke: '#2aaa10', strokeWidth: 2.5 },
  blocked: { color: '#c03030', strokeWidth: 2.8 },
  selected: { stroke: '#c9a84c', strokeWidth: 3 },
  friendly: { stroke: '#c9a84c', strokeWidth: 3 },
};

const registry = {};

export function registerProvider(name, provider) {
  registry[name] = provider;
}

function getProvider(name) {
  return registry[name] || null;
}

function esc(v) {
  return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function algToRC(alg, rows) {
  return [rows - parseInt(alg.slice(1), 10), alg.charCodeAt(0) - 97];
}

export function renderBoardSVG(opts) {
  return render(opts, null);
}

export function renderAnnotatedSVG(opts, annotations) {
  return render(opts, annotations);
}

function render(opts, annotations) {
  opts = opts || {};
  const boardStyle = opts.boardStyle || BOARD_STYLES.CHECKERED;
  const provider = getProvider(boardStyle);
  if (!provider) throw new Error(`Unknown board style: ${boardStyle}`);

  const rows = opts.rows || 8;
  const cols = opts.cols || 8;
  const tileSize = opts.tileSize || 56;
  const position = opts.position || {};
  const showLabels = opts.showLabels !== false;
  const responsive = opts.responsive || false;
  const title = opts.title || null;

  const providerColors = provider.defaultColors || {};
  const colors = Object.assign({}, DEFAULT_COLORS, providerColors, opts.colors || {});

  const layout = provider.computeLayout({ rows, cols, tileSize, ...opts });
  const boardW = layout.boardW;
  const boardH = layout.boardH;

  const labelStyle = provider.labelStyle || 'algebraic';
  const pad = (showLabels && labelStyle !== 'none') ? 24 : 0;
  const legendH = (annotations && annotations.legend && annotations.legend.length > 0) ? 30 : 0;

  const W = boardW + pad * 2;
  const H = boardH + pad * 2 + legendH;
  const ox = pad;
  const oy = pad;

  const parts = [];

  if (responsive) {
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">`);
  } else {
    parts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`);
  }

  if (title) {
    parts.push(`<title>${esc(title)}</title>`);
  }

  parts.push(`<rect width="${W}" height="${H}" fill="${esc(colors.background)}"/>`);

  const ctx = { rows, cols, tileSize, ox, oy, colors, opts, boardW, boardH };
  parts.push(provider.render(ctx));

  if (position && Object.keys(position).length > 0) {
    parts.push(renderPieces(position, provider, ctx, colors));
  }

  if (showLabels && labelStyle !== 'none') {
    parts.push(renderLabels(ctx, colors, provider));
  }

  if (annotations) {
    parts.push(renderAnnotations(annotations, ctx, provider, colors));
  }

  parts.push('</svg>');
  return parts.join('\n');
}

function getPixelPos(r, c, provider, ctx) {
  if (provider.getIntersection) {
    return provider.getIntersection(r, c, ctx);
  }
  const { tileSize, ox, oy } = ctx;
  const posType = provider.positionType || 'square';
  if (posType === 'intersection') {
    return { x: ox + c * tileSize, y: oy + r * tileSize };
  }
  return { x: ox + c * tileSize + tileSize / 2, y: oy + r * tileSize + tileSize / 2 };
}

function renderPieces(position, provider, ctx, colors) {
  const { rows, cols, tileSize } = ctx;
  const posType = provider.positionType || 'square';
  const parts = [];

  for (const [alg, raw] of Object.entries(position)) {
    const [r, c] = algToRC(alg, rows);
    if (r < 0 || r >= rows || c < 0 || c >= cols) continue;

    const piece = normalisePiece(raw);
    const pos = getPixelPos(r, c, provider, ctx);

    if (piece.type === 'stone') {
      parts.push(drawStone(piece, pos.x, pos.y, tileSize * 0.42, colors));
    } else if (piece.type === 'man' || piece.type === 'king') {
      const radius = tileSize * (posType === 'intersection' ? 0.3 : 0.38);
      parts.push(drawDraughtsPiece(piece, pos.x, pos.y, radius, colors));
    } else if (piece.type === 'token') {
      parts.push(drawToken(piece, pos.x, pos.y, tileSize * 0.35, colors));
    } else {
      const topLeft = posType === 'intersection'
        ? { x: pos.x - tileSize / 2, y: pos.y - tileSize / 2 }
        : { x: pos.x - tileSize / 2, y: pos.y - tileSize / 2 };
      parts.push(drawChessPiece(piece, topLeft.x, topLeft.y, tileSize, colors));
    }
  }
  return parts.join('');
}

function normalisePiece(raw) {
  if (raw && typeof raw === 'object') return raw;
  const s = String(raw);
  return { type: s, color: s === s.toUpperCase() ? 'white' : 'black' };
}

function drawChessPiece(piece, x, y, ts, C) {
  const sym = CHESS_UNICODE[piece.type] || piece.type;
  const isW = piece.color === 'white';
  const fill = isW ? C.whitePieceFill : C.blackPieceFill;
  const strk = isW ? C.whitePieceStroke : C.blackPieceStroke;
  const fs = ts * 0.72;
  const tx = x + ts / 2;
  const ty = y + ts * 0.73;
  return `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="${fs}" fill="${esc(strk)}" stroke="${esc(strk)}" stroke-width="3" stroke-linejoin="round" font-family="serif">${esc(sym)}</text>` +
    `<text x="${tx}" y="${ty}" text-anchor="middle" font-size="${fs}" fill="${esc(fill)}" font-family="serif">${esc(sym)}</text>`;
}

function drawDraughtsPiece(piece, cx, cy, r, C) {
  const isW = piece.color === 'white';
  const fill = isW ? C.whitePieceFill : C.blackPieceFill;
  const stroke = isW ? C.whitePieceStroke : C.blackPieceStroke;
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="2"/>`;
  if (piece.type === 'king') {
    svg += `<circle cx="${cx}" cy="${cy}" r="${r * 0.55}" fill="none" stroke="${esc(stroke)}" stroke-width="1.5" opacity="0.6"/>`;
  }
  return svg;
}

function drawStone(piece, cx, cy, r, C) {
  const isW = piece.color === 'white';
  const fill = isW ? C.whitePieceFill : C.blackPieceFill;
  const stroke = isW ? C.whitePieceStroke : C.blackPieceStroke;
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="1.5"/>`;
}

function drawToken(piece, cx, cy, r, C) {
  const fill = piece.fill || (piece.color === 'white' ? C.whitePieceFill : C.blackPieceFill);
  const stroke = piece.stroke || (piece.color === 'white' ? C.whitePieceStroke : C.blackPieceStroke);
  let svg = `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${esc(fill)}" stroke="${esc(stroke)}" stroke-width="2"/>`;
  if (piece.label) {
    svg += `<text x="${cx}" y="${cy + r * 0.35}" text-anchor="middle" font-size="${r * 1.1}" fill="#fff" font-weight="bold" font-family="sans-serif">${esc(piece.label)}</text>`;
  }
  return svg;
}

function renderLabels(ctx, colors, provider) {
  const { rows, cols, tileSize, ox, oy } = ctx;
  const labelStyle = provider.labelStyle || 'algebraic';
  const pad = 24;
  const fs = Math.min(13, pad * 0.55);
  const parts = [];

  const lastRowPos = getPixelPos(rows - 1, 0, provider, ctx);
  const bottomY = lastRowPos.y + pad * 0.9;

  if (labelStyle === 'go') {
    const GO_LETTERS = 'ABCDEFGHJKLMNOPQRST';
    for (let c = 0; c < cols; c++) {
      const pos = getPixelPos(0, c, provider, ctx);
      parts.push(`<text x="${pos.x}" y="${bottomY}" text-anchor="middle" font-size="${fs}" fill="${esc(colors.labelText)}" font-family="sans-serif">${GO_LETTERS[c]}</text>`);
    }
    for (let r = 0; r < rows; r++) {
      const num = rows - r;
      const pos = getPixelPos(r, 0, provider, ctx);
      parts.push(`<text x="${pad * 0.5}" y="${pos.y + fs * 0.35}" text-anchor="middle" font-size="${fs}" fill="${esc(colors.labelText)}" font-family="sans-serif">${num}</text>`);
    }
  } else if (labelStyle === 'numeric') {
    for (let c = 0; c < cols; c++) {
      const pos = getPixelPos(0, c, provider, ctx);
      parts.push(`<text x="${pos.x}" y="${bottomY}" text-anchor="middle" font-size="${fs}" fill="${esc(colors.labelText)}" font-family="sans-serif">${c + 1}</text>`);
    }
  } else {
    for (let c = 0; c < cols; c++) {
      const pos = getPixelPos(0, c, provider, ctx);
      parts.push(`<text x="${pos.x}" y="${bottomY}" text-anchor="middle" font-size="${fs}" fill="${esc(colors.labelText)}" font-family="monospace">${String.fromCharCode(97 + c)}</text>`);
    }
    for (let r = 0; r < rows; r++) {
      const num = rows - r;
      const pos = getPixelPos(r, 0, provider, ctx);
      parts.push(`<text x="${pad * 0.5}" y="${pos.y + fs * 0.35}" text-anchor="middle" font-size="${fs}" fill="${esc(colors.labelText)}" font-family="monospace">${num}</text>`);
    }
  }
  return parts.join('');
}

function renderAnnotations(annotations, ctx, provider, colors) {
  const { rows, cols, tileSize, ox, oy, boardW, boardH } = ctx;
  const parts = ['<g class="annotations">'];

  function sqToPixel(sq) {
    const [r, c] = algToRC(sq, rows);
    return getPixelPos(r, c, provider, ctx);
  }

  if (annotations.highlights) {
    for (const h of annotations.highlights) {
      const pos = sqToPixel(h.sq);
      const style = ANNOTATION_STYLES[h.style] || ANNOTATION_STYLES.valid;
      const sz = tileSize * 0.4;

      if (h.style === 'blocked') {
        parts.push(`<line x1="${pos.x - sz}" y1="${pos.y - sz}" x2="${pos.x + sz}" y2="${pos.y + sz}" stroke="${style.color}" stroke-width="${style.strokeWidth}"/>`);
        parts.push(`<line x1="${pos.x + sz}" y1="${pos.y - sz}" x2="${pos.x - sz}" y2="${pos.y + sz}" stroke="${style.color}" stroke-width="${style.strokeWidth}"/>`);
      } else {
        const half = tileSize * 0.45;
        parts.push(`<rect x="${pos.x - half}" y="${pos.y - half}" width="${half * 2}" height="${half * 2}" fill="none" stroke="${style.stroke}" stroke-width="${style.strokeWidth}"/>`);
      }
    }
  }

  if (annotations.arrows) {
    parts.push('<defs><marker id="ah" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto"><polygon points="0 0,8 3,0 6" fill="#2aaa10"/></marker></defs>');
    for (const arr of annotations.arrows) {
      const from = sqToPixel(arr.from);
      const to = sqToPixel(arr.to);
      const color = arr.color || '#2aaa10';
      const dash = arr.style === 'dashed' ? ' stroke-dasharray="6,4"' : '';
      parts.push(`<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" stroke="${color}" stroke-width="2" marker-end="url(#ah)"${dash}/>`);
    }
  }

  if (annotations.tokens) {
    for (const tok of annotations.tokens) {
      const pos = sqToPixel(tok.sq);
      const r = tileSize * (tok.size || 0.28);
      parts.push(`<circle cx="${pos.x}" cy="${pos.y}" r="${r}" fill="${tok.color || '#C62828'}" stroke="${tok.stroke || '#fff'}" stroke-width="1.5"/>`);
      if (tok.label) {
        parts.push(`<text x="${pos.x}" y="${pos.y + r * 0.35}" text-anchor="middle" font-size="${r * 1.1}" fill="#fff" font-weight="bold" font-family="sans-serif">${esc(tok.label)}</text>`);
      }
    }
  }

  if (annotations.legend && annotations.legend.length > 0) {
    const pad = 24;
    const legendY = oy + (ctx.boardH) + pad + 5;
    let lx = ox;
    for (const leg of annotations.legend) {
      const style = ANNOTATION_STYLES[leg.style] || ANNOTATION_STYLES.valid;
      if (leg.style === 'blocked') {
        parts.push(`<line x1="${lx}" y1="${legendY + 2}" x2="${lx + 10}" y2="${legendY + 12}" stroke="${style.color}" stroke-width="2"/>`);
        parts.push(`<line x1="${lx + 10}" y1="${legendY + 2}" x2="${lx}" y2="${legendY + 12}" stroke="${style.color}" stroke-width="2"/>`);
      } else {
        parts.push(`<rect x="${lx}" y="${legendY + 2}" width="14" height="10" fill="none" stroke="${style.stroke || '#2aaa10'}" stroke-width="2"/>`);
      }
      lx += 20;
      parts.push(`<text x="${lx}" y="${legendY + 11}" font-size="10" fill="${esc(colors.labelText)}" font-family="sans-serif">${esc(leg.text)}</text>`);
      lx += leg.text.length * 6 + 15;
    }
  }

  parts.push('</g>');
  return parts.join('');
}

for (const [name, provider] of Object.entries(providers)) {
  registerProvider(name, provider);
}

export default { renderBoardSVG, renderAnnotatedSVG, registerProvider, BOARD_STYLES, DEFAULT_COLORS };
