import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

export function loadManifestPieceDefs(manifestPath, setsDir) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  const setDir = join(setsDir, manifest.path);
  const defs = {};

  for (const [key, file] of Object.entries(manifest.pieces)) {
    const fenChar = key[0] === 'w' ? key.slice(1) : key.slice(1).toLowerCase();
    const svgPath = join(setDir, file);
    if (!existsSync(svgPath)) continue;

    const svgText = readFileSync(svgPath, 'utf8');
    const innerMatch = svgText.match(/<svg[^>]*>([\s\S]*)<\/svg>/);
    if (!innerMatch) continue;

    const vbMatch = svgText.match(/viewBox="([^"]+)"/);
    let viewBox;
    if (vbMatch) {
      viewBox = vbMatch[1];
    } else {
      const wMatch = svgText.match(/width="([^"]+)"/);
      const hMatch = svgText.match(/height="([^"]+)"/);
      const w = wMatch ? parseFloat(wMatch[1]) : 100;
      const h = hMatch ? parseFloat(hMatch[1]) : 100;
      viewBox = `0 0 ${w} ${h}`;
    }
    defs[fenChar] = `<svg viewBox="${viewBox}" width="100" height="100">${innerMatch[1].trim()}</svg>`;
  }
  return defs;
}

export function loadSpriteSheetDefs(spriteModule) {
  return spriteModule;
}
