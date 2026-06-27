import { chromium } from '@playwright/test';
import MCE from '../js/chess-engine.js';
import '../js/chess-moves.js';
import '../js/chess-play.js';
import '../js/chess-units.js';
import '../js/rules/index.js';
import '../js/pieces/index.js';
import '../js/chess-variants.js';
import '../js/variants/index.js';
import { mkdir } from 'fs/promises';

const BASE_URL = process.env.BASE_URL || 'http://localhost:80/MODDABLE/moddable-chess';
const SCREENSHOT_DIR = 'tests/screenshots';

await mkdir(SCREENSHOT_DIR, { recursive: true });

const variants = Object.keys(MCE.variantRegistry);
console.log(`Visual testing ${variants.length} variants at ${BASE_URL}\n`);

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });

const results = { passed: [], failed: [] };

for (const key of variants) {
  const page = await context.newPage();
  const errors = [];

  page.on('pageerror', err => errors.push(err.message));
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });

  try {
    await page.goto(`${BASE_URL}/play/?variant=${key}`, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForSelector('svg[viewBox]', { timeout: 5000 });

    const svg = await page.$('svg[viewBox]');
    const box = await svg.boundingBox();

    if (!box || box.width < 50) {
      throw new Error('SVG board not rendered (no bounding box)');
    }

    const vc = MCE.getVariantConfig(key);
    const cols = (vc && vc.cols) || 8;
    const rows = (vc && vc.rows) || 8;
    const tileW = box.width / cols;
    const tileH = box.height / rows;

    const startRow = rows - 2;
    const startCol = Math.floor(cols / 2);
    const clickX = box.x + (startCol * tileW) + tileW / 2;
    const clickY = box.y + (startRow * tileH) + tileH / 2;
    await page.mouse.click(clickX, clickY);
    await page.waitForTimeout(200);

    const targetRow = startRow - 2;
    const targetY = box.y + (targetRow * tileH) + tileH / 2;
    await page.mouse.click(clickX, targetY);
    await page.waitForTimeout(300);

    await page.screenshot({ path: `${SCREENSHOT_DIR}/${key}.png` });

    if (errors.length > 0) {
      results.failed.push({ key, errors });
      process.stdout.write('X');
    } else {
      results.passed.push(key);
      process.stdout.write('.');
    }
  } catch (err) {
    if (err.message.includes('Timeout') || err.message.includes('bounding')) {
      results.failed.push({ key, errors: [err.message] });
      process.stdout.write('T');
    } else {
      results.failed.push({ key, errors: [err.message] });
      process.stdout.write('X');
    }
    await page.screenshot({ path: `${SCREENSHOT_DIR}/${key}-error.png` }).catch(() => {});
  }

  await page.close();
}

await browser.close();

console.log('\n');
console.log(`Passed: ${results.passed.length}/${variants.length}`);
console.log(`Failed: ${results.failed.length}/${variants.length}`);

if (results.failed.length > 0) {
  console.log('\n--- FAILURES ---');
  for (const f of results.failed) {
    console.log(`  ${f.key}:`);
    for (const e of f.errors) {
      console.log(`    ${e.substring(0, 150)}`);
    }
  }
}

process.exit(results.failed.length > 0 ? 1 : 0);
