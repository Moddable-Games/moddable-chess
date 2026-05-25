'use strict';
(function() {

const { rc, sq, sqToAlgebraic } = MCE;
const SVGns = 'http://www.w3.org/2000/svg';

const LIGHT_SQ = '#f0d9b5';
const DARK_SQ = '#b58863';
const HIGHLIGHT = 'rgba(255, 255, 0, 0.4)';
const LAST_MOVE = 'rgba(100, 180, 255, 0.3)';
const MOVE_DOT = 'rgba(0, 0, 0, 0.2)';
const CAPTURE_RING = 'rgba(0, 0, 0, 0.2)';

function svgEl(tag, attrs) {
  const el = document.createElementNS(SVGns, tag);
  if (attrs) Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
  return el;
}

let prevPiecePositions = null;

function renderBoard(container, game, opts) {
  opts = opts || {};
  const rows = game.rows || 8;
  const cols = game.cols || 8;
  const size = opts.size || 480;
  const tileSize = size / cols;
  const height = tileSize * rows;
  const flipped = opts.flipped || false;
  const selected = opts.selected;
  const lastMove = opts.lastMove || null;
  const legalMoves = opts.legalMoves || [];
  const onSquareClick = opts.onSquareClick;

  const animate = opts.animate || false;
  const animStyle = opts.animStyle || 'slide';
  const animDuration = opts.animDuration || 200;
  const animEasing = opts.animEasing || 'ease-out';
  const animArcHeight = opts.animArcHeight || 0.25;
  const animCaptureBurst = opts.animCaptureBurst || false;

  container.innerHTML = '';
  const svg = svgEl('svg', { width: size, height: height, viewBox: `0 0 ${size} ${height}` });

  // Draw squares
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const dr = flipped ? rows - 1 - r : r;
      const dc = flipped ? cols - 1 - c : c;
      const x = c * tileSize, y = r * tileSize;
      const isLight = (dr + dc) % 2 === 0;
      const sqIdx = MCE.sq(dr, dc, game);

      const rect = svgEl('rect', {
        x, y, width: tileSize, height: tileSize,
        fill: isLight ? LIGHT_SQ : DARK_SQ,
      });
      svg.appendChild(rect);

      if (lastMove && (sqIdx === lastMove.from || sqIdx === lastMove.to)) {
        svg.appendChild(svgEl('rect', {
          x, y, width: tileSize, height: tileSize, fill: LAST_MOVE,
        }));
      }

      if (sqIdx === selected) {
        svg.appendChild(svgEl('rect', {
          x, y, width: tileSize, height: tileSize, fill: HIGHLIGHT,
        }));
      }
    }
  }

  // Draw legal move indicators
  for (const move of legalMoves) {
    const [tr, tc] = MCE.rc(move.to, game);
    const dr = flipped ? rows - 1 - tr : tr;
    const dc = flipped ? cols - 1 - tc : tc;
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

  // Draw fog overlay
  const fogMask = opts.fogMask || null;
  if (fogMask) {
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const dr = flipped ? rows - 1 - r : r;
        const dc = flipped ? cols - 1 - c : c;
        const sqIdx = MCE.sq(dr, dc, game);
        if (!fogMask.has(sqIdx)) {
          svg.appendChild(svgEl('rect', {
            x: c * tileSize, y: r * tileSize, width: tileSize, height: tileSize,
            fill: 'rgba(0,0,0,0.6)',
          }));
        }
      }
    }
  }

  // Build current piece positions map
  const currentPositions = new Map();
  const total = rows * cols;
  for (let i = 0; i < total; i++) {
    const p = game.board[i];
    if (!p) continue;
    if (fogMask && !fogMask.has(i)) continue;
    const [pr, pc] = MCE.rc(i, game);
    const dr = flipped ? rows - 1 - pr : pr;
    const dc = flipped ? cols - 1 - pc : pc;
    const x = dc * tileSize + tileSize * 0.05;
    const y = dr * tileSize + tileSize * 0.05;
    currentPositions.set(i, { piece: p, x, y });
  }

  // Determine which piece to animate and whether it's a capture
  let animateFromX = null, animateFromY = null, animateToSq = null;
  let isAnimCapture = false;
  if (animate && lastMove && prevPiecePositions) {
    const fromSq = lastMove.from;
    const toSq = lastMove.to;
    const prev = prevPiecePositions.get(fromSq);
    if (prev && currentPositions.has(toSq)) {
      animateFromX = prev.x;
      animateFromY = prev.y;
      animateToSq = toSq;
      isAnimCapture = prevPiecePositions.has(toSq) && prevPiecePositions.get(toSq).piece !== currentPositions.get(toSq).piece;
    }
  }

  // Draw pieces
  for (const [sqIdx, pos] of currentPositions) {
    const pieceSize = tileSize * 0.9;
    const use = svgEl('use', {
      href: '#piece-' + pos.piece,
      width: pieceSize,
      height: pieceSize,
    });

    if (animate && sqIdx === animateToSq && animateFromX !== null) {
      if (animStyle === 'arc') {
        use.setAttribute('x', pos.x);
        use.setAttribute('y', pos.y);
        use.setAttribute('transform', 'translate(0, 0)');
        svg.appendChild(use);
        animateArc(svg, use, animateFromX, animateFromY, pos.x, pos.y, tileSize, animDuration, animArcHeight, pos.piece);
      } else {
        const dx = animateFromX - pos.x;
        const dy = animateFromY - pos.y;
        use.setAttribute('x', pos.x);
        use.setAttribute('y', pos.y);
        use.setAttribute('transform', `translate(${dx}, ${dy})`);
        use.style.transition = `transform ${animDuration}ms ${animEasing}`;
        svg.appendChild(use);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            use.setAttribute('transform', 'translate(0, 0)');
          });
        });
      }
    } else {
      use.setAttribute('x', pos.x);
      use.setAttribute('y', pos.y);
      svg.appendChild(use);
    }
  }

  // Capture burst effect
  if (animate && animCaptureBurst && isAnimCapture && animateToSq !== null) {
    const pos = currentPositions.get(animateToSq);
    if (pos) {
      const burstDelay = animStyle === 'arc' ? animDuration : animDuration * 0.8;
      setTimeout(() => captureBurst(svg, pos.x + tileSize * 0.45, pos.y + tileSize * 0.45, tileSize), burstDelay);
    }
  }

  // Save positions for next render
  prevPiecePositions = currentPositions;

  // Draw duck
  const duckSq = opts.duckSq;
  if (duckSq !== null && duckSq !== undefined && duckSq >= 0) {
    const [dr2, dc2] = MCE.rc(duckSq, game);
    const ddr = flipped ? rows - 1 - dr2 : dr2;
    const ddc = flipped ? cols - 1 - dc2 : dc2;
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
      x: 0, y: 0, width: size, height: height,
      fill: 'transparent', style: 'cursor:pointer',
    });
    overlay.addEventListener('click', (e) => {
      const rect = svg.getBoundingClientRect();
      const scaleX = size / rect.width;
      const scaleY = height / rect.height;
      const px = (e.clientX - rect.left) * scaleX;
      const py = (e.clientY - rect.top) * scaleY;
      const c = Math.floor(px / tileSize);
      const r = Math.floor(py / tileSize);
      const dr = flipped ? rows - 1 - r : r;
      const dc = flipped ? cols - 1 - c : c;
      if (dr >= 0 && dr < rows && dc >= 0 && dc < cols) {
        onSquareClick(MCE.sq(dr, dc, game));
      }
    });
    svg.appendChild(overlay);
  }

  container.appendChild(svg);
  return svg;
}

function animateArc(svg, use, fromX, fromY, toX, toY, tileSize, duration, arcFactor, piece) {
  const dx = toX - fromX;
  const dy = toY - fromY;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const arcHeight = Math.min(dist * arcFactor, tileSize * 0.8);
  const startTime = performance.now();

  function frame(now) {
    const elapsed = now - startTime;
    const t = Math.min(elapsed / duration, 1);

    const ease = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    const cx = fromX + dx * ease;
    const cy = fromY + dy * ease;
    const arc = arcHeight * 4 * t * (1 - t);
    const scale = 1 + 0.15 * Math.sin(t * Math.PI);

    const offsetX = cx - toX;
    const offsetY = (cy - arc) - toY;
    use.setAttribute('transform', `translate(${offsetX}, ${offsetY}) scale(${scale})`);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      use.setAttribute('transform', 'translate(0, 0)');
    }
  }

  const offsetX = fromX - toX;
  const offsetY = fromY - toY;
  use.setAttribute('transform', `translate(${offsetX}, ${offsetY})`);
  requestAnimationFrame(frame);
}

function captureBurst(svg, cx, cy, tileSize) {
  const flash = svgEl('g', { style: 'pointer-events:none' });

  const ring = svgEl('circle', { cx, cy, r: tileSize * 0.15,
    fill: 'none', stroke: 'rgba(255,100,40,0.95)', 'stroke-width': 3 });
  flash.appendChild(ring);

  const particleCount = 8;
  for (let i = 0; i < particleCount; i++) {
    const angle = (i / particleCount) * Math.PI * 2;
    flash.appendChild(svgEl('circle', {
      cx: cx + Math.cos(angle) * tileSize * 0.1,
      cy: cy + Math.sin(angle) * tileSize * 0.1,
      r: 2.5, fill: 'rgba(255,220,60,0.95)'
    }));
  }

  const innerFlash = svgEl('circle', { cx, cy, r: tileSize * 0.3,
    fill: 'rgba(255,200,80,0.4)' });
  flash.appendChild(innerFlash);

  svg.appendChild(flash);

  const start = performance.now();
  const FLASH_DURATION = 400;
  function frameFlash(now) {
    const t = Math.min((now - start) / FLASH_DURATION, 1);
    const ease = 1 - Math.pow(1 - t, 3);

    ring.setAttribute('r', tileSize * 0.15 + ease * tileSize * 0.6);
    ring.setAttribute('stroke-opacity', 1 - ease);
    ring.setAttribute('stroke-width', 3 * (1 - ease * 0.7));

    innerFlash.setAttribute('r', tileSize * 0.3 * (1 - ease));
    innerFlash.setAttribute('opacity', 1 - ease);

    const particles = flash.querySelectorAll('circle:not(:first-child):not(:last-child)');
    particles.forEach((p, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const dist = tileSize * 0.1 + ease * tileSize * 0.55;
      p.setAttribute('cx', cx + Math.cos(angle) * dist);
      p.setAttribute('cy', cy + Math.sin(angle) * dist);
      p.setAttribute('opacity', 1 - ease * ease);
      p.setAttribute('r', 2.5 * (1 - ease * 0.5));
    });

    if (t < 1) requestAnimationFrame(frameFlash);
    else flash.remove();
  }
  requestAnimationFrame(frameFlash);
}

Object.assign(MCE, { renderBoard, captureBurst });
})();
