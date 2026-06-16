export const dungeon = {
  name: 'dungeon',
  positionType: 'square',
  labelStyle: 'none',

  defaultColors: {
    background: '#1a1a2e',
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
    const ts = opts.tileSize || 20;
    const terrain = opts.terrain || [];
    const rows = terrain.length;
    const cols = rows > 0 ? terrain[0].length : 8;
    const legendH = opts.showLegend !== false ? 40 : 0;
    return { boardW: cols * ts, boardH: rows * ts + legendH };
  },

  render(ctx) {
    const { tileSize, ox, oy, colors, opts } = ctx;
    const terrain = opts.terrain || [];
    const rows = terrain.length;
    const cols = rows > 0 ? terrain[0].length : 8;
    const ts = tileSize;
    const showLegend = opts.showLegend !== false;
    const parts = [];

    const boardW = cols * ts;
    const boardH = rows * ts;
    parts.push(`<rect x="${ox}" y="${oy}" width="${boardW}" height="${boardH}" rx="6" ry="6" fill="${colors.background}"/>`);

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

        parts.push(`<rect x="${ox + c * ts}" y="${oy + r * ts}" width="${ts - 1}" height="${ts - 1}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"${opacity}/>`);
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
