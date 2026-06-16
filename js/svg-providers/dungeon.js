export const dungeon = {
  name: 'dungeon',
  positionType: 'square',
  labelStyle: 'none',

  defaultColors: {
    background: 'none',
    voidFill: '#1a1a2e',
    floor: '#d4c4a8',
    water: '#4a90c8',
    'spawn-a': '#f0d080',
    'spawn-b': '#f0b0b0',
    cellStroke: '#2a2a2a',
    'spawn-a-stroke': '#c08820',
    'spawn-b-stroke': '#c05050',
    legendText: '#333333',
  },

  computeLayout(opts) {
    const cellSize = opts.cellSize || 19;
    const gap = opts.cellGap || 2;
    const step = cellSize + gap;
    const terrain = opts.terrain || [];
    const rows = terrain.length;
    const cols = rows > 0 ? terrain[0].length : 8;
    const legendH = opts.showLegend !== false ? 40 : 0;
    return { boardW: cols * step + gap, boardH: rows * step + gap + legendH };
  },

  render(ctx) {
    const { ox, oy, colors, opts } = ctx;
    const terrain = opts.terrain || [];
    const rows = terrain.length;
    const cols = rows > 0 ? terrain[0].length : 8;
    const cellSize = opts.cellSize || 19;
    const gap = opts.cellGap || 2;
    const step = cellSize + gap;
    const showLegend = opts.showLegend !== false;
    const parts = [];

    const boardW = cols * step + gap;
    const boardH = rows * step + gap;

    const hasVoid = terrain.some(row => row.some(c => c === null || c === 'void'));
    if (hasVoid) {
      parts.push(`<rect x="${ox}" y="${oy}" width="${boardW}" height="${boardH}" rx="6" ry="6" fill="${colors.voidFill}"/>`);
    }

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const type = terrain[r][c];
        if (!type || type === 'void') continue;

        let fill = colors[type] || colors.floor;
        let stroke = colors.cellStroke;
        let strokeWidth = 1;
        let opacity = '';

        if (type === 'spawn-a') {
          stroke = colors['spawn-a-stroke'];
          strokeWidth = 2;
        } else if (type === 'spawn-b') {
          stroke = colors['spawn-b-stroke'];
          strokeWidth = 2;
        } else if (type === 'water') {
          opacity = ' opacity="0.5"';
        }

        const x = ox + gap + c * step;
        const y = oy + gap + r * step;
        parts.push(`<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacity}/>`);
      }
    }

    if (showLegend) {
      const ly = oy + boardH + 10;
      const fs = 10;
      let lx = ox;

      const legendItems = [
        { type: 'floor', label: 'Floor' },
        { type: 'water', label: 'Water' },
        { type: 'spawn-a', label: 'P1 Deploy' },
        { type: 'spawn-b', label: 'P2 Deploy' },
      ];

      for (const item of legendItems) {
        const fill = colors[item.type] || colors.floor;
        let extra = '';
        if (item.type === 'water') extra = ' opacity="0.5"';
        const stroke = item.type.startsWith('spawn') ? colors[`${item.type}-stroke`] : colors.cellStroke;
        const sw = item.type.startsWith('spawn') ? 1 : 0.5;

        parts.push(`<rect x="${lx}" y="${ly}" width="10" height="10" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra}/>`);
        lx += 14;
        parts.push(`<text x="${lx}" y="${ly + 9}" font-family="sans-serif" font-size="${fs}" fill="${colors.legendText}">${item.label}</text>`);
        lx += item.label.length * 6 + 10;
      }
    }

    return parts.join('');
  }
};
