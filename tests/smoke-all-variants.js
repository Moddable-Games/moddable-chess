import MCE from '../js/chess-engine.js';
import '../js/chess-moves.js';
import '../js/chess-play.js';
import '../js/chess-variants.js';
import '../js/chess-units.js';
import '../js/chess-ai.js';
import '../js/variants/index.js';

const MAX_MOVES = 30;
const TIMEOUT_MS = 5000;

const results = { passed: [], failed: [], errors: [] };

const variants = Object.keys(MCE.variantRegistry);
console.log(`Testing ${variants.length} variants (${MAX_MOVES} moves each)\n`);

for (const key of variants) {
  const start = Date.now();
  try {
    const game = MCE.createGame(key);
    let moves = 0;
    let status = 'active';

    while (moves < MAX_MOVES && (status === 'active' || status === 'check')) {
      if (Date.now() - start > TIMEOUT_MS) {
        throw new Error(`Timeout after ${moves} moves`);
      }

      const legal = MCE.legalMoves(game);
      if (legal.length === 0) break;

      const move = MCE.aiPickMove(game, null, { timeMs: 50 });
      if (!move) {
        const fallback = legal[Math.floor(Math.random() * legal.length)];
        MCE.makeMove(game, fallback);
      } else {
        MCE.makeMove(game, move);
      }

      moves++;
      status = MCE.getStatus(game);
    }

    const elapsed = Date.now() - start;
    results.passed.push({ key, moves, status, elapsed });
    const icon = status === 'active' || status === 'check' ? '.' : '*';
    process.stdout.write(icon);
  } catch (err) {
    results.failed.push({ key, error: err.message });
    process.stdout.write('X');
  }
}

console.log('\n');
console.log(`Passed: ${results.passed.length}/${variants.length}`);
console.log(`Failed: ${results.failed.length}/${variants.length}`);

if (results.failed.length > 0) {
  console.log('\n--- FAILURES ---');
  for (const f of results.failed) {
    console.log(`  ${f.key}: ${f.error}`);
  }
}

const gameOvers = results.passed.filter(r => r.status !== 'active' && r.status !== 'check');
if (gameOvers.length > 0) {
  console.log(`\n--- GAME OVERS (${gameOvers.length}) ---`);
  for (const g of gameOvers) {
    console.log(`  ${g.key}: ${g.status} after ${g.moves} moves`);
  }
}

const slow = results.passed.filter(r => r.elapsed > 2000);
if (slow.length > 0) {
  console.log(`\n--- SLOW (>2s) ---`);
  for (const s of slow) {
    console.log(`  ${s.key}: ${s.elapsed}ms`);
  }
}

process.exit(results.failed.length > 0 ? 1 : 0);
