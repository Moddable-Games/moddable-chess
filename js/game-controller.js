'use strict';
(function() {

const container = document.getElementById('board-container');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');
const pickerEl = document.getElementById('variant-picker');
const descEl = document.getElementById('description');

const DESCRIPTIONS = {
  standard: { title: 'Standard Chess', text: 'Classic FIDE chess. Checkmate the opponent\'s king to win.', rule: 'Board: 8×8 · Win: Checkmate' },
  kingOfTheHill: { title: 'King of the Hill', text: 'Standard rules, plus an instant win if your king reaches any of the four centre squares (d4, d5, e4, e5).', rule: 'Board: 8×8 · Win: Checkmate or king reaches centre' },
  threeCheck: { title: 'Three-Check', text: 'Standard rules, but delivering three checks to your opponent wins immediately — no need for checkmate.', rule: 'Board: 8×8 · Win: Checkmate or 3 checks' },
  antichess: { title: 'Antichess', text: 'Captures are mandatory. The goal is to lose all your pieces. No check, no castling — the king is just another piece.', rule: 'Board: 8×8 · Win: Lose all pieces or get stalemated' },
  racingKings: { title: 'Racing Kings', text: 'No checks allowed at any point. Both sides race their king to rank 8. First to arrive wins.', rule: 'Board: 8×8 · Win: King reaches rank 8' },
  chess960: { title: 'Fischer Random (Chess960)', text: 'Standard rules but the back rank is randomised from 960 possible positions. Bishops on opposite colours, king between rooks.', rule: 'Board: 8×8 · Win: Checkmate' },
  rifle: { title: 'Rifle Chess', text: 'When you capture a piece, your piece stays on its original square — it "shoots" the target from a distance.', rule: 'Board: 8×8 · Win: Checkmate' },
  atomic: { title: 'Atomic Chess', text: 'Captures cause explosions that destroy all non-pawn pieces on adjacent squares, including the capturer. If a king is caught in the blast, that side loses.', rule: 'Board: 8×8 · Win: Explode opponent\'s king' },
  marseillais: { title: 'Marseillais Chess', text: 'Each player makes two moves per turn (except White\'s first turn). If your first move gives check, your turn ends immediately.', rule: 'Board: 8×8 · Win: Checkmate' },
  duckChess: { title: 'Duck Chess', text: 'After each move, place the duck (yellow blocker) on any empty square. The duck blocks all movement. Win by capturing the opponent\'s king — no check warnings.', rule: 'Board: 8×8 · Win: Capture king' },
  fogOfWar: { title: 'Fog of War', text: 'You can only see squares your pieces can legally move to. Hidden squares are darkened. No check warnings — you must capture the king to win.', rule: 'Board: 8×8 · Win: Capture king' },
  capablanca: { title: 'Capablanca Chess', text: 'Invented by world champion José Capablanca. Adds two new pieces: the Archbishop (bishop + knight) and Chancellor (rook + knight) on a wider board.', rule: 'Board: 10×8 · Win: Checkmate' },
  grand: { title: 'Grand Chess', text: 'Same new pieces as Capablanca on a larger board. Pawns start on rank 3. No castling. Promotion only to previously captured pieces.', rule: 'Board: 10×10 · Win: Checkmate' },
  courier: { title: 'Courier Chess', text: 'Medieval German variant from the 1200s. Uses a 12-column board with extra bishops and Sage pieces (move one step in any direction, non-royal).', rule: 'Board: 12×8 · Win: Checkmate' },
};

const VARIANT_LIST = [
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

const basePath = document.querySelector('script[src*="game-controller"]').src.replace(/js\/game-controller\.js.*/, '');
fetch(basePath + 'assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    renderPicker();
    startGame('standard');
  });

let game, selected, moveNum, currentVariant;
let gameMode = 'solo';
let aiColor = MCE.BLACK;
let aiThinking = false;
let gameOver = false;

function renderPicker() {
  pickerEl.innerHTML = '';

  const modeBar = document.createElement('div');
  modeBar.className = 'mode-bar';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'mode-btn' + (gameMode === 'solo' ? ' mode-btn--active' : '');
  soloBtn.textContent = 'Solo';
  soloBtn.addEventListener('click', () => { gameMode = 'solo'; aiColor = MCE.BLACK; renderPicker(); startGame(currentVariant || 'standard'); });

  const passBtn = document.createElement('button');
  passBtn.className = 'mode-btn' + (gameMode === 'pass' ? ' mode-btn--active' : '');
  passBtn.textContent = 'Pass & Play';
  passBtn.addEventListener('click', () => { gameMode = 'pass'; renderPicker(); startGame(currentVariant || 'standard'); });

  modeBar.appendChild(soloBtn);
  modeBar.appendChild(passBtn);
  pickerEl.appendChild(modeBar);

  const variantListEl = document.createElement('div');
  variantListEl.className = 'variant-list';
  VARIANT_LIST.forEach(([key, label]) => {
    const btn = document.createElement('button');
    btn.className = 'variant-btn' + (key === currentVariant ? ' variant-btn--active' : '');
    btn.textContent = label;
    btn.addEventListener('click', () => startGame(key));
    variantListEl.appendChild(btn);
  });
  pickerEl.appendChild(variantListEl);
}

function renderDescription() {
  const d = DESCRIPTIONS[currentVariant];
  if (!d) { descEl.innerHTML = ''; return; }
  descEl.innerHTML = `<h3>${d.title}</h3><p>${d.text}</p><div class="desc-rule">${d.rule}</div>`;
}

function startGame(variant) {
  currentVariant = variant;
  game = MCE.createGame(variant);
  if (variant === 'chess960') MCE.loadFEN(game, MCE.randomFEN960());
  if (variant === 'racingKings') MCE.loadFEN(game, '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1');
  selected = null;
  moveNum = 1;
  gameOver = false;
  aiThinking = false;
  movesEl.innerHTML = '';
  renderPicker();
  renderDescription();
  render();
}

function isGameOver() {
  if (gameOver) return true;
  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) return true;
  const status = MCE.getStatus(game);
  return status === 'checkmate' || status === 'stalemate' || status === 'draw-50';
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
  } else if (!aiThinking || game.turn !== aiColor) {
    const allMoves = getMovesForVariant();
    opts.legalMoves = selected !== null ? allMoves.filter(m => m.from === selected) : [];
  }

  if (currentVariant === 'fogOfWar') {
    const viewSide = gameMode === 'solo' ? (aiColor === MCE.BLACK ? MCE.WHITE : MCE.BLACK) : game.turn;
    opts.fogMask = computeVisibility(game, viewSide);
  }

  MCE.renderBoard(container, game, opts);
  updateStatus();
}

function computeVisibility(g, side) {
  const visible = new Set();
  const total = g.rows * g.cols;
  for (let i = 0; i < total; i++) {
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
    gameOver = true;
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
    gameOver = true;
    statusEl.textContent = 'Checkmate — ' + (game.turn === MCE.WHITE ? 'Black' : 'White') + ' wins!';
  } else if (status === 'stalemate') {
    gameOver = true;
    statusEl.textContent = 'Stalemate — draw';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
    if (currentVariant === 'threeCheck') {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= 3) {
        gameOver = true;
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
  if (gameOver) return;
  if (gameMode === 'solo' && game.turn === aiColor && !game.duckPhase) return;

  if (game.duckPhase) {
    if (gameMode === 'solo' && game.turn !== aiColor) {
      if (!game.board[sq] && sq !== game.duckSq) {
        placeDuck(sq);
        if (!isGameOver() && game.turn === aiColor) {
          scheduleAIMove();
        }
      }
    } else if (gameMode === 'pass') {
      if (!game.board[sq] && sq !== game.duckSq) {
        placeDuck(sq);
      }
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

      if (gameMode === 'solo' && !isGameOver()) {
        if (currentVariant === 'duckChess' && game.duckPhase) {
          // Human places duck, then AI goes
        } else if (currentVariant === 'marseillais' && game.turn !== aiColor) {
          // Human still has second move
        } else {
          scheduleAIMove();
        }
      }
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

function placeDuck(sq) {
  game.duckSq = sq;
  game.duckPhase = false;
  if (game.turn === MCE.BLACK) game.fullmove++;
  game.turn = game.turn === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
  selected = null;
  render();
}

function scheduleAIMove() {
  aiThinking = true;
  render();
  setTimeout(doAIMove, 300);
}

function doAIMove() {
  if (isGameOver()) { aiThinking = false; render(); return; }

  if (currentVariant === 'marseillais') {
    doAIMoveMarseillais();
    return;
  }

  const move = MCE.aiPickMove(game, getAIDepth());
  if (!move) { aiThinking = false; render(); return; }

  const side = game.turn;
  MCE.makeMove(game, move);
  addMoveToList(move, side);

  if (currentVariant === 'duckChess' && game.duckPhase) {
    const duckSq = MCE.aiPickDuckSquare(game);
    if (duckSq >= 0) placeDuck(duckSq);
  }

  aiThinking = false;
  render();
}

function doAIMoveMarseillais() {
  const move1 = MCE.aiPickMove(game, getAIDepth());
  if (!move1) { aiThinking = false; render(); return; }

  const side = game.turn;
  MCE.makeMove(game, move1);
  addMoveToList(move1, side);

  if (game.turn === side && game.movesThisTurn === 1) {
    const move2 = MCE.aiPickMove(game, getAIDepth());
    if (move2) {
      MCE.makeMove(game, move2);
      addMoveToList(move2, side);
    }
  }

  aiThinking = false;
  render();
}

function getAIDepth() {
  const total = game.rows * game.cols;
  if (total > 80) return 1;
  if (total > 64) return 2;
  return 3;
}

function addMoveToList(move, side) {
  const from = MCE.sqToAlgebraic(move.from, game);
  const to = MCE.sqToAlgebraic(move.to, game);
  const prefix = side === MCE.WHITE ? moveNum + '. ' : moveNum + '... ';
  const entry = document.createElement('div');
  entry.textContent = prefix + from + to + (move.promo || '');
  movesEl.appendChild(entry);
  movesEl.scrollTop = movesEl.scrollHeight;
  if (side === MCE.BLACK) moveNum++;
}

})();
