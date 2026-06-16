export const alquerque = {
  name: 'alquerque',
  positionType: 'intersection',
  labelStyle: 'algebraic',

  defaultColors: {
    monoSquare: '#d9b483',
    gridLine: '#8b6914',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 56;
    return { boardW: (opts.cols - 1) * ts, boardH: (opts.rows - 1) * ts };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors } = ctx;
    const bw = (cols - 1) * tileSize;
    const bh = (rows - 1) * tileSize;
    const parts = [`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="${colors.monoSquare}"/>`];

    for (let r = 0; r < rows; r++) {
      const y = oy + r * tileSize;
      parts.push(`<line x1="${ox}" y1="${y}" x2="${ox + bw}" y2="${y}" stroke="${colors.gridLine}" stroke-width="2"/>`);
    }
    for (let c = 0; c < cols; c++) {
      const x = ox + c * tileSize;
      parts.push(`<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + bh}" stroke="${colors.gridLine}" stroke-width="2"/>`);
    }
    for (let r = 0; r < rows - 1; r++) {
      for (let c = 0; c < cols - 1; c++) {
        if ((r + c) % 2 !== 0) continue;
        const x1 = ox + c * tileSize, y1 = oy + r * tileSize;
        const x2 = ox + (c + 1) * tileSize, y2 = oy + (r + 1) * tileSize;
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${colors.gridLine}" stroke-width="1.5"/>`);
        parts.push(`<line x1="${x2}" y1="${y1}" x2="${x1}" y2="${y2}" stroke="${colors.gridLine}" stroke-width="1.5"/>`);
      }
    }
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        parts.push(`<circle cx="${ox + c * tileSize}" cy="${oy + r * tileSize}" r="3" fill="${colors.gridLine}"/>`);
      }
    }
    return parts.join('');
  }
};
