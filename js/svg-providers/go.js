const STAR_POINTS = {
  9:  [[2,2],[2,6],[4,4],[6,2],[6,6]],
  13: [[3,3],[3,9],[6,6],[9,3],[9,9]],
  19: [[3,3],[3,9],[3,15],[9,3],[9,9],[9,15],[15,3],[15,9],[15,15]],
};

export const go = {
  name: 'go',
  positionType: 'intersection',
  labelStyle: 'go',

  defaultColors: {
    background: '#dcb35c',
    woodDark: '#d4a843',
    gridLine: '#3d2b1a',
    labelText: '#5a4020',
    starPoint: '#3d2b1a',
    whitePieceFill: '#ffffff',
    whitePieceStroke: '#333333',
    blackPieceFill: '#1c1c1c',
    blackPieceStroke: '#888888',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 20;
    return { boardW: (opts.cols - 1) * ts + 30, boardH: (opts.rows - 1) * ts + 30 };
  },

  getIntersection(r, c, ctx) {
    const { tileSize, ox, oy } = ctx;
    return { x: ox + 15 + c * tileSize, y: oy + 15 + r * tileSize };
  },

  render(ctx) {
    const { rows, cols, tileSize, ox, oy, colors } = ctx;
    const gridSpacing = tileSize;
    const inset = 15;
    const boardW = (cols - 1) * gridSpacing + inset * 2;
    const boardH = (rows - 1) * gridSpacing + inset * 2;
    const parts = [];

    parts.push(`<rect x="${ox}" y="${oy}" width="${boardW}" height="${boardH}" fill="${colors.woodDark}" rx="2"/>`);

    const gridOx = ox + inset;
    const gridOy = oy + inset;

    parts.push(`<g stroke="${colors.gridLine}" stroke-width="0.8">`);
    for (let r = 0; r < rows; r++) {
      const y = gridOy + r * gridSpacing;
      parts.push(`<line x1="${gridOx}" y1="${y}" x2="${gridOx + (cols - 1) * gridSpacing}" y2="${y}"/>`);
    }
    for (let c = 0; c < cols; c++) {
      const x = gridOx + c * gridSpacing;
      parts.push(`<line x1="${x}" y1="${gridOy}" x2="${x}" y2="${gridOy + (rows - 1) * gridSpacing}"/>`);
    }
    parts.push('</g>');

    const stars = STAR_POINTS[rows] || [];
    if (stars.length > 0) {
      parts.push(`<g fill="${colors.starPoint}">`);
      for (const [r, c] of stars) {
        parts.push(`<circle cx="${gridOx + c * gridSpacing}" cy="${gridOy + r * gridSpacing}" r="3"/>`);
      }
      parts.push('</g>');
    }

    return parts.join('');
  }
};
