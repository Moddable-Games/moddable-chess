'use strict';

importScripts(
  'chess-engine.js',
  'chess-moves.js',
  'chess-play.js',
  'chess-variants.js',
  'chess-ai.js'
);

(function() {
  var variantScripts = null;

  self.addEventListener('message', function(e) {
    var msg = e.data;

    if (msg.type === 'init') {
      if (msg.variantPaths && msg.variantPaths.length) {
        importScripts.apply(self, msg.variantPaths);
      }
      MCE.loadOpeningBook(self.location.href.replace(/js\/ai-worker\.js.*/, ''));
      self.postMessage({ type: 'ready' });
      return;
    }

    if (msg.type === 'pickMove') {
      var g = rebuildGame(msg.game);
      var move = MCE.aiPickMove(g, null, { difficulty: msg.difficulty });
      self.postMessage({ type: 'move', move: move, id: msg.id });
      return;
    }

    if (msg.type === 'pickDuck') {
      var g2 = rebuildGame(msg.game);
      var sq = MCE.aiPickDuckSquare(g2);
      self.postMessage({ type: 'duck', sq: sq, id: msg.id });
      return;
    }
  });

  function rebuildGame(snapshot) {
    var g = snapshot;
    g.eliminated = new Set(g._eliminated || []);
    delete g._eliminated;
    g.legalityFilter = null;
    g.winCondition = null;

    var vc = MCE.getVariantConfig(g.variant);
    if (vc) {
      if (vc.init && !g._initDone) vc.init(g);
      g._initDone = true;
    }
    return g;
  }
})();
