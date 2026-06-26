const SETS_BASE = 'assets/pieces/sets/';
const MANIFESTS_BASE = 'assets/pieces/manifests/';

let manifests = new Map();
let activeConfig = { set: 'mce-chess', fallback: 'mce-chess', overrides: {} };
let loadedSymbols = new Map();
let spriteContainer = null;

function getBasePath() {
  const scripts = document.querySelectorAll('script[src*="game-controller"]');
  if (scripts.length) {
    const src = scripts[0].getAttribute('src');
    return src.replace(/js\/game-controller\.js.*/, '');
  }
  const loc = window.location.pathname;
  if (loc.includes('/play/')) return loc.replace(/play\/.*/, '');
  return '../';
}

async function loadManifest(setId) {
  if (manifests.has(setId)) return manifests.get(setId);
  const basePath = getBasePath();
  const url = basePath + MANIFESTS_BASE + setId + '.json';
  try {
    const resp = await fetch(url);
    if (!resp.ok) { manifests.set(setId, null); return null; }
    const data = await resp.json();
    manifests.set(setId, data);
    return data;
  } catch (e) {
    manifests.set(setId, null);
    return null;
  }
}

async function loadAllManifests() {
  const basePath = getBasePath();
  const indexUrl = basePath + MANIFESTS_BASE + 'index.json';
  try {
    const resp = await fetch(indexUrl);
    if (!resp.ok) return;
    const ids = await resp.json();
    await Promise.all(ids.map(id => loadManifest(id)));
  } catch (e) { /* index not available, load on demand */ }
}

function symbolId(char) {
  return 'piece-' + char;
}

async function fetchSVG(url) {
  const resp = await fetch(url);
  if (!resp.ok) return null;
  return resp.text();
}

function parseSVGContent(svgText) {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgText, 'image/svg+xml');
  const svg = doc.querySelector('svg');
  if (!svg) return null;
  return {
    viewBox: svg.getAttribute('viewBox') || '0 0 45 45',
    innerHTML: svg.innerHTML
  };
}

function ensureSpriteContainer() {
  if (spriteContainer) return spriteContainer;
  spriteContainer = document.querySelector('svg[style*="display:none"], svg[style*="display: none"]');
  if (!spriteContainer) {
    spriteContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    spriteContainer.setAttribute('style', 'display:none');
    document.body.insertBefore(spriteContainer, document.body.firstChild);
  }
  return spriteContainer;
}

function injectSymbol(char, viewBox, innerHTML) {
  const container = ensureSpriteContainer();
  const id = symbolId(char);
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  const symbol = document.createElementNS('http://www.w3.org/2000/svg', 'symbol');
  symbol.setAttribute('id', id);
  symbol.setAttribute('viewBox', viewBox);
  symbol.innerHTML = innerHTML;
  container.appendChild(symbol);
  loadedSymbols.set(char, true);
}

function pieceKey(char) {
  const color = char === char.toUpperCase() ? 'w' : 'b';
  return color + char.toUpperCase();
}

async function loadPieceFromManifest(char, manifest) {
  if (!manifest || !manifest.pieces) return false;
  const key = pieceKey(char);
  const file = manifest.pieces[key];
  if (!file) return false;
  const basePath = getBasePath();
  const url = basePath + SETS_BASE + manifest.path + file;
  const svgText = await fetchSVG(url);
  if (!svgText) return false;
  const parsed = parseSVGContent(svgText);
  if (!parsed) return false;
  injectSymbol(char, parsed.viewBox, parsed.innerHTML);
  return true;
}

async function resolvePiece(char) {
  const override = activeConfig.overrides[char.toUpperCase()];
  if (override) {
    const m = await loadManifest(override);
    if (m) { const ok = await loadPieceFromManifest(char, m); if (ok) return true; }
  }
  const primary = await loadManifest(activeConfig.set);
  if (primary) { const ok = await loadPieceFromManifest(char, primary); if (ok) return true; }
  if (activeConfig.fallback && activeConfig.fallback !== activeConfig.set) {
    const fb = await loadManifest(activeConfig.fallback);
    if (fb) return loadPieceFromManifest(char, fb);
  }
  return false;
}

function getVariantChars(variantKey) {
  const vc = typeof MCE !== 'undefined' ? MCE.getVariantConfig(variantKey) : null;
  const chars = new Set('KQRBNPkqrbnp'.split(''));
  if (vc && vc.fen) {
    const fenPieces = vc.fen.split(' ')[0].replace(/[0-9\/]/g, '');
    fenPieces.split('').forEach(c => chars.add(c));
  }
  return chars;
}

async function loadForVariant(variantKey, config) {
  if (config) activeConfig = { ...activeConfig, ...config };
  const chars = [...getVariantChars(variantKey)];
  const results = await Promise.allSettled(chars.map(c => resolvePiece(c)));
  return results.filter(r => r.status === 'fulfilled' && r.value).length;
}

async function loadSet(config) {
  if (config) activeConfig = { ...activeConfig, ...config };
  const manifest = await loadManifest(activeConfig.set);
  if (!manifest) return 0;
  const chars = Object.keys(manifest.pieces).map(k => {
    const color = k[0];
    const ch = k.slice(1);
    return color === 'w' ? ch.toUpperCase() : ch.toLowerCase();
  });
  const results = await Promise.allSettled(chars.map(c => resolvePiece(c)));
  return results.filter(r => r.status === 'fulfilled' && r.value).length;
}

function setConfig(config) {
  activeConfig = { ...activeConfig, ...config };
}

function getConfig() {
  return { ...activeConfig };
}

function getAvailableSets() {
  return [...manifests.entries()]
    .filter(([, m]) => m !== null)
    .map(([id, m]) => ({ id, name: m.name, recolorable: m.recolorable }));
}

function getSetsForVariant(variantKey) {
  const needed = getVariantChars(variantKey);
  const neededKeys = [...needed].map(c => pieceKey(c));
  return [...manifests.entries()]
    .filter(([, m]) => {
      if (!m || !m.pieces) return false;
      for (const key of neededKeys) {
        if (!m.pieces[key]) return false;
      }
      return true;
    })
    .map(([id, m]) => ({ id, name: m.name, recolorable: m.recolorable }));
}

function isLoaded(char) {
  return loadedSymbols.has(char);
}

const PieceSetResolver = {
  loadSet,
  loadForVariant,
  loadAllManifests,
  setConfig,
  getConfig,
  getAvailableSets,
  getSetsForVariant,
  isLoaded,
};

export default PieceSetResolver;
export { loadSet, loadForVariant, loadAllManifests, setConfig, getConfig, getAvailableSets, getSetsForVariant, isLoaded };
