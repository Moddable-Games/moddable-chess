const LAYOUT = [
  [1,1,1,1,0,0,1,1],
  [1,1,1,1,1,1,1,1],
  [1,1,1,1,0,0,1,1],
];

const ROSETTES = [[0,0],[0,6],[1,3],[2,0],[2,6]];

export const royalUr = {
  name: 'royal-ur',
  positionType: 'square',
  labelStyle: 'numeric',

  defaultColors: {
    background: 'none',
    cellFill: '#d4b896',
    cellStroke: '#8b7355',
    borderStroke: '#5a4020',
    rosetteColor: '#8b3a3a',
    rosetteDot: '#a04848',
    detailLine: '#c4a882',
    labelText: '#5a4020',
  },

  computeLayout(opts) {
    const ts = opts.tileSize || 40;
    return { boardW: 8 * ts, boardH: 3 * ts + 20 };
  },

  render(ctx) {
    const { tileSize, ox, oy, colors, opts } = ctx;
    const ts = tileSize;
    const parts = [];
    const cellOx = ox;
    const cellOy = oy + 10;

    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if (!LAYOUT[r][c]) continue;
        const x = cellOx + c * ts;
        const y = cellOy + r * ts;
        parts.push(`<rect x="${x}" y="${y}" width="${ts}" height="${ts}" fill="${colors.cellFill}" stroke="${colors.cellStroke}" stroke-width="1.5"/>`);
      }
    }

    parts.push(`<g stroke="${colors.detailLine}" stroke-width="0.5" opacity="0.6">`);
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 8; c++) {
        if (!LAYOUT[r][c]) continue;
        if (isRosette(r, c)) continue;
        const x = cellOx + c * ts;
        const y = cellOy + r * ts;
        parts.push(`<line x1="${x}" y1="${y}" x2="${x + ts}" y2="${y + ts}"/>`);
        parts.push(`<line x1="${x + ts}" y1="${y}" x2="${x}" y2="${y + ts}"/>`);
      }
    }
    parts.push('</g>');

    for (const [r, c] of ROSETTES) {
      const x = cellOx + c * ts;
      const y = cellOy + r * ts;
      parts.push(drawRosette(x, y, ts, colors));
    }

    parts.push(drawBorder(cellOx, cellOy, ts, colors));

    return parts.join('');
  }
};

function isRosette(r, c) {
  return ROSETTES.some(([rr, cc]) => rr === r && cc === c);
}

function drawRosette(x, y, ts, colors) {
  const cx = x + ts / 2;
  const cy = y + ts / 2;
  const parts = [];
  parts.push(`<circle cx="${cx}" cy="${cy}" r="${ts * 0.125}" fill="${colors.rosetteColor}"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy - ts * 0.25}" r="${ts * 0.075}" fill="${colors.rosetteColor}"/>`);
  parts.push(`<circle cx="${cx}" cy="${cy + ts * 0.25}" r="${ts * 0.075}" fill="${colors.rosetteColor}"/>`);
  parts.push(`<circle cx="${cx - ts * 0.25}" cy="${cy}" r="${ts * 0.075}" fill="${colors.rosetteColor}"/>`);
  parts.push(`<circle cx="${cx + ts * 0.25}" cy="${cy}" r="${ts * 0.075}" fill="${colors.rosetteColor}"/>`);
  parts.push(`<circle cx="${cx - ts * 0.2}" cy="${cy - ts * 0.2}" r="${ts * 0.05}" fill="${colors.rosetteDot}"/>`);
  parts.push(`<circle cx="${cx + ts * 0.2}" cy="${cy - ts * 0.2}" r="${ts * 0.05}" fill="${colors.rosetteDot}"/>`);
  parts.push(`<circle cx="${cx - ts * 0.2}" cy="${cy + ts * 0.2}" r="${ts * 0.05}" fill="${colors.rosetteDot}"/>`);
  parts.push(`<circle cx="${cx + ts * 0.2}" cy="${cy + ts * 0.2}" r="${ts * 0.05}" fill="${colors.rosetteDot}"/>`);
  return parts.join('');
}

function drawBorder(cellOx, cellOy, ts, colors) {
  const x0 = cellOx;
  const y0 = cellOy;
  const d = [
    `M ${x0},${y0}`,
    `L ${x0 + 4 * ts},${y0}`,
    `L ${x0 + 4 * ts},${y0 + ts}`,
    `L ${x0 + 6 * ts},${y0 + ts}`,
    `L ${x0 + 6 * ts},${y0}`,
    `L ${x0 + 8 * ts},${y0}`,
    `L ${x0 + 8 * ts},${y0 + 3 * ts}`,
    `L ${x0 + 6 * ts},${y0 + 3 * ts}`,
    `L ${x0 + 6 * ts},${y0 + 2 * ts}`,
    `L ${x0 + 4 * ts},${y0 + 2 * ts}`,
    `L ${x0 + 4 * ts},${y0 + 3 * ts}`,
    `L ${x0},${y0 + 3 * ts}`,
    'Z'
  ].join(' ');
  return `<path fill="none" stroke="${colors.borderStroke}" stroke-width="2" stroke-linejoin="round" d="${d}"/>`;
}
