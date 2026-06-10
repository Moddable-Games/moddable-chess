import MCE from '../../js/chess-engine.js';
import '../../js/chess-moves.js';
import '../../js/chess-play.js';
import '../../js/chess-units.js';
import '../../js/chess-variants.js';
import '../../js/variants/index.js';
import '../../js/board-renderer.js';
import '../../js/chess-ai.js';
import { createGameController } from '../../js/game-controller-core.js';

const GALLERY_VARIANTS = ['standard', 'atomic', 'kingOfTheHill', 'capablanca', 'horde', 'racingKings'];

function initGallery() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;

  GALLERY_VARIANTS.forEach(function(key) {
    const item = document.createElement('div');
    item.className = 'demo-gallery__item';

    const boardEl = document.createElement('div');
    boardEl.className = 'board-container';
    item.appendChild(boardEl);

    const label = document.createElement('div');
    label.className = 'demo-gallery__label';
    const config = MCE.getVariantConfig(key);
    label.textContent = config ? config.label || key : key;
    item.appendChild(label);

    gallery.appendChild(item);

    const game = MCE.createGame(key);
    createGameController(boardEl, game, {
      players: { w: 'ai', b: 'ai' },
      aiDepth: 2
    });
  });
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

initGallery();
initControls();
