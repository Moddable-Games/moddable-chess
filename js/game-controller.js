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
  if (variant === 'chess960') {
    MCE.loadFEN(game, MCE.randomFEN960());
  }
  if (variant === 'racingKings') {
    MCE.loadFEN(game, 'qnnbbrkr/8/8/8/8/8/8/QNNBBRKR w - - 0 1');
  }
  selected = null;
  moveNum = 1;
  movesEl.innerHTML = '';
  renderPicker();
  render();
}

function render() {
  const allMoves = getMovesForVariant();
  const movesForSelected = selected !== null
    ? allMoves.filter(m => m.from === selected)
    : [];

  MCE.renderBoard(container, game, {
    size: 480,
    selected: selected,
    legalMoves: movesForSelected,
    onSquareClick: handleClick,
  });

  updateStatus();
}

function getMovesForVariant() {
  if (MCE.variantLegalMoves && (currentVariant === 'antichess' || currentVariant === 'racingKings')) {
    return MCE.variantLegalMoves(game);
  }
  return MCE.legalMoves(game);
}

function updateStatus() {
  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) {
    if (variantStatus.startsWith('koth-')) {
      const w = variantStatus === 'koth-w' ? 'White' : 'Black';
      statusEl.textContent = w + ' wins — King of the Hill!';
      return;
    }
    if (variantStatus.startsWith('race-')) {
      const w = variantStatus === 'race-w' ? 'White' : 'Black';
      statusEl.textContent = w + ' wins — reached rank 8!';
      return;
    }
    if (variantStatus.startsWith('antichess-')) {
      const w = variantStatus === 'antichess-w' ? 'White' : 'Black';
      statusEl.textContent = w + ' wins — lost all pieces!';
      return;
    }
  }

  const status = MCE.getStatus(game);
  const turn = game.turn === MCE.WHITE ? 'White' : 'Black';
  if (status === 'checkmate') {
    const winner = game.turn === MCE.WHITE ? 'Black' : 'White';
    statusEl.textContent = 'Checkmate — ' + winner + ' wins!';
  } else if (status === 'stalemate') {
    statusEl.textContent = 'Stalemate — draw';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
    if (currentVariant === 'threeCheck') {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= 3) {
        const winner = game.turn === MCE.WHITE ? 'Black' : 'White';
        statusEl.textContent = winner + ' wins — Three checks!';
      }
    }
  } else {
    statusEl.textContent = turn + ' to move';
  }
}

function handleClick(sq) {
  const piece = game.board[sq];
  const allMoves = getMovesForVariant();

  if (selected !== null) {
    let candidates = allMoves.filter(m => m.from === selected && m.to === sq);
    if (candidates.length > 1) {
      candidates = candidates.filter(m => m.promo === 'q');
    }
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
