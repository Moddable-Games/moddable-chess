'use strict';
(function() {

const container = document.getElementById('board-container');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');

fetch('assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    init();
  });

let game, selected, moveNum;

function init() {
  game = MCE.createGame('standard');
  selected = null;
  moveNum = 1;
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
  if (status === 'checkmate') {
    const winner = game.turn === MCE.WHITE ? 'Black' : 'White';
    statusEl.textContent = 'Checkmate — ' + winner + ' wins!';
  } else if (status === 'stalemate') {
    statusEl.textContent = 'Stalemate — draw';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
  } else {
    statusEl.textContent = turn + ' to move';
  }
}

function handleClick(sq) {
  const piece = game.board[sq];
  const allMoves = MCE.legalMoves(game);

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
