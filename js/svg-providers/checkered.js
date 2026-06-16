export const checkered = {
  name: 'checkered',
  positionType: 'square',
  labelStyle: 'algebraic',

  defaultColors: {
    lightSquare: '#f0d9b5',
    darkSquare: '#b58863',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 56;
    return { boardW: opts.cols * ts, boardH: opts.rows * ts };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors } = ctx;
    const parts = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const fill = (r + c) % 2 === 0 ? colors.lightSquare : colors.darkSquare;
        parts.push(`<rect x="${ox + c * tileSize}" y="${oy + r * tileSize}" width="${tileSize}" height="${tileSize}" fill="${fill}"/>`);
      }
    }
    return parts.join('');
  }
};
