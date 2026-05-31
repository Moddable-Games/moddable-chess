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
  noCastling: { title: 'No Castling', text: 'Standard chess with castling disabled. Endorsed by Vladimir Kramnik and played in elite tournaments. Forces creative king safety solutions.', rule: 'Board: 8×8 · Win: Checkmate' },
  torpedo: { title: 'Torpedo Chess', text: 'Pawns can always move two squares forward, not just from their starting rank. Makes pawns far more dynamic and endgames completely different.', rule: 'Board: 8×8 · Win: Checkmate' },
  horde: { title: 'Horde Chess', text: 'Massively asymmetric — White has 36 pawns filling ranks 1-4, Black has a normal army. Black wins by checkmate or eliminating all White pieces. White wins by checkmating Black.', rule: 'Board: 8×8 · Win: Checkmate (Black) or eliminate horde (Black)' },
  extinction: { title: 'Extinction Chess', text: 'You lose when any one piece type is completely eliminated from your army. Protecting your last bishop matters more than protecting your king.', rule: 'Board: 8×8 · Win: Eliminate a piece type' },
  breakthrough: { title: 'Breakthrough', text: 'Only pawns on a 7×7 board. First to reach the far rank wins. No promotion — just push through. Simple to learn, deep to master. Used in AI competitions.', rule: 'Board: 7×7 · Win: Reach far rank' },
  maharaja: { title: 'Maharaja & Sepoys', text: 'Extreme asymmetry — White has only a Maharaja (Queen + Knight compound piece) against Black\'s full army. The Maharaja must checkmate Black\'s king alone.', rule: 'Board: 8×8 · Win: Checkmate' },
  knightmate: { title: 'Knightmate', text: 'The roles of king and knight are swapped. The knight is the royal piece that must be checkmated, while the king moves like a knight and is expendable.', rule: 'Board: 8×8 · Win: Checkmate knight' },
  monsterChess: { title: 'Monster Chess', text: 'White has only a king and rooks but gets two moves per turn. Black has a full army with one move per turn. Giving check ends your turn early.', rule: 'Board: 8×8 · Win: Checkmate' },
  progressive: { title: 'Progressive Chess', text: 'White makes 1 move, then Black makes 2, White makes 3, Black makes 4, and so on — escalating each turn. Giving check ends your turn immediately.', rule: 'Board: 8×8 · Win: Checkmate' },
  chigorin: { title: 'Chigorin Chess', text: 'White has knights instead of bishops, Black has the standard army. Named after Mikhail Chigorin. White\'s knights provide a tactical edge but lack long-range diagonal control.', rule: 'Board: 8×8 · Win: Checkmate' },
  almostChess: { title: 'Almost Chess', text: 'Identical to standard chess except one queen is replaced by a Chancellor (Rook + Knight compound). Subtle but significant strategic shift.', rule: 'Board: 8×8 · Win: Checkmate' },
  amazonChess: { title: 'Amazon Chess', text: 'Both sides have an Amazon (Queen + Knight compound) instead of a regular Queen. The most powerful piece in fairy chess on a standard board.', rule: 'Board: 8×8 · Win: Checkmate' },
  endgameChess: { title: 'Endgame Chess', text: 'Start with only pawns and kings — no back-rank pieces. Pure endgame technique from move one. Great for endgame practice.', rule: 'Board: 8×8 · Win: Checkmate' },
  peasantsRevolt: { title: "Peasants' Revolt", text: 'Asymmetric: White has a king and 8 pawns against Black\'s king and 2 knights. Can the peasant army overwhelm the cavalry?', rule: 'Board: 8×8 · Win: Checkmate' },
  pawnsOnly: { title: 'Pawns Only', text: 'Only pawns and kings on the board. First player to promote a pawn (or checkmate) wins. Simple to learn, surprisingly deep.', rule: 'Board: 8×8 · Win: Checkmate or promotion' },
  upsideDown: { title: 'Upside-Down Chess', text: 'Pieces start on the opponent\'s back rank — white pieces on rank 8, black on rank 1. Pawns march "backward" toward promotion. Chaotic opening.', rule: 'Board: 8×8 · Win: Checkmate' },
  singleCheck: { title: 'Single-Check', text: 'Deliver just one check to win instantly. Ultra-aggressive variant where every move is a potential game-ender. King safety is everything.', rule: 'Board: 8×8 · Win: One check' },
  fiveCheck: { title: 'Five-Check', text: 'Like Three-Check but you need five checks to win. More strategic than Single-Check, more aggressive than standard.', rule: 'Board: 8×8 · Win: 5 checks or checkmate' },
  giveaway: { title: 'Giveaway Chess', text: 'Captures are mandatory. Lose all your pieces to win. Unlike Antichess, being stalemated means you LOSE (not win). FICS rules.', rule: 'Board: 8×8 · Win: Lose all pieces' },
  suicideChess: { title: 'Suicide Chess', text: 'Captures are mandatory. Lose all your pieces to win. Stalemate is a draw (not a win for either side). The gentlest losing-chess variant.', rule: 'Board: 8×8 · Win: Lose all pieces' },
  stalemateWins: { title: 'Stalemate Wins', text: 'Standard chess rules but stalemate is a WIN for the stalemating side (not a draw). Completely changes endgame theory.', rule: 'Board: 8×8 · Win: Checkmate or stalemate' },
  codrus: { title: 'Codrus', text: 'Named after the Athenian king who sacrificed himself. Lose your king to win. No check concept — you must arrange for your own king to be captured.', rule: 'Board: 8×8 · Win: Lose your king' },
  makpong: { title: 'Makpong', text: 'Thai chess variant where the king cannot move out of check — must block or capture the attacker. If neither is possible, checkmate. Based on Makruk.', rule: 'Board: 8×8 · Win: Checkmate' },
  losAlamos: { title: 'Los Alamos Chess', text: 'The first chess variant ever played by a computer (1956). 6×6 board with no bishops, no castling, no double pawn step. Pure tactics.', rule: 'Board: 6×6 · Win: Checkmate' },
  minichess: { title: 'Minichess (5×5)', text: 'Gardner\'s Minichess — full piece types crammed onto a tiny 5×5 board. Fast, tactical, and surprisingly rich for its size.', rule: 'Board: 5×5 · Win: Checkmate' },
};

const VARIANT_GROUPS = [
  { label: 'Classic', variants: [
    ['standard', 'Standard'],
    ['almostChess', 'Almost Chess'],
    ['amazonChess', 'Amazon Chess'],
    ['chess960', 'Fischer Random'],
    ['chigorin', 'Chigorin'],
    ['noCastling', 'No Castling'],
    ['torpedo', 'Torpedo'],
    ['upsideDown', 'Upside-Down'],
  ]},
  { label: 'Tactical', variants: [
    ['atomic', 'Atomic'],
    ['extinction', 'Extinction'],
    ['fiveCheck', 'Five-Check'],
    ['kingOfTheHill', 'King of the Hill'],
    ['rifle', 'Rifle'],
    ['singleCheck', 'Single-Check'],
    ['threeCheck', 'Three-Check'],
  ]},
  { label: 'Alternate Rules', variants: [
    ['antichess', 'Antichess'],
    ['breakthrough', 'Breakthrough (7×7)'],
    ['codrus', 'Codrus'],
    ['duckChess', 'Duck Chess'],
    ['fogOfWar', 'Fog of War'],
    ['giveaway', 'Giveaway'],
    ['horde', 'Horde'],
    ['knightmate', 'Knightmate'],
    ['maharaja', 'Maharaja & Sepoys'],
    ['makpong', 'Makpong'],
    ['marseillais', 'Marseillais'],
    ['monsterChess', 'Monster Chess'],
    ['progressive', 'Progressive'],
    ['racingKings', 'Racing Kings'],
    ['stalemateWins', 'Stalemate Wins'],
    ['suicideChess', 'Suicide Chess'],
  ]},
  { label: 'Asymmetric', variants: [
    ['endgameChess', 'Endgame Chess'],
    ['pawnsOnly', 'Pawns Only'],
    ['peasantsRevolt', "Peasants' Revolt"],
  ]},
  { label: 'Small Boards', variants: [
    ['losAlamos', 'Los Alamos (6×6)'],
    ['minichess', 'Minichess (5×5)'],
  ]},
  { label: 'Large Boards', variants: [
    ['capablanca', 'Capablanca (10×8)'],
    ['courier', 'Courier (12×8)'],
    ['grand', 'Grand Chess (10×10)'],
  ]},
];

function getVariantGroups() {
  const groups = VARIANT_GROUPS.map(g => ({ label: g.label, variants: [...g.variants] }));
  const knownKeys = new Set(groups.flatMap(g => g.variants.map(([k]) => k)));
  for (const [key, vc] of Object.entries(MCE.variantRegistry)) {
    if (knownKeys.has(key)) continue;
    const groupLabel = vc.group || 'Plugins';
    let target = groups.find(g => g.label === groupLabel);
    if (!target) { target = { label: groupLabel, variants: [] }; groups.push(target); }
    target.variants.push([key, vc.label || key]);
    if (vc.title && vc.description) {
      DESCRIPTIONS[key] = { title: vc.title, text: vc.description, rule: vc.rule || '' };
    }
  }
  for (const g of groups) {
    const first = g.variants[0];
    const isStandard = first && first[0] === 'standard';
    const start = isStandard ? 1 : 0;
    const tail = g.variants.slice(start).sort((a, b) => a[1].localeCompare(b[1]));
    g.variants = isStandard ? [first, ...tail] : tail;
  }
  return groups;
}

const params = new URLSearchParams(location.search);
const paramVariant = params.get('variant');
const embedMode = params.get('embed') === '1';
const paramP1 = params.get('p1') || 'White';
const paramP2 = params.get('p2') || 'Black';
const paramMode = params.get('mode');

if (embedMode) {
  document.querySelectorAll('.site-nav, #sidebar').forEach(el => el.style.display = 'none');
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.site-footer').forEach(el => el.style.display = 'none');
  });
  document.body.classList.add('embed-mode');
  if (params.get('boardonly') === '1') {
    document.querySelectorAll('#description, #captured, #board-controls, #status, #moves').forEach(el => el.style.display = 'none');
    document.body.style.overflow = 'hidden';
    document.body.style.padding = '0';
    document.body.style.minHeight = 'auto';
    document.body.style.alignItems = 'stretch';
    const app = document.getElementById('app');
    if (app) { app.style.padding = '0'; app.style.gap = '0'; app.style.width = '100%'; }
    container.style.width = '100%';
  }

  const themeParam = params.get('theme');
  const bg = params.get('bg');
  const accent = params.get('accent');
  const radius = params.get('radius');
  const root = document.documentElement;

  if (themeParam && MCE.THEMES && MCE.THEMES[themeParam]) {
    MCE.setTheme(themeParam);
  }

  setupEmbedBridge();

  if (themeParam === 'light') {
    root.style.setProperty('--play-bg', '#ffffff');
    root.style.setProperty('--play-text', '#14161c');
    root.style.setProperty('--play-text-muted', '#4f5764');
    root.style.setProperty('--play-text-dim', '#636b78');
    root.style.setProperty('--play-text-faint', '#7a8290');
    root.style.setProperty('--play-border', '#e6e3d8');
    root.style.setProperty('--play-border-hover', '#14161c');
    root.style.setProperty('--play-border-accent', '#c3c5cc');
    root.style.setProperty('--play-surface', '#f5f4ef');
    root.style.setProperty('--play-surface-hover', '#eceae4');
    root.style.setProperty('--play-surface-active', '#e6e3d8');
    root.style.setProperty('--play-accent', 'rgba(12,79,141,0.1)');
    root.style.setProperty('--play-accent-border', '#0c4f8d');
  }
  if (bg) root.style.setProperty('--play-bg', bg);
  if (accent) {
    root.style.setProperty('--play-accent', accent + '1a');
    root.style.setProperty('--play-accent-border', accent);
  }
  if (radius) document.getElementById('board-container').style.borderRadius = radius;
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
let aiDifficulty = params.get('difficulty') || 'medium';
let aiColor = MCE.BLACK;
const playerNames = { w: paramP1, b: paramP2 };
let aiThinking = false;
let gameOver = false;
let undoStack = [];
let flipped = false;
let lastMove = null;
let capturedPieces = { w: [], b: [] };
let pendingPromotion = null;

let openGroup = 'Classic';
let filterText = '';

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

  const search = document.createElement('input');
  search.className = 'variant-search';
  search.type = 'text';
  search.placeholder = 'Filter variants...';
  search.value = filterText;
  search.addEventListener('input', (e) => { filterText = e.target.value; renderPicker(); });
  pickerEl.appendChild(search);

  const listWrap = document.createElement('div');
  listWrap.className = 'variant-list-wrap';

  const query = filterText.toLowerCase();

  getVariantGroups().forEach(group => {
    const matches = group.variants.filter(([, label]) => label.toLowerCase().includes(query));
    if (matches.length === 0) return;

    const isOpen = query || group.label === openGroup;
    const header = document.createElement('button');
    header.className = 'variant-group-header' + (isOpen ? ' variant-group-header--open' : '');
    header.textContent = group.label;
    header.addEventListener('click', () => {
      openGroup = openGroup === group.label ? null : group.label;
      renderPicker();
    });
    listWrap.appendChild(header);

    if (isOpen) {
      matches.forEach(([key, label]) => {
        const btn = document.createElement('button');
        btn.className = 'variant-btn' + (key === currentVariant ? ' variant-btn--active' : '');
        btn.textContent = label;
        btn.addEventListener('click', () => startGame(key));
        listWrap.appendChild(btn);
      });
    }
  });

  pickerEl.appendChild(listWrap);
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

  if (gameMode === 'solo') {
    const diffSelect = document.createElement('select');
    diffSelect.className = 'ctrl-select';
    const diffLabels = { beginner: 'Beginner', easy: 'Easy', medium: 'Medium', hard: 'Hard', expert: 'Expert' };
    Object.entries(diffLabels).forEach(([key, label]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label;
      if (key === aiDifficulty) opt.selected = true;
      diffSelect.appendChild(opt);
    });
    diffSelect.addEventListener('change', () => {
      aiDifficulty = diffSelect.value;
    });
    controlsEl.appendChild(diffSelect);
  }

  const themeSelect = document.createElement('select');
  themeSelect.className = 'ctrl-select';
  const currentThemeObj = MCE.getTheme();
  Object.entries(MCE.THEMES).forEach(([key, t]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = t.label;
    if (t === currentThemeObj) opt.selected = true;
    themeSelect.appendChild(opt);
  });
  themeSelect.addEventListener('change', () => {
    MCE.setTheme(themeSelect.value);
    render();
  });
  controlsEl.appendChild(themeSelect);
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
  const g = getVariantGroups().find(gr => gr.variants.some(([k]) => k === variant));
  if (g) openGroup = g.label;
  game = MCE.createGame(variant);
  selected = null;
  moveNum = 1;
  gameOver = false;
  aiThinking = false;
  undoStack = [];
  lastMove = null;
  capturedPieces = { w: [], b: [] };
  movesEl.innerHTML = '';

  // Lock container dimensions to prevent layout shift when innerHTML is cleared between renders
  const isBoardOnly = embedMode && params.get('boardonly') === '1';
  const boardWidth = isBoardOnly ? container.parentElement.offsetWidth : 480;
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
  const isBoardOnly = embedMode && params.get('boardonly') === '1';
  const opts = {
    size: isBoardOnly ? container.offsetWidth : 480,
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

  const vc = MCE.getVariantConfig(currentVariant);
  if (vc && vc.visibility) {
    const viewSide = gameMode === 'solo' ? (aiColor === MCE.BLACK ? MCE.WHITE : MCE.BLACK) : game.turn;
    opts.fogMask = vc.visibility(game, viewSide);
  } else if (currentVariant === 'fogOfWar') {
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
  const vc = MCE.getVariantConfig(currentVariant);
  if (vc && vc.moveFilter) return MCE.variantLegalMoves(game);
  if (currentVariant === 'antichess' || currentVariant === 'racingKings' || currentVariant === 'giveaway' || currentVariant === 'suicideChess' || currentVariant === 'makpong') {
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

  const vcStatus = MCE.getVariantConfig(currentVariant);
  if (vcStatus && vcStatus.statusText) {
    const custom = vcStatus.statusText(game, { nameFor, nameForOpp, gameOver });
    if (custom) { statusEl.textContent = custom; return; }
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
    if (variantStatus === 'horde-b') {
      statusEl.textContent = playerNames.b + ' wins — horde eliminated!';
      return;
    }
    if (variantStatus.startsWith('extinction-')) {
      statusEl.textContent = (variantStatus === 'extinction-w' ? playerNames.w : playerNames.b) + ' wins — piece type extinct!';
      return;
    }
    if (variantStatus.startsWith('breakthrough-')) {
      statusEl.textContent = (variantStatus === 'breakthrough-w' ? playerNames.w : playerNames.b) + ' wins — reached the far rank!';
      return;
    }
    if (variantStatus === 'maharaja-b') {
      statusEl.textContent = playerNames.b + ' wins — Maharaja captured!';
      return;
    }
    if (variantStatus.startsWith('knightmate-')) {
      statusEl.textContent = (variantStatus === 'knightmate-w' ? playerNames.w : playerNames.b) + ' wins — royal knight captured!';
      return;
    }
    if (variantStatus.startsWith('codrus-')) {
      statusEl.textContent = (variantStatus === 'codrus-w' ? playerNames.w : playerNames.b) + ' wins — sacrificed their king!';
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
    const sm = game.stalemateMeaning || (currentVariant === 'giveaway' ? 'loss' : currentVariant === 'stalemateWins' ? 'win' : 'draw');
    if (sm === 'loss') {
      statusEl.textContent = nameForOpp(game.turn) + ' wins — opponent stalemated!';
    } else if (sm === 'win') {
      statusEl.textContent = nameForOpp(game.turn) + ' wins — stalemate!';
    } else {
      statusEl.textContent = 'Stalemate — draw';
    }
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
    const threshold = game.checkThreshold || (currentVariant === 'singleCheck' ? 1 : currentVariant === 'fiveCheck' ? 5 : currentVariant === 'threeCheck' ? 3 : 0);
    if (threshold > 0) {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= threshold) {
        gameOver = true;
        statusEl.textContent = nameForOpp(game.turn) + ' wins — ' + threshold + (threshold === 1 ? ' check!' : ' checks!');
      }
    }
  } else if (currentVariant === 'marseillais' && game.movesThisTurn === 1) {
    statusEl.textContent = turn + ' — second move';
  } else if (currentVariant === 'monsterChess' && game.movesThisTurn > 0) {
    const max = game.maxMovesPerTurn[game.turn] || 1;
    statusEl.textContent = turn + ' — move ' + (game.movesThisTurn + 1) + ' of ' + max;
  } else if (currentVariant === 'progressive' && game.movesThisTurn > 0) {
    statusEl.textContent = turn + ' — move ' + (game.movesThisTurn + 1) + ' of ' + game.progressiveMove;
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
    } else if (currentVariant === 'monsterChess' && game.turn !== aiColor) {
      // Human still has moves this turn
    } else if (currentVariant === 'progressive' && game.turn !== aiColor) {
      // Human still has moves this turn
    } else {
      scheduleAIMove();
    }
  }
}

function getPromotionPieces() {
  if (game.promotionPieces) return game.promotionPieces;
  const vc = MCE.getVariantConfig(currentVariant);
  if (vc && vc.promotionPieces) return vc.promotionPieces;
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

  const vcAI = MCE.getVariantConfig(currentVariant);
  if (vcAI && vcAI.aiMoveCount) {
    const count = vcAI.aiMoveCount(game);
    if (count > 1) { doAIMoveMultiPlugin(count); return; }
  }

  if (currentVariant === 'marseillais') {
    doAIMoveMarseillais();
    return;
  }
  if (currentVariant === 'monsterChess' || currentVariant === 'progressive') {
    doAIMoveMulti();
    return;
  }

  const move = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
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
  const move1 = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
  if (!move1) { aiThinking = false; render(); return; }

  const side = game.turn;
  trackCaptures(move1, side);
  const undo1 = MCE.makeMove(game, move1);
  undoStack.push(undo1);
  lastMove = { from: move1.from, to: move1.to };
  addMoveToList(move1, side);

  if (game.turn === side && game.movesThisTurn === 1) {
    const move2 = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
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

function doAIMoveMulti() {
  const side = game.turn;
  let maxMoves = currentVariant === 'monsterChess'
    ? (game.maxMovesPerTurn[side] || 1)
    : game.progressiveMove;

  for (let i = 0; i < maxMoves; i++) {
    if (isGameOver() || game.turn !== side) break;
    const move = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
    if (!move) break;
    trackCaptures(move, side);
    const undo = MCE.makeMove(game, move);
    undoStack.push(undo);
    lastMove = { from: move.from, to: move.to };
    addMoveToList(move, side);
  }

  aiThinking = false;
  renderControls();
  renderCaptured();
  render();
}

function doAIMoveMultiPlugin(count) {
  const side = game.turn;
  for (let i = 0; i < count; i++) {
    if (isGameOver() || game.turn !== side) break;
    const move = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
    if (!move) break;
    trackCaptures(move, side);
    const undo = MCE.makeMove(game, move);
    undoStack.push(undo);
    lastMove = { from: move.from, to: move.to };
    addMoveToList(move, side);
  }
  aiThinking = false;
  renderControls();
  renderCaptured();
  render();
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

function setupEmbedBridge() {
  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data.type !== 'string') return;
    const root = document.documentElement;

    switch (e.data.type) {
      case 'chess:setVariant': {
        const v = e.data.variant;
        if (v && (DESCRIPTIONS[v] || (MCE.variantRegistry && MCE.variantRegistry[v]))) {
          startGame(v);
        }
        break;
      }
      case 'chess:setTheme': {
        const t = e.data.theme;
        if (t && MCE.THEMES && MCE.THEMES[t]) {
          MCE.setTheme(t);
          render();
        }
        break;
      }
      case 'chess:setBg': {
        const bg = e.data.bg;
        if (bg) root.style.setProperty('--play-bg', bg);
        break;
      }
      case 'chess:newGame': {
        startGame(currentVariant || 'standard');
        break;
      }
    }
  });
}

})();
