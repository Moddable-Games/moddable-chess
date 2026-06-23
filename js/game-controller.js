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
const paramFen = params.get('fen');
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

let ctrl = null;

fetch(basePath + 'assets/pieces.svg')
  .then(r => r.text())
  .then(svg => {
    const div = document.createElement('div');
    div.innerHTML = svg;
    document.body.insertBefore(div.firstChild, document.body.firstChild);
    if (!embedMode && !fullscreenMode) renderPicker();
    const initVariant = paramVariant && MCE.getVariantConfig(paramVariant) ? paramVariant : 'standard';
    startGame(initVariant);
    if (paramFen) {
      MCE.loadFEN(game, paramFen);
      game.positionHistory = [MCE.positionKey(game)];
      render();
    }
  });

let game, moveNum, currentVariant;
let gameMode = paramMode === 'pass' ? 'pass' : 'solo';
let aiDifficulty = params.get('difficulty') || 'medium';
let aiColor = MCE.BLACK;
const playerNames = { w: paramP1, b: paramP2 };
let gameOver = false;
let flipped = false;
let capturedPieces = { w: [], b: [] };
let pendingPromotion = null;
let dropMode = null;

let openGroup = 'Classic';
let filterText = '';

function renderPicker() {
  pickerEl.innerHTML = '';

  const modeBar = document.createElement('div');
  modeBar.className = 'mode-bar';

  const soloBtn = document.createElement('button');
  soloBtn.className = 'mode-btn' + (gameMode === 'solo' ? ' mode-btn--active' : '');
  soloBtn.textContent = 'Solo';
  soloBtn.addEventListener('click', () => { gameMode = 'solo'; renderPicker(); startGame(currentVariant || 'standard'); });

  const passBtn = document.createElement('button');
  passBtn.className = 'mode-btn' + (gameMode === 'pass' ? ' mode-btn--active' : '');
  passBtn.textContent = 'Pass & Play';
  passBtn.addEventListener('click', () => { gameMode = 'pass'; renderPicker(); startGame(currentVariant || 'standard'); });

  modeBar.appendChild(soloBtn);
  modeBar.appendChild(passBtn);

  if (gameMode === 'solo') {
    const colorBar = document.createElement('div');
    colorBar.className = 'color-bar';
    const whiteBtn = document.createElement('button');
    whiteBtn.className = 'color-btn' + (aiColor === MCE.BLACK ? ' color-btn--active' : '');
    whiteBtn.textContent = 'Play White';
    whiteBtn.addEventListener('click', () => { aiColor = MCE.BLACK; flipped = false; renderPicker(); startGame(currentVariant || 'standard'); });
    const blackBtn = document.createElement('button');
    blackBtn.className = 'color-btn' + (aiColor === MCE.WHITE ? ' color-btn--active' : '');
    blackBtn.textContent = 'Play Black';
    blackBtn.addEventListener('click', () => { aiColor = MCE.WHITE; flipped = true; renderPicker(); startGame(currentVariant || 'standard'); });
    colorBar.appendChild(whiteBtn);
    colorBar.appendChild(blackBtn);
    modeBar.appendChild(colorBar);
  }

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
    if (ctrl) ctrl.setFlipped(flipped);
  });

  const undoBtn = document.createElement('button');
  undoBtn.className = 'ctrl-btn';
  undoBtn.textContent = 'Undo';
  undoBtn.disabled = !ctrl || ctrl.getState().undoStackLength === 0;
  undoBtn.addEventListener('click', () => {
    if (!ctrl) return;
    ctrl.undo();
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
      if (ctrl) ctrl.setDifficulty(aiDifficulty);
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
  if (ctrl) ctrl.destroy();
  game = MCE.createGame(variant);
  moveNum = 1;
  gameOver = false;
  capturedPieces = { w: [], b: [] };
  dropMode = null;
  movesEl.innerHTML = '';

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

  const animDuration = ANIM_SPEEDS[animSpeed] ? ANIM_SPEEDS[animSpeed].ms : 200;
  const players = gameMode === 'solo'
    ? { w: aiColor === MCE.WHITE ? 'ai' : 'human', b: aiColor === MCE.BLACK ? 'ai' : 'human' }
    : { w: 'human', b: 'human' };

  ctrl = MCE.createGameController(container, game, {
    players,
    aiDifficulty,
    workerPath: basePath + 'js/ai-worker.js',
    workerType: 'module',
    variantPaths: VARIANT_FILES.map(f => basePath + 'js/variants/' + f),
    renderOpts: {
      size: boardWidth,
      animate: animDuration > 0,
      animStyle: animStyle,
      animDuration: animDuration,
      animEasing: 'ease-out',
      animCaptureBurst: animDuration > 0,
      duckSq: game.duckSq >= 0 ? game.duckSq : null,
      effectOverlay: renderEffectOverlay,
    },
    onSquareClick: handleSquareClick,
    onPromotionNeeded: showPromotionDialog,
    onMove: handleMoveCallback,
    onGameEnd: handleGameEnd,
    onTurnChange: handleTurnChange,
    onRender: handleRender,
    onUndo: handleUndoCallback,
    getLegalMovesOverride: getLegalMovesOverride,
  });

  if (flipped) ctrl.setFlipped(true);

  if (!fullscreenMode && !embedMode) {
    renderPicker();
    renderToolbar();
  }
  renderDescription();
  renderControls();
  renderCaptured();
}

function renderEffectOverlay(svg, effect, x, y, tileSize, game) {
  const SVGns = 'http://www.w3.org/2000/svg';
  if (effect.type === 'immune') {
    const shield = document.createElementNS(SVGns, 'rect');
    shield.setAttribute('x', x + 2);
    shield.setAttribute('y', y + 2);
    shield.setAttribute('width', tileSize - 4);
    shield.setAttribute('height', tileSize - 4);
    shield.setAttribute('rx', 4);
    shield.setAttribute('fill', 'none');
    shield.setAttribute('stroke', '#00e676');
    shield.setAttribute('stroke-width', 2.5);
    shield.setAttribute('opacity', 0.7);
    return shield;
  }
  if (effect.type === 'poison') {
    const dot = document.createElementNS(SVGns, 'circle');
    dot.setAttribute('cx', x + tileSize - 8);
    dot.setAttribute('cy', y + 8);
    dot.setAttribute('r', 4);
    dot.setAttribute('fill', '#ab47bc');
    dot.setAttribute('opacity', 0.8);
    return dot;
  }
  if (effect.type === 'petrify') {
    const dot = document.createElementNS(SVGns, 'circle');
    dot.setAttribute('cx', x + tileSize - 8);
    dot.setAttribute('cy', y + 8);
    dot.setAttribute('r', 4);
    dot.setAttribute('fill', '#78909c');
    dot.setAttribute('opacity', 0.8);
    return dot;
  }
  return null;
}

function render() {
  if (ctrl) ctrl.render();
}

function getLegalMovesOverride(g, state) {
  if (dropMode && !state.duckPhase) {
    const moves = ctrl.getLegalMoves();
    return moves.filter(m => m.flag === 'action' && m.action === 'drop' && m.dropPiece === dropMode);
  }
  return null;
}

function handleSquareClick(sq, g, api) {
  if (pendingPromotion) return true;
  if (gameOver) return true;
  if (dropMode) {
    const allMoves = api.getLegalMoves();
    const dropMove = allMoves.find(m => m.flag === 'action' && m.action === 'drop' && m.dropPiece === dropMode && m.to === sq);
    if (dropMove) {
      dropMode = null;
      api.executeMove(dropMove);
    } else {
      dropMode = null;
      api.setSelected(null);
      api.render();
    }
    return true;
  }
  return false;
}

function handleMoveCallback(move, undo, captured, side) {
  trackCaptures(move, side);
  addMoveToList(move, side);
  dropMode = null;
  renderControls();
  renderCaptured();
}

function handleGameEnd(result) {
  gameOver = true;
  trackGameComplete(result);
  renderControls();
}

function handleTurnChange(turn, turnIndex) {
  renderControls();
}

function handleRender(g, renderOpts) {
  updateStatus();
  renderHand();
}

function handleUndoCallback(count) {
  for (let i = 0; i < count; i++) removeMoveFromList();
  dropMode = null;
  capturedPieces = { w: [], b: [] };
  gameOver = false;
  renderCaptured();
  renderControls();
}

function nameFor(color) { return color === MCE.WHITE ? playerNames.w : playerNames.b; }
function nameForOpp(color) { return color === MCE.WHITE ? playerNames.b : playerNames.w; }

function trackGameComplete(result) {
  track('game_complete', { variant_name: currentVariant, result: result, move_count: ctrl ? ctrl.getState().undoStackLength : 0 });
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
    const sm = game.stalemateMeaning || 'draw';
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
    const threshold = game.checkThreshold || 0;
    if (threshold > 0) {
      game.checkCount[game.turn]++;
      if (game.checkCount[game.turn] >= threshold) {
        gameOver = true;
        trackGameComplete('check-threshold');
        statusEl.textContent = nameForOpp(game.turn) + ' wins — ' + threshold + (threshold === 1 ? ' check!' : ' checks!');
      }
    }
  } else {
    statusEl.textContent = turn + ' to move';
  }
}

function getPromotionPieces() {
  if (game.promotionPieces) return game.promotionPieces;
  const vc = MCE.getVariantConfig(currentVariant);
  if (vc && vc.promotionPieces) return vc.promotionPieces;
  return ['q', 'r', 'b', 'n'];
}

const PROMO_NAMES = { q: 'Queen', r: 'Rook', b: 'Bishop', n: 'Knight', a: 'Archbishop', c: 'Chancellor' };

function showPromotionDialog(candidates, side, callback) {
  pendingPromotion = { candidates, side, callback };
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
    var svgId = isWhite ? p.toUpperCase() : p.toLowerCase();
    btn.innerHTML = '<svg viewBox="0 0 45 45"><use href="#piece-' + svgId + '"/></svg>';
    btn.addEventListener('click', function() { completePromotion(p); });
    row.appendChild(btn);
    if (!firstBtn) firstBtn = btn;
  });
  panel.appendChild(row);
  backdrop.appendChild(panel);
  backdrop.addEventListener('keydown', function(e) { if (e.key === 'Escape') cancelPromotion(); });
  document.body.appendChild(backdrop);
  if (firstBtn) setTimeout(function() { firstBtn.focus(); }, 0);
}

function completePromotion(promoType) {
  if (!pendingPromotion) return;
  var cb = pendingPromotion.callback;
  pendingPromotion = null;
  dismissPromotionDialog();
  if (cb) cb(promoType);
}

function cancelPromotion() {
  pendingPromotion = null;
  if (ctrl) ctrl.setSelected(null);
  dismissPromotionDialog();
  render();
}

function dismissPromotionDialog() {
  var el = document.getElementById('promo-dialog');
  if (el) el.remove();
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

  const vc = MCE.getVariantConfig(currentVariant);
  if (vc && vc.explosionCaptures && (capturedPiece || move.flag === 'ep')) {
    const extras = vc.explosionCaptures(game, move);
    if (extras) {
      for (let i = 0; i < extras.length; i++) {
        capturedPieces[extras[i].capturedBy].push(extras[i].piece);
      }
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

function renderHand() {
  const handEl = document.getElementById('hand-panel');
  if (!handEl) return;
  if (!game.hand) { handEl.innerHTML = ''; return; }

  const SVGns = 'http://www.w3.org/2000/svg';
  handEl.innerHTML = '';

  const sides = flipped ? [MCE.WHITE, MCE.BLACK] : [MCE.BLACK, MCE.WHITE];
  for (const side of sides) {
    const hand = game.hand[side];
    if (!hand || hand.length === 0) continue;
    const row = document.createElement('div');
    row.className = 'hand-row';
    const label = document.createElement('span');
    label.className = 'hand-label';
    label.textContent = (side === MCE.WHITE ? 'White' : 'Black') + ':';
    row.appendChild(label);

    const counted = {};
    for (const p of hand) { counted[p] = (counted[p] || 0) + 1; }
    const order = ['q', 'r', 'b', 'n', 'p'];
    for (const pt of order) {
      if (!counted[pt]) continue;
      const pieceChar = side === MCE.WHITE ? pt.toUpperCase() : pt;
      const btn = document.createElement('button');
      btn.className = 'hand-piece';
      if (dropMode === pt && side === game.turn) btn.classList.add('hand-piece--active');
      const svg = document.createElementNS(SVGns, 'svg');
      svg.setAttribute('width', '32');
      svg.setAttribute('height', '32');
      svg.setAttribute('viewBox', '0 0 45 45');
      const use = document.createElementNS(SVGns, 'use');
      use.setAttribute('href', '#piece-' + pieceChar);
      use.setAttribute('width', '45');
      use.setAttribute('height', '45');
      svg.appendChild(use);
      btn.appendChild(svg);
      if (counted[pt] > 1) {
        const badge = document.createElement('span');
        badge.className = 'hand-count';
        badge.textContent = counted[pt];
        btn.appendChild(badge);
      }
      const isMyTurn = side === game.turn && (!ctrl || !ctrl.getState().aiThinking) && !gameOver;
      const isHuman = gameMode === 'pass' || (gameMode === 'solo' && side !== aiColor);
      if (isMyTurn && isHuman) {
        btn.addEventListener('click', function() {
          if (dropMode === pt) { dropMode = null; } else { dropMode = pt; if (ctrl) ctrl.setSelected(null); }
          render();
          renderHand();
        });
      } else {
        btn.disabled = true;
      }
      row.appendChild(btn);
    }
    handEl.appendChild(row);
  }
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
          if (ctrl) ctrl.setDifficulty(d);
        }
        break;
      }
    }
  });
}
