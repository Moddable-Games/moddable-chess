import MCE from './chess-engine.js';
import './chess-moves.js';
import './chess-play.js';
import './chess-units.js';
import './chess-variants.js';
import './chess-ai.js';
import './board-renderer.js';
import './game-controller-core.js';
import './replay.js';
import './variants/standard.js';
import './variants/chess960.js';
import './variants/torpedo.js';
import './variants/no-castling.js';
import './variants/single-check.js';
import './variants/los-alamos.js';
import './variants/knightmate.js';
import './variants/progressive.js';
import './variants/marseillais.js';
import './variants/monster-chess.js';
import './variants/fog-of-war.js';
import './variants/duck-chess.js';
import './variants/antichess.js';
import './variants/giveaway.js';
import './variants/suicide-chess.js';
import './variants/stalemate-wins.js';
import './variants/makpong.js';
import './variants/rifle.js';
import './variants/atomic.js';
import './variants/chigorin.js';
import './variants/almost-chess.js';
import './variants/amazon-chess.js';
import './variants/upside-down.js';
import './variants/endgame-chess.js';
import './variants/peasants-revolt.js';
import './variants/pawns-only.js';
import './variants/breakthrough.js';
import './variants/minichess.js';
import './variants/capablanca.js';
import './variants/grand.js';
import './variants/courier.js';
import './variants/maharaja.js';
import './variants/king-of-the-hill.js';
import './variants/three-check.js';
import './variants/five-check.js';
import './variants/racing-kings.js';
import './variants/extinction.js';
import './variants/horde.js';
import './variants/codrus.js';
import './variants/dice-chess.js';
import './variants/grid-chess.js';
import './variants/checkless-chess.js';
import './variants/no-retreat.js';
import './variants/weak-chess.js';
import './variants/patrol-chess.js';
import './variants/madrasi-chess.js';
import './variants/omnicide.js';
import './variants/dark-chess.js';
import './variants/berserk-chess.js';
import './variants/benedict-chess.js';
import './variants/andernach-chess.js';
import './variants/half-chess.js';
import './variants/diana-chess.js';
import './variants/petty-chess.js';
import './variants/shatar.js';
import './variants/cylinder-chess.js';
import './variants/toroidal-chess.js';
import './variants/berolina-chess.js';
import './variants/legan-chess.js';
import './variants/hoppel-poppel.js';
import './variants/makruk.js';
import './variants/orda-chess.js';
import './variants/einstein-chess.js';
import './variants/displacement-chess.js';
import './variants/crazyhouse.js';
import './variants/recruitment-chess.js';
import './variants/teleport-chess.js';
import './variants/poison-chess.js';
import './variants/medusa-chess.js';
import './variants/immunization-chess.js';

function track(event, params) {
  if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
}

const container = document.getElementById('board-container');
const controlsEl = document.getElementById('board-controls');
const toolbarEl = document.getElementById('board-toolbar');
const statusEl = document.getElementById('status');
const movesEl = document.getElementById('moves');
const pickerEl = document.getElementById('variant-picker');
const descEl = document.getElementById('description');

function getDescription(key) {
  const vc = MCE.getVariantConfig(key);
  if (!vc || !vc.title) return null;
  return { title: vc.title, text: vc.description || '', rule: vc.rule || '' };
}

const GROUP_ORDER = ['Classic', 'Tactical', 'Alternate Rules', 'Asymmetric', 'Small Boards', 'Large Boards'];

function getVariantGroups() {
  const groupMap = {};
  for (const [key, vc] of Object.entries(MCE.variantRegistry)) {
    const groupLabel = vc.group || 'Plugins';
    if (!groupMap[groupLabel]) groupMap[groupLabel] = [];
    groupMap[groupLabel].push([key, vc.label || key]);
  }
  const groups = [];
  for (const label of GROUP_ORDER) {
    if (groupMap[label]) { groups.push({ label, variants: groupMap[label] }); delete groupMap[label]; }
  }
  for (const [label, variants] of Object.entries(groupMap)) {
    groups.push({ label, variants });
  }
  for (const g of groups) {
    const stdIdx = g.variants.findIndex(([k]) => k === 'standard');
    if (stdIdx >= 0) {
      const std = g.variants.splice(stdIdx, 1)[0];
      g.variants.sort((a, b) => a[1].localeCompare(b[1]));
      g.variants.unshift(std);
    } else {
      g.variants.sort((a, b) => a[1].localeCompare(b[1]));
    }
  }
  return groups;
}

const params = new URLSearchParams(location.search);
const paramVariant = params.get('variant');
const embedMode = params.get('embed') === '1';
let fullscreenMode = params.get('mode') === 'fullscreen';
const paramP1 = params.get('p1') || 'White';
const paramP2 = params.get('p2') || 'Black';
const paramMode = params.get('mode');
const paramTheme = params.get('theme');
const paramPieces = params.get('pieces');

if (paramTheme && MCE.THEMES && MCE.THEMES[paramTheme]) {
  MCE.setTheme(paramTheme);
}
if (paramPieces && MCE.PIECE_STYLES && MCE.PIECE_STYLES[paramPieces]) {
  MCE.setPieceStyle(paramPieces);
}

if (fullscreenMode) {
  applyFullscreenMode();
}

if (embedMode) {
  document.querySelectorAll('.site-nav, #sidebar').forEach(el => el.style.display = 'none');
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.site-footer').forEach(el => el.style.display = 'none');
  });
  document.body.classList.add('embed-mode');
  if (params.get('boardonly') === '1') {
    document.querySelectorAll('#description, #captured, #board-controls, #board-toolbar, #status, #moves').forEach(el => el.style.display = 'none');
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

const basePath = import.meta.url.replace(/js\/game-controller\.js.*/, '');
MCE.loadOpeningBook(basePath);

const ANIM_STYLES = { slide: 'Slide', arc: 'Arc', bounce: 'Bounce', warp: 'Warp' };
const ANIM_SPEEDS = { slow: { label: 'Slow', ms: 400 }, normal: { label: 'Normal', ms: 200 }, fast: { label: 'Fast', ms: 100 }, instant: { label: 'Instant', ms: 0 } };
let animStyle = params.get('animStyle') || 'slide';
let animSpeed = params.get('animSpeed') || 'normal';

let aiWorker = null;
let aiWorkerReady = false;
let aiMoveId = 0;

const VARIANT_FILES = [
  'standard.js','chess960.js','torpedo.js','no-castling.js','single-check.js',
  'los-alamos.js','knightmate.js','progressive.js','marseillais.js','monster-chess.js',
  'fog-of-war.js','duck-chess.js','antichess.js','giveaway.js','suicide-chess.js',
  'stalemate-wins.js','makpong.js','rifle.js','atomic.js','chigorin.js',
  'almost-chess.js','amazon-chess.js','upside-down.js','endgame-chess.js',
  'peasants-revolt.js','pawns-only.js','breakthrough.js','minichess.js',
  'capablanca.js','grand.js','courier.js','maharaja.js','king-of-the-hill.js',
  'three-check.js','five-check.js','racing-kings.js','extinction.js','horde.js',
  'codrus.js','dice-chess.js','grid-chess.js','checkless-chess.js','no-retreat.js',
  'weak-chess.js','patrol-chess.js','madrasi-chess.js','omnicide.js','dark-chess.js',
  'berserk-chess.js','benedict-chess.js','andernach-chess.js','half-chess.js',
  'diana-chess.js','petty-chess.js','shatar.js','cylinder-chess.js','toroidal-chess.js',
  'berolina-chess.js','legan-chess.js','hoppel-poppel.js','makruk.js','orda-chess.js',
  'einstein-chess.js','displacement-chess.js','crazyhouse.js','recruitment-chess.js',
  'teleport-chess.js','poison-chess.js','medusa-chess.js','immunization-chess.js',
];

function initWorker() {
  try {
    aiWorker = new Worker(basePath + 'js/ai-worker.js', { type: 'module' });
    aiWorker.addEventListener('message', onWorkerMessage);
    const variantPaths = VARIANT_FILES.map(f => basePath + 'js/variants/' + f);
    aiWorker.postMessage({ type: 'init', variantPaths: variantPaths });
  } catch (e) {
    aiWorker = null;
  }
}

function onWorkerMessage(e) {
  const msg = e.data;
  if (msg.type === 'ready') { aiWorkerReady = true; return; }
  if (msg.type === 'move') {
    handleAIResult(msg.move);
    return;
  }
  if (msg.type === 'duck') {
    if (msg.sq >= 0) placeDuck(msg.sq);
    aiThinking = false;
    renderControls();
    renderCaptured();
    render();
    return;
  }
}

function serializeGame(g) {
  const snap = {};
  const keys = ['rows', 'cols', 'board', 'terrain', 'pieceData', 'turn', 'players',
    'turnIndex', 'castling', 'enPassant', 'halfmove', 'fullmove', 'variant',
    'checkCount', 'movesThisTurn', 'duckSq', 'duckPhase', 'status',
    'noCastling', 'noEnPassant', 'noPromotion', 'noCheck', 'torpedo',
    'pawnDirection', 'pawnStartRow', 'royalPiece', 'pieceRoles',
    'maxMovesPerTurn', 'progressiveMove', 'checkThreshold', 'stalemateMeaning',
    'promotionPieces', 'promotionRank', 'pawnMoveStyle', 'divergentPieces',
    'wrapFiles', 'wrapRanks', 'lastMovedSq', 'ownershipMode', 'effects',
    'rookStartCols'];
  for (let i = 0; i < keys.length; i++) {
    if (g[keys[i]] !== undefined && typeof g[keys[i]] !== 'function') snap[keys[i]] = g[keys[i]];
  }
  snap._eliminated = Array.from(g.eliminated || []);
  snap.positionHistory = g.positionHistory ? g.positionHistory.slice() : [];
  snap.history = [];
  return snap;
}

initWorker();

fetch(basePath + 'assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    if (!embedMode && !fullscreenMode) renderPicker();
    const initVariant = paramVariant && MCE.getVariantConfig(paramVariant) ? paramVariant : 'standard';
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
  const d = getDescription(currentVariant);
  if (!d) { descEl.innerHTML = ''; return; }
  descEl.innerHTML = `<h3>${d.title}</h3><p>${d.text}</p><div class="desc-rule">${d.rule}</div>`;
}

function renderControls() {
  controlsEl.innerHTML = '';

  const leftGroup = document.createElement('div');
  leftGroup.className = 'ctrl-group';

  const flipBtn = document.createElement('button');
  flipBtn.className = 'ctrl-btn';
  flipBtn.textContent = 'Flip';
  flipBtn.addEventListener('click', () => {
    flipped = !flipped;
    render();
  });

  const undoBtn = document.createElement('button');
  undoBtn.className = 'ctrl-btn';
  undoBtn.textContent = 'Undo';
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

  leftGroup.appendChild(flipBtn);
  leftGroup.appendChild(undoBtn);
  leftGroup.appendChild(newBtn);
  controlsEl.appendChild(leftGroup);

  if (gameMode === 'solo') {
    const rightGroup = document.createElement('div');
    rightGroup.className = 'ctrl-group';

    const diffSelect = document.createElement('select');
    diffSelect.className = 'ctrl-select';
    const diffLabels = {
      beginner: 'Novice (~600)',
      easy: 'Club (~1000)',
      medium: 'Intermediate (~1200)',
      hard: 'Advanced (~1400)',
      expert: 'Expert (~1600)'
    };
    Object.entries(diffLabels).forEach(([key, label]) => {
      const opt = document.createElement('option');
      opt.value = key;
      opt.textContent = label;
      if (key === aiDifficulty) opt.selected = true;
      diffSelect.appendChild(opt);
    });
    diffSelect.addEventListener('change', () => {
      aiDifficulty = diffSelect.value;
      track('difficulty_change', { difficulty: aiDifficulty, variant_name: currentVariant });
    });
    rightGroup.appendChild(diffSelect);
    controlsEl.appendChild(rightGroup);
  }
}

function renderToolbar() {
  toolbarEl.innerHTML = '';

  const leftGroup = document.createElement('div');
  leftGroup.className = 'toolbar-group';

  const themeSelect = document.createElement('select');
  themeSelect.className = 'toolbar-select';
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
    track('theme_change', { theme_name: themeSelect.value });
    const url = new URL(location);
    url.searchParams.set('theme', themeSelect.value);
    history.replaceState(null, '', url);
    render();
  });
  leftGroup.appendChild(themeSelect);

  const pieceSelect = document.createElement('select');
  pieceSelect.className = 'toolbar-select';
  const currentPS = MCE.getPieceStyle();
  Object.entries(MCE.PIECE_STYLES).forEach(([key, ps]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = ps.label;
    if (key === currentPS) opt.selected = true;
    pieceSelect.appendChild(opt);
  });
  pieceSelect.addEventListener('change', () => {
    MCE.setPieceStyle(pieceSelect.value);
    const url = new URL(location);
    url.searchParams.set('pieces', pieceSelect.value);
    history.replaceState(null, '', url);
    render();
  });
  leftGroup.appendChild(pieceSelect);

  const styleSelect = document.createElement('select');
  styleSelect.className = 'toolbar-select';
  Object.entries(ANIM_STYLES).forEach(([key, label]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = label;
    if (key === animStyle) opt.selected = true;
    styleSelect.appendChild(opt);
  });
  styleSelect.addEventListener('change', () => {
    animStyle = styleSelect.value;
    const url = new URL(location);
    url.searchParams.set('animStyle', animStyle);
    history.replaceState(null, '', url);
  });
  leftGroup.appendChild(styleSelect);

  const speedSelect = document.createElement('select');
  speedSelect.className = 'toolbar-select';
  Object.entries(ANIM_SPEEDS).forEach(([key, s]) => {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = s.label;
    if (key === animSpeed) opt.selected = true;
    speedSelect.appendChild(opt);
  });
  speedSelect.addEventListener('change', () => {
    animSpeed = speedSelect.value;
    const url = new URL(location);
    url.searchParams.set('animSpeed', animSpeed);
    history.replaceState(null, '', url);
  });
  leftGroup.appendChild(speedSelect);

  toolbarEl.appendChild(leftGroup);

  const fsBtn = document.createElement('button');
  fsBtn.className = 'toolbar-btn';
  fsBtn.textContent = 'Fullscreen';
  fsBtn.addEventListener('click', () => {
    const url = new URL(location);
    url.searchParams.set('mode', 'fullscreen');
    history.replaceState(null, '', url);
    fullscreenMode = true;
    applyFullscreenMode();
    startGame(currentVariant || 'standard');
  });
  toolbarEl.appendChild(fsBtn);
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
  const groupLabel = g ? g.label : '';
  track('variant_select', { variant_name: variant, variant_group: groupLabel });
  const mode = gameMode === 'solo' ? 'ai' : gameMode;
  track('game_start', { variant_name: variant, mode: mode, difficulty: gameMode === 'solo' ? aiDifficulty : undefined });
  if (!embedMode) {
    const url = new URL(location);
    url.searchParams.set('variant', variant);
    history.replaceState(null, '', url);
  }
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
  let boardWidth;
  if (isBoardOnly) {
    boardWidth = container.parentElement.offsetWidth;
  } else if (fullscreenMode) {
    const maxH = window.innerHeight - 80;
    const maxW = window.innerWidth - 40;
    const aspectRatio = (game.cols || 8) / (game.rows || 8);
    boardWidth = Math.min(maxW, maxH * aspectRatio);
  } else {
    boardWidth = 480;
  }
  const tileSize = boardWidth / (game.cols || 8);
  const boardHeight = tileSize * (game.rows || 8);
  container.style.width = boardWidth + 'px';
  container.style.height = boardHeight + 'px';

  if (!fullscreenMode && !embedMode) {
    renderPicker();
    renderToolbar();
  }
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
  let renderSize;
  if (isBoardOnly) {
    renderSize = container.offsetWidth;
  } else if (fullscreenMode) {
    renderSize = parseInt(container.style.width) || 480;
  } else {
    renderSize = 480;
  }
  const animDuration = ANIM_SPEEDS[animSpeed] ? ANIM_SPEEDS[animSpeed].ms : 200;
  const opts = {
    size: renderSize,
    selected: selected,
    lastMove: lastMove,
    flipped: flipped,
    animate: animDuration > 0,
    animStyle: animStyle,
    animDuration: animDuration,
    animEasing: 'ease-out',
    animCaptureBurst: animDuration > 0,
    legalMoves: [],
    onSquareClick: handleClick,
    fogMask: null,
    duckSq: game.duckSq >= 0 ? game.duckSq : null,
  };

  if (game.duckPhase) {
    opts.legalMoves = [];
  } else if (game._pendingAction) {
    opts.legalMoves = getMovesForVariant();
    opts.selected = game._pendingAction.from;
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

function trackGameComplete(result) {
  track('game_complete', { variant_name: currentVariant, result: result, move_count: undoStack.length });
}

function updateStatus() {
  if (game.duckPhase) {
    statusEl.textContent = nameFor(game.turn) + ' — place the duck';
    return;
  }

  const vc = MCE.getVariantConfig(currentVariant);
  const variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
  if (variantStatus) {
    gameOver = true;
    trackGameComplete(variantStatus);
  }

  if (vc && vc.statusText) {
    const custom = vc.statusText(game, { nameFor, nameForOpp, gameOver, variantStatus });
    if (custom) { statusEl.textContent = custom; return; }
  }

  if (variantStatus) {
    if (variantStatus === 'checkmate') {
      statusEl.textContent = 'Checkmate — ' + nameForOpp(game.turn) + ' wins!';
    } else if (variantStatus === 'stalemate') {
      statusEl.textContent = 'Stalemate — draw';
    } else if (variantStatus.endsWith('-w')) {
      statusEl.textContent = playerNames.w + ' wins!';
    } else if (variantStatus.endsWith('-b')) {
      statusEl.textContent = playerNames.b + ' wins!';
    } else {
      statusEl.textContent = nameForOpp(game.turn) + ' wins!';
    }
    return;
  }

  const status = MCE.getStatus(game);
  const turn = nameFor(game.turn);
  if (status === 'checkmate') {
    gameOver = true;
    trackGameComplete('checkmate');
    statusEl.textContent = 'Checkmate — ' + nameForOpp(game.turn) + ' wins!';
  } else if (status === 'stalemate') {
    gameOver = true;
    trackGameComplete('stalemate');
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
    trackGameComplete('draw-repetition');
    statusEl.textContent = 'Draw — threefold repetition';
  } else if (status === 'draw-material') {
    gameOver = true;
    trackGameComplete('draw-material');
    statusEl.textContent = 'Draw — insufficient material';
  } else if (status === 'draw-50') {
    gameOver = true;
    trackGameComplete('draw-50');
    statusEl.textContent = 'Draw — 50-move rule';
  } else if (status === 'check') {
    statusEl.textContent = turn + ' to move (check!)';
    const threshold = game.checkThreshold || (currentVariant === 'singleCheck' ? 1 : currentVariant === 'fiveCheck' ? 5 : currentVariant === 'threeCheck' ? 3 : 0);
    if (threshold > 0) {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= threshold) {
        gameOver = true;
        trackGameComplete('check-threshold');
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

  if (game._pendingAction) {
    const allMoves = getMovesForVariant();
    const candidates = allMoves.filter(m => m.to === sq);
    if (candidates.length > 0) {
      executeMove(candidates[0]);
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
  afterExecuteMove(move, side);

}

function afterExecuteMove(move, side) {
  if (game._pendingAction) {
    if (gameMode === 'solo' && game.turn === aiColor) {
      scheduleAIMove();
    }
    return;
  }

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
  const dur = ANIM_SPEEDS[animSpeed] ? ANIM_SPEEDS[animSpeed].ms : 200;
  setTimeout(doAIMove, dur + 100);
}

function doAIMove() {
  if (isGameOver()) { aiThinking = false; render(); return; }

  if (game._pendingAction) {
    const moves = getMovesForVariant();
    if (moves.length > 0) {
      const pick = moves[Math.floor(Math.random() * moves.length)];
      handleAIResult(pick);
    } else {
      aiThinking = false;
      render();
    }
    return;
  }

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

  if (aiWorker && aiWorkerReady) {
    aiMoveId++;
    aiWorker.postMessage({
      type: 'pickMove',
      game: serializeGame(game),
      difficulty: aiDifficulty,
      id: aiMoveId
    });
    return;
  }

  const move = MCE.aiPickMove(game, null, { difficulty: aiDifficulty });
  handleAIResult(move);
}

function handleAIResult(move) {
  if (!move) { aiThinking = false; render(); return; }

  const side = game.turn;
  trackCaptures(move, side);
  const undo = MCE.makeMove(game, move);
  undoStack.push(undo);
  lastMove = { from: move.from, to: move.to };
  addMoveToList(move, side);

  if (game._pendingAction) {
    setTimeout(doAIMove, 100);
    return;
  }

  if (currentVariant === 'duckChess' && game.duckPhase) {
    if (aiWorker && aiWorkerReady) {
      aiWorker.postMessage({
        type: 'pickDuck',
        game: serializeGame(game),
        id: ++aiMoveId
      });
      return;
    }
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

function applyFullscreenMode() {
  document.body.classList.add('fullscreen-mode');
  document.querySelectorAll('.site-nav, #sidebar, #right-panel, .site-footer, #board-toolbar, #board-controls, #status, #moves, #captured, #description').forEach(function(el) {
    el.style.display = 'none';
  });
  document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.site-footer').forEach(function(el) { el.style.display = 'none'; });
  });
  var app = document.getElementById('app');
  if (app) {
    app.style.justifyContent = 'center';
    app.style.alignItems = 'center';
    app.style.padding = '0';
    app.style.height = '100vh';
  }
  var center = document.getElementById('center');
  if (center) {
    center.style.flex = 'none';
  }
  function exitFullscreenMode() {
    fullscreenMode = false;
    document.body.classList.remove('fullscreen-mode');
    document.querySelectorAll('.site-nav, #sidebar, #right-panel, #board-toolbar, #board-controls, #status, #moves, #captured, #description').forEach(function(el) {
      el.style.display = '';
    });
    document.querySelectorAll('.site-footer').forEach(function(el) { el.style.display = ''; });
    var app = document.getElementById('app');
    if (app) { app.style.justifyContent = ''; app.style.alignItems = ''; app.style.padding = ''; app.style.height = ''; }
    var ctr = document.getElementById('center');
    if (ctr) { ctr.style.flex = ''; }
    var btn = document.querySelector('.fullscreen-exit');
    if (btn) btn.remove();
    var url = new URL(window.location.href);
    url.searchParams.delete('mode');
    history.replaceState(null, '', url);
    renderPicker();
    startGame(currentVariant || 'standard');
  }

  var exitBtn = document.createElement('button');
  exitBtn.className = 'fullscreen-exit';
  exitBtn.textContent = 'Exit';
  exitBtn.addEventListener('click', exitFullscreenMode);
  document.body.appendChild(exitBtn);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') exitFullscreenMode();
  });
}

function setupEmbedBridge() {
  window.addEventListener('message', function(e) {
    if (!e.data || typeof e.data.type !== 'string') return;
    const root = document.documentElement;

    switch (e.data.type) {
      case 'chess:setVariant': {
        const v = e.data.variant;
        if (v && MCE.getVariantConfig(v)) {
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
      case 'chess:setDifficulty': {
        const d = e.data.difficulty;
        if (d && MCE.AI_DIFFICULTIES && MCE.AI_DIFFICULTIES[d]) {
          aiDifficulty = d;
        }
        break;
      }
    }
  });
}
