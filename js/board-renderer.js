'use strict';
/**
 * SVG board renderer for standard 8×8 chess
 */
(function() {

const { rc, sq, sqToAlgebraic } = MCE;
const SVGns = 'http://www.w3.org/2000/svg';

const LIGHT_SQ = '#f0d9b5';
const DARK_SQ = '#b58863';
const HIGHLIGHT = 'rgba(255, 255, 0, 0.4)';
const MOVE_DOT = 'rgba(0, 0, 0, 0.2)';
const CAPTURE_RING = 'rgba(0, 0, 0, 0.2)';

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVGns, tag);
  if (attrs) Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

function renderBoard(container, game, opts) {
  opts = opts || {};
  const size = opts.size || 480;
  const tileSize = size / 8;
  const flipped = opts.flipped || false;
  const selected = opts.selected; // sq index or null
  const legalMoves = opts.legalMoves || [];
  const onSquareClick = opts.onSquareClick;

  container.innerHTML = '';
  const svg = svgEl('svg', { width: size, height: size, viewBox: `0 0 ${size} ${size}` });

  // Draw squares
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const dr = flipped ? 7 - r : r;
      const dc = flipped ? 7 - c : c;
      const x = c * tileSize, y = r * tileSize;
      const isLight = (dr + dc) % 2 === 0;
      const sqIdx = sq(dr, dc);

      const rect = svgEl('rect', {
        x, y, width: tileSize, height: tileSize,
        fill: isLight ? LIGHT_SQ : DARK_SQ,
      });
      svg.appendChild(rect);

      if (sqIdx === selected) {
        svg.appendChild(svgEl('rect', {
          x, y, width: tileSize, height: tileSize, fill: HIGHLIGHT,
        }));
      }
    }
  }

  // Draw legal move indicators
  for (const move of legalMoves) {
    const [tr, tc] = rc(move.to);
    const dr = flipped ? 7 - tr : tr;
    const dc = flipped ? 7 - tc : tc;
    const cx = dc * tileSize + tileSize / 2;
    const cy = dr * tileSize + tileSize / 2;
    const isCapture = game.board[move.to] || move.flag === 'ep';

    if (isCapture) {
      svg.appendChild(svgEl('circle', {
        cx, cy, r: tileSize * 0.45,
        fill: 'none', stroke: CAPTURE_RING, 'stroke-width': tileSize * 0.08,
      }));
    } else {
      svg.appendChild(svgEl('circle', {
        cx, cy, r: tileSize * 0.15, fill: MOVE_DOT,
      }));
    }
  }

  // Draw fog overlay (darken hidden squares)
  const fogMask = opts.fogMask || null;
  if (fogMask) {
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const dr = flipped ? 7 - r : r;
        const dc = flipped ? 7 - c : c;
        const sqIdx = sq(dr, dc);
        if (!fogMask.has(sqIdx)) {
          svg.appendChild(svgEl('rect', {
            x: c * tileSize, y: r * tileSize, width: tileSize, height: tileSize,
            fill: 'rgba(0,0,0,0.6)',
          }));
        }
      }
    }
  }

  // Draw pieces
  for (let i = 0; i < 64; i++) {
    const p = game.board[i];
    if (!p) continue;
    if (fogMask && !fogMask.has(i)) continue;
    const [pr, pc] = rc(i);
    const dr = flipped ? 7 - pr : pr;
    const dc = flipped ? 7 - pc : pc;
    const x = dc * tileSize + tileSize * 0.05;
    const y = dr * tileSize + tileSize * 0.05;
    const pieceSize = tileSize * 0.9;

    const use = svgEl('use', {
      href: '#piece-' + p,
      x, y, width: pieceSize, height: pieceSize,
    });
    svg.appendChild(use);
  }

  // Draw duck
  const duckSq = opts.duckSq;
  if (duckSq !== null && duckSq !== undefined && duckSq >= 0) {
    const [dr2, dc2] = rc(duckSq);
    const ddr = flipped ? 7 - dr2 : dr2;
    const ddc = flipped ? 7 - dc2 : dc2;
    const cx = ddc * tileSize + tileSize / 2;
    const cy = ddr * tileSize + tileSize / 2;
    svg.appendChild(svgEl('circle', {
      cx, cy, r: tileSize * 0.35,
      fill: '#f5c542', stroke: '#b8860b', 'stroke-width': 2,
    }));
    const txt = svgEl('text', {
      x: cx, y: cy + 5, 'text-anchor': 'middle', 'font-size': tileSize * 0.3, fill: '#6b4c00',
    });
    txt.textContent = '🦆';
    svg.appendChild(txt);
  }

  // Click handler
  if (onSquareClick) {
    const overlay = svgEl('rect', {
      x: 0, y: 0, width: size, height: size,
      fill: 'transparent', style: 'cursor:pointer',
    });
    overlay.addEventListener('click', (e) => {
      const rect = svg.getBoundingClientRect();
      const px = e.clientX - rect.left;
      const py = e.clientY - rect.top;
      const c = Math.floor(px / tileSize);
      const r = Math.floor(py / tileSize);
      const dr = flipped ? 7 - r : r;
      const dc = flipped ? 7 - c : c;
      if (dr >= 0 && dr < 8 && dc >= 0 && dc < 8) {
        onSquareClick(sq(dr, dc));
      }
    });
    svg.appendChild(overlay);
  }

  container.appendChild(svg);
  return svg;
}

Object.assign(MCE, { renderBoard });
})();
