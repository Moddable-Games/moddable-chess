const HOSHI_POINTS_9 = [[2,2],[2,6],[6,2],[6,6]];

export const shogi = {
  name: 'shogi',
  positionType: 'intersection',
  labelStyle: 'none',

  defaultColors: {
    background: 'none',
    board: '#e8c97a',
    boardBorder: '#8b6914',
    gridLine: '#6b4e1a',
    hoshi: '#6b4e1a',
    promotionZone: 'rgba(180, 60, 40, 0.08)',
    labelText: '#5a4020',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 40;
    const inset = 20;
    return { boardW: (opts.cols - 1) * ts + inset * 2, boardH: (opts.rows - 1) * ts + inset * 2 };
  },

  getIntersection(r, c, ctx) {
    const { tileSize, ox, oy } = ctx;
    const inset = 20;
    return { x: ox + inset + c * tileSize, y: oy + inset + r * tileSize };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors } = ctx;
    const inset = 20;
    const gridW = (cols - 1) * tileSize;
    const gridH = (rows - 1) * tileSize;
    const gx = ox + inset;
    const gy = oy + inset;
    const parts = [];

    parts.push(`<rect x="${ox}" y="${oy}" width="${gridW + inset * 2}" height="${gridH + inset * 2}" fill="${colors.board}"/>`);
    parts.push(`<rect x="${ox}" y="${oy}" width="${gridW + inset * 2}" height="${gridH + inset * 2}" fill="none" stroke="${colors.boardBorder}" stroke-width="2"/>`);

    if (rows === 9) {
      const promoTop = gy;
      const promoTopH = 2 * tileSize;
      const promoBotY = gy + 6 * tileSize;
      const promoBotH = 2 * tileSize;
      parts.push(`<rect x="${gx}" y="${promoTop}" width="${gridW}" height="${promoTopH}" fill="${colors.promotionZone}"/>`);
      parts.push(`<rect x="${gx}" y="${promoBotY}" width="${gridW}" height="${promoBotH}" fill="${colors.promotionZone}"/>`);
    }

    parts.push(`<g stroke="${colors.gridLine}" stroke-width="0.8">`);
    for (let r = 0; r < rows; r++) {
      const y = gy + r * tileSize;
      parts.push(`<line x1="${gx}" y1="${y}" x2="${gx + gridW}" y2="${y}"/>`);
    }
    for (let c = 0; c < cols; c++) {
      const x = gx + c * tileSize;
      parts.push(`<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy + gridH}"/>`);
    }
    parts.push('</g>');

    if (rows === 9 && cols === 9) {
      parts.push(`<g fill="${colors.hoshi}">`);
      for (const [r, c] of HOSHI_POINTS_9) {
        parts.push(`<circle cx="${gx + c * tileSize}" cy="${gy + r * tileSize}" r="3"/>`);
      }
      parts.push('</g>');
    }

    return parts.join('');
  }
};
