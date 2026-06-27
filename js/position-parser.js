export function positionFromFEN(fen, rows, cols, opts = {}) {
  const position = {};
  const ranks = fen.split(' ')[0].split('/');
  const promotedPrefix = opts.promotedPrefix || null;

  for (let r = 0; r < ranks.length && r < rows; r++) {
    let c = 0;
    let promoted = false;

    for (const ch of ranks[r]) {
      if (c >= cols) break;
      if (promotedPrefix && ch === promotedPrefix) { promoted = true; continue; }
      const num = parseInt(ch);
      if (!isNaN(num)) { c += num; promoted = false; continue; }

      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      position[`${file}${rank}`] = promoted ? `${promotedPrefix}${ch}` : ch;
      c++;
      promoted = false;
    }
  }
  return position;
}

export function positionFromPlacement(config) {
  const { rows, cols, pieceRows, style } = config;
  if (style === 'alquerque') return buildAlquerque(rows, cols);
  if (style === 'turkish') return buildAllSquares(rows, cols, pieceRows);
  return buildDarkSquares(rows, cols, pieceRows);
}

function buildDarkSquares(rows, cols, pieceRows) {
  const position = {};
  const midRow = Math.floor(rows / 2);
  for (const r of pieceRows) {
    for (let c = 0; c < cols; c++) {
      if ((r + c) % 2 !== 0) continue;
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      position[`${file}${rank}`] = { type: 'man', color: r < midRow ? 'black' : 'white' };
    }
  }
  return position;
}

function buildAllSquares(rows, cols, pieceRows) {
  const position = {};
  const midRow = Math.floor(rows / 2);
  for (const r of pieceRows) {
    for (let c = 0; c < cols; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      position[`${file}${rank}`] = { type: 'man', color: r < midRow ? 'black' : 'white' };
    }
  }
  return position;
}

function buildAlquerque(rows, cols) {
  const position = {};
  for (let r = 0; r < 2; r++) {
    for (let c = 0; c < cols; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      position[`${file}${rank}`] = { type: 'man', color: 'black' };
    }
  }
  position['d3'] = { type: 'man', color: 'black' };
  position['e3'] = { type: 'man', color: 'black' };
  for (let r = 3; r < 5; r++) {
    for (let c = 0; c < cols; c++) {
      const file = String.fromCharCode(97 + c);
      const rank = rows - r;
      position[`${file}${rank}`] = { type: 'man', color: 'white' };
    }
  }
  position['a3'] = { type: 'man', color: 'white' };
  position['b3'] = { type: 'man', color: 'white' };
  return position;
}
