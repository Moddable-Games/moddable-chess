import MCE from './chess-engine.js';
import './chess-moves.js';
import './chess-play.js';
import './chess-units.js';
import './rules/index.js';
import './pieces/index.js';
import './chess-variants.js';
import './chess-ai.js';

let variantsLoaded = false;

self.addEventListener('message', async function(e) {
  var msg = e.data;

  if (msg.type === 'init') {
    if (msg.variantPaths && msg.variantPaths.length) {
      await Promise.all(msg.variantPaths.map(p => import(p)));
    }
    variantsLoaded = true;
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
    if (vc.pawnStartRow) g.pawnStartRow = vc.pawnStartRow;
    if (vc.pawnDirection) g.pawnDirection = vc.pawnDirection;
    if (vc.promotionRank) g.promotionRank = vc.promotionRank;
    if (vc.init && !g._initDone) {
      var savedHand = g.hand;
      vc.init(g);
      if (savedHand) g.hand = savedHand;
    }
    g._initDone = true;
  }
  return g;
}
