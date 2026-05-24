'use strict';
(function() {

const container = document.getElementById('board-container');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');

// Inject piece SVG defs
fetch('assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    init();
  });

let game, selected, legal;

function init() {
  game = MCE.createGame('standard');
  selected = null;
  legal = [];
  render();
}

function render() {
  const allMoves = MCE.legalMoves(game);
  const movesForSelected = selected !== null
    ? allMoves.filter(m => m.from === selected)
    : [];

  MCE.renderBoard(container, game, {
    size: 480,
    selected: selected,
    legalMoves: movesForSelected,
    onSquareClick: handleClick,
  });

  const status = MCE.getStatus(game);
  const turn = game.turn === MCE.WHITE ? 'White' : 'Black';
  if (status === 'checkmate') statusEl.textContent = turn + ' is checkmated!';
  else if (status === 'stalemate') statusEl.textContent = 'Stalemate — draw';
  else if (status === 'check') statusEl.textContent = turn + ' to move (check!)';
  else statusEl.textContent = turn + ' to move';
}

function handleClick(sq) {
  const piece = game.board[sq];
  const allMoves = MCE.legalMoves(game);

  if (selected !== null) {
    const move = allMoves.find(m => m.from === selected && m.to === sq);
    if (move) {
      MCE.makeMove(game, move);
      addMoveToList(move);
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

function addMoveToList(move) {
  const from = MCE.sqToAlgebraic(move.from);
  const to = MCE.sqToAlgebraic(move.to);
  const piece = game.board[move.to] || '';
  const num = Math.ceil(game.fullmove);
  const dot = game.turn === MCE.WHITE ? '...' : '.';
  const entry = document.createElement('div');
  entry.textContent = num + dot + ' ' + from + to + (move.promo || '');
  movesEl.appendChild(entry);
  movesEl.scrollTop = movesEl.scrollHeight;
}

})();
