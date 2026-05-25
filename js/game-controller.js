'use strict';
(function() {

const container = document.getElementById('board-container');
const controlsEl = document.getElementById('board-controls');
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

const params = new URLSearchParams(location.search);
const paramVariant = params.get('variant');
const embedMode = params.get('embed') === '1';
const paramP1 = params.get('p1') || 'White';
const paramP2 = params.get('p2') || 'Black';
const paramMode = params.get('mode');

if (embedMode) {
  document.querySelectorAll('.site-nav, .site-footer, #sidebar').forEach(el => el.style.display = 'none');
  document.body.classList.add('embed-mode');
}

const basePath = document.querySelector('script[src*="game-controller"]').src.replace(/js\/game-controller\.js.*/, '');
fetch(basePath + 'assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    if (!embedMode) renderPicker();
    const initVariant = paramVariant && DESCRIPTIONS[paramVariant] ? paramVariant : 'standard';
    startGame(initVariant);
  });

let game, selected, moveNum, currentVariant;
let gameMode = paramMode === 'pass' ? 'pass' : 'solo';
let aiColor = MCE.BLACK;
const playerNames = { w: paramP1, b: paramP2 };
let aiThinking = false;
let gameOver = false;
let undoStack = [];
let flipped = false;
let lastMove = null;
let capturedPieces = { w: [], b: [] };
let pendingPromotion = null;

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

function renderControls() {
  controlsEl.innerHTML = '';

  const flipBtn = document.createElement('button');
  flipBtn.className = 'ctrl-btn';
  flipBtn.textContent = 'Flip Board';
  flipBtn.addEventListener('click', () => {
    flipped = !flipped;
    render();
  });

  const undoBtn = document.createElement('button');
  undoBtn.className = 'ctrl-btn';
  undoBtn.textContent = 'Undo Move';
  undoBtn.disabled = undoStack.length === 0;
  undoBtn.addEventListener('click', () => {
    if (undoStack.length === 0 || aiThinking) return;
    if (gameMode === 'solo') {
      if (undoStack.length >= 2) {
        MCE.unmakeMove(game, undoStack.pop());
        removeMoveFromList();
        MCE.unmakeMove(game, undoStack.pop());
        removeMoveFromList();
      } else if (undoStack.length === 1) {
        MCE.unmakeMove(game, undoStack.pop());
        removeMoveFromList();
      }
    } else {
      MCE.unmakeMove(game, undoStack.pop());
      removeMoveFromList();
    }
    selected = null;
    gameOver = false;
    lastMove = null;
    capturedPieces = { w: [], b: [] };
    renderCaptured();
    renderControls();
    render();
  });

  const newBtn = document.createElement('button');
  newBtn.className = 'ctrl-btn';
  newBtn.textContent = 'New Game';
  newBtn.addEventListener('click', () => {
    startGame(currentVariant);
  });

  controlsEl.appendChild(flipBtn);
  controlsEl.appendChild(undoBtn);
  controlsEl.appendChild(newBtn);
}

function removeMoveFromList() {
  if (movesEl.lastChild) {
    const text = movesEl.lastChild.textContent;
    movesEl.removeChild(movesEl.lastChild);
    if (text.includes('...')) moveNum--;
  }
}

function startGame(variant) {
  currentVariant = variant;
  game = MCE.createGame(variant);
  if (variant === 'chess960') {
    MCE.loadFEN(game, MCE.randomFEN960());
    game.positionHistory = [MCE.positionKey(game)];
  }
  if (variant === 'racingKings') {
    MCE.loadFEN(game, '8/8/8/8/8/8/krbnNBRK/qrbnNBRQ w - - 0 1');
    game.positionHistory = [MCE.positionKey(game)];
  }
  selected = null;
  moveNum = 1;
  gameOver = false;
  aiThinking = false;
  undoStack = [];
  lastMove = null;
  capturedPieces = { w: [], b: [] };
  movesEl.innerHTML = '';

  // Lock container dimensions to prevent layout shift when innerHTML is cleared between renders
  const boardWidth = 480;
  const tileSize = boardWidth / (game.cols || 8);
  const boardHeight = tileSize * (game.rows || 8);
  container.style.width = boardWidth + 'px';
  container.style.height = boardHeight + 'px';

  renderPicker();
  renderDescription();
  renderControls();
  renderCaptured();
  render();
}

function isGameOver() {
  if (gameOver) return true;
  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) return true;
  const status = MCE.getStatus(game);
  return status === 'checkmate' || status === 'stalemate' ||
    status === 'draw-50' || status === 'draw-repetition' || status === 'draw-material';
}

function render() {
  const opts = {
    size: 480,
    selected: selected,
    lastMove: lastMove,
    flipped: flipped,
    animate: true,
    animStyle: 'slide',
    animDuration: 200,
    animEasing: 'ease-out',
    animCaptureBurst: true,
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

function nameFor(color) { return color === MCE.WHITE ? playerNames.w : playerNames.b; }
function nameForOpp(color) { return color === MCE.WHITE ? playerNames.b : playerNames.w; }

function updateStatus() {
  if (game.duckPhase) {
    statusEl.textContent = nameFor(game.turn) + ' — place the duck';
    return;
  }

  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) {
    gameOver = true;
    if (variantStatus.startsWith('koth-')) {
      statusEl.textContent = (variantStatus === 'koth-w' ? playerNames.w : playerNames.b) + ' wins — King of the Hill!';
      return;
    }
    if (variantStatus.startsWith('race-')) {
      statusEl.textContent = (variantStatus === 'race-w' ? playerNames.w : playerNames.b) + ' wins — reached rank 8!';
      return;
    }
    if (variantStatus.startsWith('antichess-')) {
      statusEl.textContent = (variantStatus === 'antichess-w' ? playerNames.w : playerNames.b) + ' wins — lost all pieces!';
      return;
    }
  }

  const status = MCE.getStatus(game);
  const turn = nameFor(game.turn);
  if (status === 'checkmate') {
    gameOver = true;
    statusEl.textContent = 'Checkmate — ' + nameForOpp(game.turn) + ' wins!';
  } else if (status === 'stalemate') {
    gameOver = true;
    statusEl.textContent = 'Stalemate — draw';
  } else if (status === 'draw-repetition') {
    gameOver = true;
    statusEl.textContent = 'Draw — threefold repetition';
  } else if (status === 'draw-material') {
    gameOver = true;
    statusEl.textContent = 'Draw — insufficient material';
  } else if (status === 'draw-50') {
    gameOver = true;
    statusEl.textContent = 'Draw — 50-move rule';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
    if (currentVariant === 'threeCheck') {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= 3) {
        gameOver = true;
        statusEl.textContent = nameForOpp(game.turn) + ' wins — Three checks!';
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
  if (pendingPromotion) return;
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
    if (candidates.length > 1 && candidates[0].promo) {
      showPromotionDialog(candidates, game.turn);
      return;
    }
    if (candidates.length > 0) {
      executeMove(candidates[0]);
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

function executeMove(move) {
  const side = game.turn;
  trackCaptures(move, side);
  const undo = MCE.makeMove(game, move);
  undoStack.push(undo);
  lastMove = { from: move.from, to: move.to };
  addMoveToList(move, side);
  selected = null;
  renderControls();
  renderCaptured();
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
}

function getPromotionPieces() {
  if (currentVariant === 'capablanca' || currentVariant === 'grand') {
    return ['q', 'r', 'b', 'n', 'a', 'c'];
  }
  return ['q', 'r', 'b', 'n'];
}

const PROMO_NAMES = {
  q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', a: 'Archbishop', c: 'Chancellor'
};

function showPromotionDialog(candidates, side) {
  pendingPromotion = { candidates: candidates, side: side };
  var pieces = getPromotionPieces();
  var isWhite = side === MCE.WHITE;

  var backdrop = document.createElement('div');
  backdrop.className = 'promo-backdrop';
  backdrop.id = 'promo-dialog';

  var panel = document.createElement('div');
  panel.className = 'promo-panel';

  var title = document.createElement('div');
  title.className = 'promo-panel__title';
  title.textContent = 'Promote to';
  panel.appendChild(title);

  var row = document.createElement('div');
  row.className = 'promo-panel__pieces';

  var firstBtn = null;
  pieces.forEach(function(p) {
    var matching = candidates.find(function(m) { return m.promo === p; });
    if (!matching) return;

    var btn = document.createElement('button');
    btn.className = 'promo-piece-btn';
    btn.setAttribute('aria-label', 'Promote to ' + PROMO_NAMES[p]);
    btn.setAttribute('tabindex', '0');

    var svgId = isWhite ? p.toUpperCase() : p.toLowerCase();
    btn.innerHTML = '<svg viewBox="0 0 45 45"><use href="#piece-' + svgId + '"/></svg>';

    btn.addEventListener('click', function() { completePromotion(p); });
    row.appendChild(btn);

    if (!firstBtn) firstBtn = btn;
  });

  panel.appendChild(row);
  backdrop.appendChild(panel);

  backdrop.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') cancelPromotion();
  });

  document.body.appendChild(backdrop);
  if (firstBtn) setTimeout(function() { firstBtn.focus(); }, 0);
}

function completePromotion(promoType) {
  if (!pendingPromotion) return;
  var move = pendingPromotion.candidates.find(function(m) { return m.promo === promoType; });
  pendingPromotion = null;
  dismissPromotionDialog();
  if (move) executeMove(move);
}

function cancelPromotion() {
  pendingPromotion = null;
  selected = null;
  dismissPromotionDialog();
  render();
}

function dismissPromotionDialog() {
  var el = document.getElementById('promo-dialog');
  if (el) el.remove();
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
  trackCaptures(move, side);
  const undo = MCE.makeMove(game, move);
  undoStack.push(undo);
  lastMove = { from: move.from, to: move.to };
  addMoveToList(move, side);

  if (currentVariant === 'duckChess' && game.duckPhase) {
    const duckSq = MCE.aiPickDuckSquare(game);
    if (duckSq >= 0) placeDuck(duckSq);
  }

  aiThinking = false;
  renderControls();
  renderCaptured();
  render();
}

function doAIMoveMarseillais() {
  const move1 = MCE.aiPickMove(game, getAIDepth());
  if (!move1) { aiThinking = false; render(); return; }

  const side = game.turn;
  trackCaptures(move1, side);
  const undo1 = MCE.makeMove(game, move1);
  undoStack.push(undo1);
  lastMove = { from: move1.from, to: move1.to };
  addMoveToList(move1, side);

  if (game.turn === side && game.movesThisTurn === 1) {
    const move2 = MCE.aiPickMove(game, getAIDepth());
    if (move2) {
      trackCaptures(move2, side);
      const undo2 = MCE.makeMove(game, move2);
      undoStack.push(undo2);
      lastMove = { from: move2.from, to: move2.to };
      addMoveToList(move2, side);
    }
  }

  aiThinking = false;
  renderControls();
  renderCaptured();
  render();
}

function getAIDepth() {
  const total = game.rows * game.cols;
  if (total > 80) return 1;
  if (total > 64) return 2;
  return 3;
}

function trackCaptures(move, movingSide) {
  const capturedPiece = game.board[move.to];

  if (capturedPiece) {
    capturedPieces[movingSide].push(capturedPiece);
  } else if (move.flag === 'ep') {
    const [fr] = MCE.rc(move.from, game);
    const [, tc] = MCE.rc(move.to, game);
    const epCapSq = MCE.sq(fr, tc, game);
    if (game.board[epCapSq]) capturedPieces[movingSide].push(game.board[epCapSq]);
  }

  if (currentVariant === 'atomic' && (capturedPiece || move.flag === 'ep')) {
    const [tr, tc] = MCE.rc(move.to, game);
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        if (dr === 0 && dc === 0) continue;
        const nr = tr + dr, nc = tc + dc;
        if (!MCE.onBoard(nr, nc, game)) continue;
        const adjSq = MCE.sq(nr, nc, game);
        const adjP = game.board[adjSq];
        if (adjP && MCE.pieceType(adjP) !== 'p') {
          const pColor = MCE.pieceColor(adjP);
          const capSide = pColor === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
          capturedPieces[capSide].push(adjP);
        }
      }
    }
    const mover = game.board[move.from];
    if (mover && MCE.pieceType(mover) !== 'p') {
      const moverColor = MCE.pieceColor(mover);
      const capSide = moverColor === MCE.WHITE ? MCE.BLACK : MCE.WHITE;
      capturedPieces[capSide].push(mover);
    }
  }
}

function renderCaptured() {
  const capturedEl = document.getElementById('captured');
  if (!capturedEl) return;

  const SVGns = 'http://www.w3.org/2000/svg';
  capturedEl.innerHTML = '';

  const whiteRow = document.createElement('div');
  whiteRow.className = 'captured-row';
  const whiteLabel = document.createElement('span');
  whiteLabel.className = 'captured-label';
  whiteLabel.textContent = 'White:';
  whiteRow.appendChild(whiteLabel);
  for (const p of sortCaptured(capturedPieces.w)) {
    whiteRow.appendChild(createPieceIcon(p, SVGns));
  }

  const blackRow = document.createElement('div');
  blackRow.className = 'captured-row';
  const blackLabel = document.createElement('span');
  blackLabel.className = 'captured-label';
  blackLabel.textContent = 'Black:';
  blackRow.appendChild(blackLabel);
  for (const p of sortCaptured(capturedPieces.b)) {
    blackRow.appendChild(createPieceIcon(p, SVGns));
  }

  capturedEl.appendChild(whiteRow);
  capturedEl.appendChild(blackRow);
}

function createPieceIcon(piece, SVGns) {
  const svg = document.createElementNS(SVGns, 'svg');
  svg.setAttribute('width', '26');
  svg.setAttribute('height', '26');
  svg.setAttribute('viewBox', '0 0 45 45');
  svg.setAttribute('class', 'captured-piece');
  const use = document.createElementNS(SVGns, 'use');
  use.setAttribute('href', '#piece-' + piece);
  use.setAttribute('width', '45');
  use.setAttribute('height', '45');
  svg.appendChild(use);
  return svg;
}

function sortCaptured(pieces) {
  const order = { q: 0, r: 1, a: 2, c: 3, b: 4, n: 5, s: 6, p: 7 };
  return [...pieces].sort((a, b) => {
    const ta = MCE.pieceType(a);
    const tb = MCE.pieceType(b);
    return (order[ta] || 9) - (order[tb] || 9);
  });
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
