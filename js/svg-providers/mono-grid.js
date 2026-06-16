export const monoGrid = {
  name: 'mono-grid',
  positionType: 'square',
  labelStyle: 'algebraic',

  defaultColors: {
    monoSquare: '#d9b483',
    gridLine: '#8b6914',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 56;
    return { boardW: opts.cols * ts, boardH: opts.rows * ts };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors } = ctx;
    const bw = cols * tileSize;
    const bh = rows * tileSize;
    const parts = [`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="${colors.monoSquare}"/>`];
    for (let c = 0; c <= cols; c++) {
      const x = ox + c * tileSize;
      parts.push(`<line x1="${x}" y1="${oy}" x2="${x}" y2="${oy + bh}" stroke="${colors.gridLine}" stroke-width="1.5"/>`);
    }
    for (let r = 0; r <= rows; r++) {
      const y = oy + r * tileSize;
      parts.push(`<line x1="${ox}" y1="${y}" x2="${ox + bw}" y2="${y}" stroke="${colors.gridLine}" stroke-width="1.5"/>`);
    }
    return parts.join('');
  }
};
