export const monoGrid = {
  name: 'mono-grid',
  positionType: 'square',
  labelStyle: 'algebraic',

  defaultColors: {
    monoSquare: '#d9b483',
    gridLine: '#8b6914',
    throneFill: '#c8822a',
    cornerFill: '#2d5a3d',
    edgeFill: '#c8822a',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 56;
    return { boardW: opts.cols * ts, boardH: opts.rows * ts };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors, opts } = ctx;
    const bw = cols * tileSize;
    const bh = rows * tileSize;
    const parts = [`<rect x="${ox}" y="${oy}" width="${bw}" height="${bh}" fill="${colors.monoSquare}"/>`];

    const markers = (opts && opts.markers) || [];
    const MARKER_OPACITY = { throne: 0.55, corner: 0.5, edge: 0.25 };
    for (const m of markers) {
      const [r, c] = algToRC(m.sq, rows);
      if (r < 0 || r >= rows || c < 0 || c >= cols) continue;
      const x = ox + c * tileSize;
      const y = oy + r * tileSize;
      const fill = colors[`${m.kind}Fill`] || colors.throneFill;
      const opacity = MARKER_OPACITY[m.kind] != null ? MARKER_OPACITY[m.kind] : 0.4;
      parts.push(`<rect x="${x}" y="${y}" width="${tileSize}" height="${tileSize}" fill="${fill}" opacity="${opacity}"/>`);
    }

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

function algToRC(alg, rows) {
  return [rows - parseInt(alg.slice(1), 10), alg.charCodeAt(0) - 97];
}
