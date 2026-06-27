import MCE from '../js/chess-engine.js';
import '../js/chess-moves.js';
import '../js/chess-play.js';
import '../js/chess-units.js';
import '../js/rules/index.js';
import '../js/pieces/index.js';
import '../js/chess-variants.js';
import '../js/chess-ai.js';
import '../js/variants/index.js';

import { writeFileSync } from 'fs';

const args = process.argv.slice(2);
const flags = {};
for (let i = 0; i < args.length; i++) {
  if (args[i] === '--variant' && args[i+1]) { flags.variant = args[++i]; }
  else if (args[i] === '--repeat' && args[i+1]) { flags.repeat = parseInt(args[++i]); }
  else if (args[i] === '--moves' && args[i+1]) { flags.moves = parseInt(args[++i]); }
  else if (args[i] === '--difficulty' && args[i+1]) { flags.difficulty = args[++i]; }
  else if (args[i] === '--white' && args[i+1]) { flags.white = args[++i]; }
  else if (args[i] === '--black' && args[i+1]) { flags.black = args[++i]; }
  else if (args[i] === '--output' && args[i+1]) { flags.output = args[++i]; }
  else if (args[i] === '--ai-vs-ai') { flags.aiVsAi = true; }
  else if (args[i] === '--all') { flags.all = true; }
  else if (args[i] === '--help') { flags.help = true; }
}

if (flags.help || (!flags.variant && !flags.all)) {
  console.log(`Usage: node --experimental-vm-modules tests/variant-test.js [options]

Options:
  --variant <key>     Test a specific variant (required unless --all)
  --all               Test all variants to completion
  --repeat <n>        Run n games per variant (default: 1, or 10 for single variant)
  --moves <n>         Max moves before declaring draw (default: 200)
  --difficulty <d>    AI difficulty: beginner|easy|medium|hard|expert (default: easy)
  --ai-vs-ai         Play both sides with AI (default for this script)
  --help              Show this help

Examples:
  node --experimental-vm-modules tests/variant-test.js --variant chess960 --repeat 50
  node --experimental-vm-modules tests/variant-test.js --all --difficulty medium
  node --experimental-vm-modules tests/variant-test.js --variant atomic --repeat 20`);
  process.exit(0);
}

const maxMoves = flags.moves || 200;
const difficulty = flags.difficulty || 'easy';
const whiteDiff = flags.white || difficulty;
const blackDiff = flags.black || difficulty;
const asymmetric = flags.white || flags.black;
const variants = flags.variant ? [flags.variant] : Object.keys(MCE.variantRegistry);
const repeat = flags.repeat || (flags.variant && !flags.all ? 10 : 1);

function getVariantStatus(g) {
  const vs = MCE.getVariantStatus ? MCE.getVariantStatus(g) : null;
  if (vs) return vs;
  const status = MCE.getStatus(g);
  if (status === 'checkmate' || status === 'stalemate' ||
      status === 'draw-50' || status === 'draw-repetition' || status === 'draw-material') {
    return status;
  }
  return null;
}

function detectWinner(result, lastTurn) {
  if (result === 'checkmate' || result === 'no-moves') {
    return lastTurn === 'w' ? 'black' : 'white';
  }
  if (result.endsWith('-w')) return 'white';
  if (result.endsWith('-b')) return 'black';
  if (result.startsWith('draw') || result === 'stalemate' || result === 'max-moves') return 'draw';
  return 'unknown';
}

function playGame(key) {
  const game = MCE.createGame(key);
  let moves = 0;
  const start = Date.now();

  while (moves < maxMoves) {
    const terminal = getVariantStatus(game);
    if (terminal) {
      const winner = detectWinner(terminal, game.turn);
      return { key, moves, result: terminal, winner, ms: Date.now() - start };
    }

    const legal = MCE.variantLegalMoves ? MCE.variantLegalMoves(game) : MCE.legalMoves(game);
    if (legal.length === 0) {
      const winner = detectWinner('no-moves', game.turn);
      return { key, moves, result: 'no-moves', winner, ms: Date.now() - start };
    }

    const sideDiff = game.turn === 'w' ? whiteDiff : blackDiff;
    const move = MCE.aiPickMove(game, null, { difficulty: sideDiff, timeMs: 100 });
    if (move) {
      MCE.makeMove(game, move);
    } else {
      MCE.makeMove(game, legal[Math.floor(Math.random() * legal.length)]);
    }
    moves++;
  }

  return { key, moves, result: 'max-moves', winner: 'draw', ms: Date.now() - start };
}

if (!flags.variant && !MCE.variantRegistry[flags.variant] && flags.variant) {
  console.error(`Unknown variant: ${flags.variant}`);
  console.error(`Available: ${Object.keys(MCE.variantRegistry).join(', ')}`);
  process.exit(1);
}

console.log(`Testing: ${flags.variant || 'all ' + variants.length + ' variants'}`);
console.log(`Repeat: ${repeat} | Max moves: ${maxMoves} | Difficulty: ${difficulty}\n`);

const summary = { total: 0, passed: 0, failed: 0, results: {} };

for (const key of variants) {
  const games = [];
  let crashes = 0;

  for (let i = 0; i < repeat; i++) {
    try {
      const result = playGame(key);
      games.push(result);
      summary.total++;
      summary.passed++;
    } catch (e) {
      crashes++;
      summary.total++;
      summary.failed++;
      if (crashes <= 3) {
        console.log(`  CRASH [${key}] game ${i+1}: ${e.message}`);
      }
    }
  }

  const results = {};
  for (const g of games) {
    results[g.result] = (results[g.result] || 0) + 1;
  }
  summary.results[key] = { games: games.length, crashes, results, avgMoves: 0, avgMs: 0 };

  const avgMs = games.length ? Math.round(games.reduce((s, g) => s + g.ms, 0) / games.length) : 0;
  const avgMoves = games.length ? Math.round(games.reduce((s, g) => s + g.moves, 0) / games.length) : 0;
  summary.results[key].avgMoves = avgMoves;
  summary.results[key].avgMs = avgMs;

  if (flags.output) {
    writeFileSync(flags.output, JSON.stringify(summary, null, 2));
  }
  const resultStr = Object.entries(results).map(([k,v]) => `${k}:${v}`).join(' ');
  const crashStr = crashes ? ` CRASHES:${crashes}` : '';
  const icon = crashes ? '✗' : '✓';

  if (variants.length === 1) {
    console.log(`  Game results: ${resultStr}${crashStr}`);
    console.log(`  Avg: ${avgMoves} moves, ${avgMs}ms per game`);
  } else {
    console.log(`${icon} ${key.padEnd(25)} ${resultStr.padEnd(40)} avg:${avgMoves}m ${avgMs}ms${crashStr}`);
  }
}

console.log(`\n--- Summary ---`);
console.log(`${summary.passed}/${summary.total} games completed without crash`);
if (summary.failed > 0) {
  console.log(`${summary.failed} crashes detected`);
  process.exit(1);
}

const neverFinished = Object.entries(summary.results)
  .filter(([, v]) => v.results['max-moves'] === repeat)
  .map(([k]) => k);
if (neverFinished.length > 0) {
  console.log(`\nVariants that never reached terminal state (${maxMoves} move limit):`);
  neverFinished.forEach(k => console.log(`  - ${k}`));
}
