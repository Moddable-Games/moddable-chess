import MCE from '../../js/chess-engine.js';
import '../../js/chess-moves.js';
import '../../js/chess-play.js';
import '../../js/chess-units.js';
import '../../js/chess-variants.js';
import '../../js/variants/index.js';
import { renderBoard, setTheme, setPieceStyle } from '../../js/board-renderer.js';
import '../../js/chess-ai.js';
import { createGameController } from '../../js/game-controller-core.js';

const GALLERY_VARIANTS = [
  { key: 'standard', theme: 'classic' },
  { key: 'atomic', theme: 'cosmic' },
  { key: 'kingOfTheHill', theme: 'wood' },
  { key: 'capablanca', theme: 'marble' },
  { key: 'horde', theme: 'classic' },
  { key: 'racingKings', theme: 'wood' }
];

function loadPieceSprites() {
  return fetch('../assets/pieces.svg')
    .then(function(r) { return r.text(); })
    .then(function(svg) {
      var div = document.createElement('div');
      div.innerHTML = svg;
      document.body.insertBefore(div.firstChild, document.body.firstChild);
    });
}

function initGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  GALLERY_VARIANTS.forEach(function(v) {
    const item = document.createElement('div');
    item.className = 'demo-gallery__item';

    const boardEl = document.createElement('div');
    boardEl.className = 'board-container';
    item.appendChild(boardEl);

    const label = document.createElement('div');
    label.className = 'demo-gallery__label';
    const config = MCE.getVariantConfig(v.key);
    label.textContent = config ? config.label || v.key : v.key;
    item.appendChild(label);

    gallery.appendChild(item);

    setTheme(v.theme);
    setPieceStyle('auto');
    const game = MCE.createGame(v.key);
    createGameController(boardEl, game, {
      players: { w: 'ai', b: 'ai' },
      aiDepth: 2
    });
  });

  setTheme('classic');
}

function initControls() {
  const boardEl = document.getElementById('ctrl-board');
  const fenInput = document.getElementById('fen-input');
  const variantSelect = document.getElementById('variant-select');
  const eventLog = document.getElementById('event-log');
  if (!boardEl || !variantSelect) return;

  const variantKeys = Object.keys(MCE.variantRegistry).sort();
  variantKeys.forEach(function(key) {
    const opt = document.createElement('option');
    opt.value = key;
    const config = MCE.getVariantConfig(key);
    opt.textContent = config ? config.label || key : key;
    if (key === 'standard') opt.selected = true;
    variantSelect.appendChild(opt);
  });

  var currentCtrl = null;

  function log(msg) {
    if (!eventLog) return;
    const line = document.createElement('div');
    line.textContent = msg;
    eventLog.appendChild(line);
    eventLog.scrollTop = eventLog.scrollHeight;
  }

  function createController(variant, fen) {
    if (currentCtrl) currentCtrl.destroy();
    boardEl.innerHTML = '';
    const game = MCE.createGame(variant);
    if (fen) MCE.loadFEN(game, fen);

    currentCtrl = createGameController(boardEl, game, {
      players: { w: 'human', b: 'human' },
      renderOpts: { size: 480 },
      onMove: function(move) {
        var from = MCE.sqToAlgebraic(move.from, game);
        var to = MCE.sqToAlgebraic(move.to, game);
        log('Move: ' + from + to + (move.flag === 'capture' ? ' (capture)' : ''));
      },
      onGameEnd: function(result) {
        log('Game over: ' + result);
      },
      onTurnChange: function(turn) {
        log('Turn: ' + (turn === 'w' ? 'White' : 'Black'));
      }
    });
    log('New game: ' + variant);
  }

  createController('standard');

  document.getElementById('btn-load').addEventListener('click', function() {
    var variant = variantSelect.value;
    var fen = fenInput.value.trim() || null;
    createController(variant, fen);
  });

  document.getElementById('btn-undo').addEventListener('click', function() {
    if (currentCtrl) { currentCtrl.undo(); log('Undo'); }
  });

  document.getElementById('btn-flip').addEventListener('click', function() {
    if (currentCtrl) {
      var game = currentCtrl.getGame();
      var flipped = game._flipped = !game._flipped;
      currentCtrl.setFlipped(flipped);
      log('Flipped: ' + flipped);
    }
  });

  document.getElementById('btn-ai').addEventListener('click', function() {
    if (!currentCtrl) return;
    var game = currentCtrl.getGame();
    var move = MCE.aiPickMove(game, 3, { variant: game.variant });
    if (move) {
      MCE.makeMove(game, move);
      currentCtrl.render();
      var from = MCE.sqToAlgebraic(move.from, game);
      var to = MCE.sqToAlgebraic(move.to, game);
      log('AI: ' + from + to);
    }
  });

  document.getElementById('btn-new').addEventListener('click', function() {
    createController(variantSelect.value);
  });
}

function initThemeGrid() {
  const grid = document.getElementById('theme-grid');
  if (!grid) return;

  const SHOWCASE = [
    {
      theme: 'classic', pieces: 'gold', label: 'Classic + Gold',
      fen: 'r1bqkb1r/pppppppp/2n2n2/4p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    },
    {
      theme: 'cosmic', pieces: 'charcoal', label: 'Cosmic + Charcoal',
      fen: 'rnbqkbnr/pp2pppp/2p5/3pP3/3P4/8/PPP2PPP/RNBQKBNR b KQkq - 0 3'
    },
    {
      theme: 'wood', pieces: 'burgundy', label: 'Wood + Burgundy',
      fen: 'r1bqk2r/pppp1ppp/2n2n2/2b1p3/2B1P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 4 4'
    }
  ];

  SHOWCASE.forEach(function(t) {
    const panel = document.createElement('div');
    panel.className = 'demo-panel';

    const header = document.createElement('div');
    header.className = 'demo-panel__header';
    header.innerHTML = '<h3>' + t.label + '</h3>';
    panel.appendChild(header);

    const boardEl = document.createElement('div');
    boardEl.className = 'demo-panel__board';
    panel.appendChild(boardEl);

    const caption = document.createElement('p');
    caption.className = 'demo-panel__caption';
    caption.textContent = "setTheme('" + t.theme + "') + setPieceStyle('" + t.pieces + "')";
    panel.appendChild(caption);

    grid.appendChild(panel);

    const game = MCE.createGame('standard');
    MCE.loadFEN(game, t.fen);
    setTheme(t.theme);
    setPieceStyle(t.pieces);
    renderBoard(boardEl, game, { size: 260 });
  });

  setTheme('classic');
  setPieceStyle('auto');
}

function initAiPanel() {
  const boardEl = document.getElementById('ai-board');
  const variantSelect = document.getElementById('ai-variant');
  const difficultySelect = document.getElementById('ai-difficulty');
  const moveCountEl = document.getElementById('ai-move-count');
  const statusEl = document.getElementById('ai-status');
  if (!boardEl || !variantSelect) return;

  var popularVariants = ['standard', 'atomic', 'kingOfTheHill', 'racingKings', 'threeCheck', 'horde', 'crazyhouse', 'fogOfWar'];
  popularVariants.forEach(function(key) {
    var config = MCE.getVariantConfig(key);
    if (!config) return;
    var opt = document.createElement('option');
    opt.value = key;
    opt.textContent = config.label || key;
    if (key === 'atomic') opt.selected = true;
    variantSelect.appendChild(opt);
  });

  var ctrl = null;
  var moveCount = 0;
  var paused = false;

  function startAiGame() {
    if (ctrl) ctrl.destroy();
    boardEl.innerHTML = '';
    moveCount = 0;
    paused = false;
    moveCountEl.textContent = '0';
    statusEl.textContent = 'Playing';
    document.getElementById('ai-pause').textContent = 'Pause';

    var variant = variantSelect.value;
    var depth = parseInt(difficultySelect.value, 10);
    var game = MCE.createGame(variant);

    ctrl = createGameController(boardEl, game, {
      players: { w: 'human', b: 'human' },
      renderOpts: { size: 480 },
      onGameEnd: function(result) {
        statusEl.textContent = result;
        paused = true;
      }
    });
    statusEl.textContent = 'Ready';
  }

  function triggerNextAiMove() {
    if (!ctrl || paused) return;
    var game = ctrl.getGame();
    var move = MCE.aiPickMove(game, parseInt(difficultySelect.value, 10), { variant: game.variant });
    if (move) {
      MCE.makeMove(game, move);
      ctrl.render();
      moveCount++;
      moveCountEl.textContent = moveCount;
      var status = MCE.getStatus(game);
      var variantStatus = MCE.getVariantStatus ? MCE.getVariantStatus(game) : null;
      if (status === 'checkmate' || status === 'stalemate' || status.startsWith('draw') || variantStatus) {
        statusEl.textContent = variantStatus || status;
        return;
      }
      setTimeout(function() { triggerNextAiMove(); }, 300);
    }
  }

  startAiGame();

  document.getElementById('ai-start').addEventListener('click', function() {
    startAiGame();
    paused = false;
    statusEl.textContent = 'Playing';
    triggerNextAiMove();
  });
  document.getElementById('ai-pause').addEventListener('click', function() {
    paused = !paused;
    this.textContent = paused ? 'Resume' : 'Pause';
    statusEl.textContent = paused ? 'Paused' : 'Playing';
    if (!paused) triggerNextAiMove();
  });
}

loadPieceSprites().then(function() {
  initGallery();
  initControls();
  initThemeGrid();
  initAiPanel();
});
