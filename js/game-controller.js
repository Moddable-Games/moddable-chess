'use strict';
(function() {

const container = document.getElementById('board-container');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');
const pickerEl = document.getElementById('variant-picker');

fetch('assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    renderPicker();
    startGame('standard');
  });

let game, selected, moveNum, currentVariant;

function renderPicker() {
  pickerEl.innerHTML = '';
  const variants = [
    ['standard', 'Standard'],
    ['kingOfTheHill', 'King of the Hill'],
    ['threeCheck', 'Three-Check'],
    ['antichess', 'Antichess'],
    ['racingKings', 'Racing Kings'],
    ['chess960', 'Fischer Random'],
    ['rifle', 'Rifle Chess'],
    ['atomic', 'Atomic'],
    ['marseillais', 'Marseillais'],
    ['duckChess', 'Duck Chess'],
    ['fogOfWar', 'Fog of War'],
    ['capablanca', 'Capablanca (10×8)'],
    ['grand', 'Grand Chess (10×10)'],
    ['courier', 'Courier (12×8)'],
  ];
  variants.forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'variant-btn' + (key === currentVariant ? ' variant-btn--active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => startGame(key));
    pickerEl.appendChild(btn);
  });
}

function startGame(variant) {
  currentVariant = variant;
  game = MCE.createGame(variant);
  if (variant === 'chess960') MCE.loadFEN(game, MCE.randomFEN960());
  if (variant === 'racingKings') MCE.loadFEN(game, '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1');
  selected = null;
  moveNum = 1;
  movesEl.innerHTML = '';
  renderPicker();
  render();
}

function render() {
  const opts = {
    size: 480,
    selected: selected,
    legalMoves: [],
    onSquareClick: handleClick,
    fogMask: null,
    duckSq: game.duckSq >= 0 ? game.duckSq : null,
  };

  if (game.duckPhase) {
    opts.legalMoves = [];
  } else {
    const allMoves = getMovesForVariant();
    opts.legalMoves = selected !== null ? allMoves.filter(m => m.from === selected) : [];
  }

  if (currentVariant === 'fogOfWar') {
    opts.fogMask = computeVisibility(game, game.turn);
  }

  MCE.renderBoard(container, game, opts);
  updateStatus();
}

function computeVisibility(g, side) {
  const visible = new Set();
  for (let i = 0; i < 64; i++) {
    const p = g.board[i];
    if (!p || MCE.pieceColor(p) !== side) continue;
    visible.add(i);
    const moves = MCE.pseudoLegalMoves({ ...g, turn: side });
    moves.filter(m => m.from === i).forEach(m => visible.add(m.to));
  }
  return visible;
}

function getMovesForVariant() {
  if (currentVariant === 'antichess' || currentVariant === 'racingKings') {
    return MCE.variantLegalMoves(game);
  }
  return MCE.legalMoves(game);
}

function updateStatus() {
  if (game.duckPhase) {
    const turn = game.turn === MCE.WHITE ? 'White' : 'Black';
    statusEl.textContent = turn + ' — place the duck';
    return;
  }

  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) {
    if (variantStatus.startsWith('koth-')) {
      statusEl.textContent = (variantStatus === 'koth-w' ? 'White' : 'Black') + ' wins — King of the Hill!';
      return;
    }
    if (variantStatus.startsWith('race-')) {
      statusEl.textContent = (variantStatus === 'race-w' ? 'White' : 'Black') + ' wins — reached rank 8!';
      return;
    }
    if (variantStatus.startsWith('antichess-')) {
      statusEl.textContent = (variantStatus === 'antichess-w' ? 'White' : 'Black') + ' wins — lost all pieces!';
      return;
    }
  }

  const status = MCE.getStatus(game);
  const turn = game.turn === MCE.WHITE ? 'White' : 'Black';
  if (status === 'checkmate') {
    statusEl.textContent = 'Checkmate — ' + (game.turn === MCE.WHITE ? 'Black' : 'White') + ' wins!';
  } else if (status === 'stalemate') {
    statusEl.textContent = 'Stalemate — draw';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
    if (currentVariant === 'threeCheck') {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= 3) {
        statusEl.textContent = (game.turn === MCE.WHITE ? 'Black' : 'White') + ' wins — Three checks!';
      }
    }
  } else if (currentVariant === 'marseillais' && game.movesThisTurn === 1) {
    statusEl.textContent = turn + ' — second move';
  } else {
    statusEl.textContent = turn + ' to move';
  }
}

function handleClick(sq) {
  if (game.duckPhase) {
    if (!game.board[sq] && sq !== game.duckSq) {
      const oldDuck = game.duckSq;
      game.duckSq = sq;
      game.duckPhase = false;
      if (game.turn === MCE.BLACK) game.fullmove++;
      game.turn = game.turn === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
      selected = null;
      render();
      return;
    }
    return;
  }

  const piece = game.board[sq];
  const allMoves = getMovesForVariant();

  if (selected !== null) {
    let candidates = allMoves.filter(m => m.from === selected && m.to === sq);
    if (candidates.length > 1) candidates = candidates.filter(m => m.promo === 'q');
    if (candidates.length > 0) {
      const move = candidates[0];
      const side = game.turn;
      MCE.makeMove(game, move);
      addMoveToList(move, side);
      selected = null;
      render();
      return;
    }
  }

  if (piece && MCE.pieceColor(piece) === game.turn) {
    selected = sq;
  } else {
    selected = null;
  }
  render();
}

function addMoveToList(move, side) {
  const from = MCE.sqToAlgebraic(move.from);
  const to = MCE.sqToAlgebraic(move.to);
  const prefix = side === MCE.WHITE ? moveNum + '. ' : moveNum + '... ';
  const entry = document.createElement('div');
  entry.textContent = prefix + from + to + (move.promo || '');
  movesEl.appendChild(entry);
  movesEl.scrollTop = movesEl.scrollHeight;
  if (side === MCE.BLACK) moveNum++;
}

})();
