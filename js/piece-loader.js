import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';

export function loadManifestPieceDefs(manifestPath, setsDir) {
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
  // New format: manifest co-located in set dir (no 'path' field)
  // Old format: manifest.path points to set subdir under setsDir
  const setDir = manifest.path ? join(setsDir, manifest.path) : dirname(manifestPath);
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
    const prefix = key.toLowerCase();
    const content = namespaceIds(innerMatch[1].trim(), prefix);
    defs[fenChar] = `<svg viewBox="${viewBox}" width="100" height="100">${content}</svg>`;
  }
  return defs;
}

function namespaceIds(svgContent, prefix) {
  const ids = new Set();
  const idDefRegex = /\bid="([^"]+)"/g;
  let match;
  while ((match = idDefRegex.exec(svgContent)) !== null) {
    ids.add(match[1]);
  }
  if (ids.size === 0) return svgContent;

  let result = svgContent;
  for (const id of ids) {
    const namespaced = `${prefix}-${id}`;
    result = result.replaceAll(`id="${id}"`, `id="${namespaced}"`);
    result = result.replaceAll(`url(#${id})`, `url(#${namespaced})`);
    result = result.replaceAll(`href="#${id}"`, `href="#${namespaced}"`);
    result = result.replaceAll(`xlink:href="#${id}"`, `xlink:href="#${namespaced}"`);
  }
  return result;
}

export function loadSpriteSheetDefs(spriteModule) {
  return spriteModule;
}
