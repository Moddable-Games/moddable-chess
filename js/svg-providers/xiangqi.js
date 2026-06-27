export const xiangqi = {
  name: 'xiangqi',
  positionType: 'intersection',
  labelStyle: 'none',

  defaultColors: {
    background: 'none',
    board: '#f5deb3',
    gridLine: '#4a3520',
    river: '#f5deb3',
    riverText: '#4a3520',
    palace: '#4a3520',
    labelText: '#4a3520',
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
    const { rows, cols, tileSize, ox, oy, colors, opts } = ctx;
    const river = opts.river !== false;
    const inset = 20;
    const gridW = (cols - 1) * tileSize;
    const gridH = (rows - 1) * tileSize;
    const gx = ox + inset;
    const gy = oy + inset;
    const parts = [];

    parts.push(`<rect x="${ox}" y="${oy}" width="${gridW + inset * 2}" height="${gridH + inset * 2}" fill="${colors.board}"/>`);
    parts.push(`<rect x="${ox}" y="${oy}" width="${gridW + inset * 2}" height="${gridH + inset * 2}" fill="none" stroke="${colors.gridLine}" stroke-width="2"/>`);

    parts.push(`<g stroke="${colors.gridLine}" stroke-width="1">`);
    if (river) {
      for (let r = 0; r < rows; r++) {
        if (r === 4 || r === 5) continue;
        const y = gy + r * tileSize;
        parts.push(`<line x1="${gx}" y1="${y}" x2="${gx + gridW}" y2="${y}"/>`);
      }
      const riverY1 = gy + 4 * tileSize;
      const riverY2 = gy + 5 * tileSize;
      parts.push(`<line x1="${gx}" y1="${riverY1}" x2="${gx + gridW}" y2="${riverY1}"/>`);
      parts.push(`<line x1="${gx}" y1="${riverY2}" x2="${gx + gridW}" y2="${riverY2}"/>`);

      for (let c = 0; c < cols; c++) {
        const x = gx + c * tileSize;
        if (c === 0 || c === cols - 1) {
          parts.push(`<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy + gridH}"/>`);
        } else {
          parts.push(`<line x1="${x}" y1="${gy}" x2="${x}" y2="${riverY1}"/>`);
          parts.push(`<line x1="${x}" y1="${riverY2}" x2="${x}" y2="${gy + gridH}"/>`);
        }
      }
    } else {
      for (let r = 0; r < rows; r++) {
        const y = gy + r * tileSize;
        parts.push(`<line x1="${gx}" y1="${y}" x2="${gx + gridW}" y2="${y}"/>`);
      }
      for (let c = 0; c < cols; c++) {
        const x = gx + c * tileSize;
        parts.push(`<line x1="${x}" y1="${gy}" x2="${x}" y2="${gy + gridH}"/>`);
      }
    }
    parts.push('</g>');

    // Palace diagonals
    const palaceLeft = gx + 3 * tileSize;
    const palaceRight = gx + 5 * tileSize;
    const topPalaceTop = gy;
    const topPalaceBot = gy + 2 * tileSize;
    const botPalaceTop = gy + 7 * tileSize;
    const botPalaceBot = gy + 9 * tileSize;

    parts.push(`<g stroke="${colors.palace}" stroke-width="0.8" stroke-dasharray="4,3">`);
    parts.push(`<line x1="${palaceLeft}" y1="${topPalaceTop}" x2="${palaceRight}" y2="${topPalaceBot}"/>`);
    parts.push(`<line x1="${palaceRight}" y1="${topPalaceTop}" x2="${palaceLeft}" y2="${topPalaceBot}"/>`);
    parts.push(`<line x1="${palaceLeft}" y1="${botPalaceTop}" x2="${palaceRight}" y2="${botPalaceBot}"/>`);
    parts.push(`<line x1="${palaceRight}" y1="${botPalaceTop}" x2="${palaceLeft}" y2="${botPalaceBot}"/>`);
    parts.push('</g>');

    if (river) {
      const riverY1 = gy + 4 * tileSize;
      const riverY2 = gy + 5 * tileSize;
      const riverMidY = (riverY1 + riverY2) / 2;
      parts.push(`<text x="${gx + gridW * 0.25}" y="${riverMidY + 5}" text-anchor="middle" font-size="14" font-family="serif" fill="${colors.riverText}">楚 河</text>`);
      parts.push(`<text x="${gx + gridW * 0.75}" y="${riverMidY + 5}" text-anchor="middle" font-size="14" font-family="serif" fill="${colors.riverText}">漢 界</text>`);
    }

    return parts.join('');
  }
};
