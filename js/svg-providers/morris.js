export const morris = {
  name: 'morris',
  positionType: 'node',
  labelStyle: 'none',

  defaultColors: {
    background: '#f5e6c8',
    line: '#4a3520',
    point: '#4a3520',
    whitePieceFill: '#ffffff',
    whitePieceStroke: '#333333',
    blackPieceFill: '#1c1c1c',
    blackPieceStroke: '#888888',
  },

  computeLayout(opts) {
    const size = opts.boardSize || 320;
    return { boardW: size, boardH: size };
  },

  render(ctx) {
    const { colors, opts, ox, oy } = ctx;
    const size = opts.boardSize || 320;
    const rings = opts.rings || 3;
    const diagonals = opts.diagonals || false;
    const midpoints = opts.midpoints !== false;
    const pointRadius = opts.pointRadius || 7;

    const parts = [];
    parts.push(`<rect x="${ox}" y="${oy}" width="${size}" height="${size}" fill="${colors.background}" rx="4"/>`);

    const center = size / 2;
    const cx = ox + center;
    const cy = oy + center;

    const ringRects = computeRings(rings, size, ox, oy);

    parts.push(`<g fill="none" stroke="${colors.line}" stroke-width="2.5" stroke-linecap="square">`);
    for (const rect of ringRects) {
      parts.push(`<rect x="${rect.x}" y="${rect.y}" width="${rect.w}" height="${rect.h}"/>`);
    }

    if (midpoints) {
      if (rings === 1) {
        const r = ringRects[0];
        parts.push(`<line x1="${cx}" y1="${r.y}" x2="${cx}" y2="${r.y + r.h}"/>`);
        parts.push(`<line x1="${r.x}" y1="${cy}" x2="${r.x + r.w}" y2="${cy}"/>`);
      } else {
        parts.push(`<line x1="${cx}" y1="${ringRects[0].y}" x2="${cx}" y2="${ringRects[rings - 1].y}"/>`);
        const lastRect = ringRects[rings - 1];
        parts.push(`<line x1="${cx}" y1="${lastRect.y + lastRect.h}" x2="${cx}" y2="${ringRects[0].y + ringRects[0].h}"/>`);
        parts.push(`<line x1="${ringRects[0].x}" y1="${cy}" x2="${ringRects[rings - 1].x}" y2="${cy}"/>`);
        parts.push(`<line x1="${ringRects[rings - 1].x + ringRects[rings - 1].w}" y1="${cy}" x2="${ringRects[0].x + ringRects[0].w}" y2="${cy}"/>`);
      }
    }

    if (diagonals) {
      if (rings === 1) {
        const r = ringRects[0];
        parts.push(`<line x1="${r.x}" y1="${r.y}" x2="${r.x + r.w}" y2="${r.y + r.h}"/>`);
        parts.push(`<line x1="${r.x + r.w}" y1="${r.y}" x2="${r.x}" y2="${r.y + r.h}"/>`);
      } else {
        const outer = ringRects[0];
        const inner = ringRects[rings - 1];
        parts.push(`<line x1="${outer.x}" y1="${outer.y}" x2="${inner.x}" y2="${inner.y}"/>`);
        parts.push(`<line x1="${outer.x + outer.w}" y1="${outer.y}" x2="${inner.x + inner.w}" y2="${inner.y}"/>`);
        parts.push(`<line x1="${outer.x}" y1="${outer.y + outer.h}" x2="${inner.x}" y2="${inner.y + inner.h}"/>`);
        parts.push(`<line x1="${outer.x + outer.w}" y1="${outer.y + outer.h}" x2="${inner.x + inner.w}" y2="${inner.y + inner.h}"/>`);
      }
    }

    parts.push('</g>');

    const points = computePoints(ringRects, midpoints, cx, cy, rings);
    parts.push(`<g fill="${colors.point}">`);
    for (const p of points) {
      parts.push(`<circle cx="${p.x}" cy="${p.y}" r="${pointRadius}"/>`);
    }
    parts.push('</g>');

    return parts.join('');
  }
};

function computeRings(rings, size, ox, oy) {
  const rects = [];
  const margin = size * 0.0625;
  const maxInset = size * 0.375;
  const step = rings > 1 ? (maxInset - margin) / (rings - 1) : 0;

  for (let i = 0; i < rings; i++) {
    const inset = margin + i * step;
    rects.push({
      x: ox + inset,
      y: oy + inset,
      w: size - inset * 2,
      h: size - inset * 2,
    });
  }
  return rects;
}

function computePoints(ringRects, midpoints, cx, cy, rings) {
  const points = [];
  for (const rect of ringRects) {
    points.push({ x: rect.x, y: rect.y });
    points.push({ x: rect.x + rect.w, y: rect.y });
    points.push({ x: rect.x + rect.w, y: rect.y + rect.h });
    points.push({ x: rect.x, y: rect.y + rect.h });

    if (midpoints) {
      points.push({ x: cx, y: rect.y });
      points.push({ x: rect.x + rect.w, y: cy });
      points.push({ x: cx, y: rect.y + rect.h });
      points.push({ x: rect.x, y: cy });
    }
  }

  if (rings === 1 && midpoints) {
    points.push({ x: cx, y: cy });
  }

  return points;
}
