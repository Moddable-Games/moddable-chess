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
    const boardW = cols * step + gap;
    let legendH = 0;
    if (opts.showLegend !== false) {
      const charWidth = 5.8;
      const swatchSize = 10;
      const swatchTextGap = 4;
      const itemGap = 8;
      const labels = ['Floor', 'Water', 'P1 Deploy', 'P2 Deploy'];
      const totalW = labels.reduce((sum, l) => sum + swatchSize + swatchTextGap + l.length * charWidth + itemGap, -itemGap);
      const numRows = Math.ceil(totalW / boardW) || 1;
      legendH = 12 + numRows * 16 + 4;
    }
    return { boardW, boardH: rows * step + gap + legendH };
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
      parts.push(`<rect x="${ox}" y="${oy}" width="${boardW}" height="${boardH}" fill="${colors.voidFill}"/>`);
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
      const fs = 10;
      const swatchSize = 10;
      const itemGap = 8;
      const swatchTextGap = 4;
      const charWidth = 5.8;
      const rowHeight = 16;

      const legendItems = [
        { type: 'floor', label: 'Floor' },
        { type: 'water', label: 'Water' },
        { type: 'spawn-a', label: 'P1 Deploy' },
        { type: 'spawn-b', label: 'P2 Deploy' },
      ];

      const itemWidths = legendItems.map(item =>
        swatchSize + swatchTextGap + item.label.length * charWidth);

      const rows = [];
      let currentRow = [];
      let currentRowW = 0;
      for (let i = 0; i < legendItems.length; i++) {
        const w = itemWidths[i] + (currentRow.length > 0 ? itemGap : 0);
        if (currentRow.length > 0 && currentRowW + w > boardW) {
          rows.push(currentRow);
          currentRow = [i];
          currentRowW = itemWidths[i];
        } else {
          currentRow.push(i);
          currentRowW += w;
        }
      }
      if (currentRow.length > 0) rows.push(currentRow);

      const lyBase = oy + boardH + 12;
      for (let ri = 0; ri < rows.length; ri++) {
        const row = rows[ri];
        const rowW = row.reduce((sum, i) => sum + itemWidths[i], 0) + (row.length - 1) * itemGap;
        let lx = ox + (boardW - rowW) / 2;
        const ly = lyBase + ri * rowHeight;

        for (const i of row) {
          const item = legendItems[i];
          const fill = colors[item.type] || colors.floor;
          let extra = '';
          if (item.type === 'water') extra = ' opacity="0.5"';
          const stroke = item.type.startsWith('spawn') ? colors[`${item.type}-stroke`] : colors.cellStroke;
          const sw = item.type.startsWith('spawn') ? 1 : 0.5;

          parts.push(`<rect x="${lx}" y="${ly}" width="${swatchSize}" height="${swatchSize}" fill="${fill}" stroke="${stroke}" stroke-width="${sw}"${extra}/>`);
          lx += swatchSize + swatchTextGap;
          parts.push(`<text x="${lx}" y="${ly + 8}" font-family="sans-serif" font-size="${fs}" fill="${colors.legendText}">${item.label}</text>`);
          lx += item.label.length * charWidth + itemGap;
        }
      }
    }

    return parts.join('');
  }
};
