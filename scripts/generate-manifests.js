#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { dirname, resolve, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const galleryPath = join(ROOT, 'docs/js/pieces-gallery.js');
const gallerySrc = readFileSync(galleryPath, 'utf8');

const WHITE_COLORS = new Set(['w', 'white', 'sente', 'red', 'light']);
const BLACK_COLORS = new Set(['b', 'black', 'gote', 'dark']);

const setRegex = /\{\s*id:\s*'([^']+)',\s*name:\s*'([^']+)',\s*path:\s*'([^']+)',\s*author:\s*'([^']*)',\s*license:\s*'([^']*)',\s*recolorable:\s*(true|false),\s*notes:\s*'[^']*',\s*pieces:\s*\[([\s\S]*?)\]\s*\}/g;

let match;
let generated = 0;

while ((match = setRegex.exec(gallerySrc)) !== null) {
  const [, id, name, path, author, license, recolorable, piecesStr] = match;

  const pieceRegex = /\{\s*file:\s*'([^']+)',\s*char:\s*'([^']+)',\s*color:\s*'([^']+)',\s*name:\s*'[^']*'\s*\}/g;
  const pieces = {};
  let pm;
  while ((pm = pieceRegex.exec(piecesStr)) !== null) {
    const [, file, char, color] = pm;
    if (char.length > 2) continue;
    let c;
    if (WHITE_COLORS.has(color)) c = 'w';
    else if (BLACK_COLORS.has(color)) c = 'b';
    else continue;
    const key = c + char.toUpperCase();
    pieces[key] = file;
  }

  if (Object.keys(pieces).length === 0) {
    console.log(`EMPTY ${id}: no mappable pieces`);
    continue;
  }

  const setPath = path.replace('../assets/pieces/sets/', '');
  const outDir = join(ROOT, 'assets/pieces/sets', setPath);

  const manifest = {
    id,
    name,
    path: setPath,
    author,
    license,
    recolorable: recolorable === 'true',
    pieces
  };

  try {
    const manifestDir = join(ROOT, 'assets/pieces/manifests');
    mkdirSync(manifestDir, { recursive: true });
    writeFileSync(join(manifestDir, id + '.json'), JSON.stringify(manifest, null, 2) + '\n');
    console.log(`${id}: ${Object.keys(pieces).length} pieces → manifests/${id}.json`);
    generated++;
  } catch (e) {
    console.error(`Failed: ${id} — ${e.message}`);
  }
}

console.log(`\nGenerated ${generated} manifests.`);
