const SETS_PATH = 'assets/pieces/sets/';

const SETS = {
  'mce-chess': { name: 'MCE Chess', path: 'mce-chess/', recolorable: true },
  'lichess-cburnett': { name: 'Lichess (cburnett)', path: 'lichess-cburnett/', recolorable: false },
  'kaneo': { name: 'Kaneo', path: 'kaneo/', recolorable: false },
};

const PIECE_CHARS = 'KQRBNPACMSFGEYLHWIkqrbnpacmsfgeylhwi';

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

function pieceFile(char) {
  const color = char === char.toUpperCase() ? 'w' : 'b';
  return color + char.toUpperCase() + '.svg';
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
    spriteContainer.setAttribute('data-piece-resolver', 'true');
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

async function loadPieceFromSet(char, setId) {
  const set = SETS[setId];
  if (!set) return false;
  const basePath = getBasePath();
  const url = basePath + SETS_PATH + set.path + pieceFile(char);
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
    const loaded = await loadPieceFromSet(char, override);
    if (loaded) return true;
  }
  const loaded = await loadPieceFromSet(char, activeConfig.set);
  if (loaded) return true;
  if (activeConfig.fallback && activeConfig.fallback !== activeConfig.set) {
    return loadPieceFromSet(char, activeConfig.fallback);
  }
  return false;
}

async function loadSet(config) {
  if (config) {
    activeConfig = { ...activeConfig, ...config };
  }
  const chars = PIECE_CHARS.split('');
  const results = await Promise.allSettled(chars.map(c => resolvePiece(c)));
  return results.filter(r => r.status === 'fulfilled' && r.value).length;
}

async function loadForVariant(variantKey, config) {
  if (config) {
    activeConfig = { ...activeConfig, ...config };
  }
  const vc = typeof MCE !== 'undefined' ? MCE.getVariantConfig(variantKey) : null;
  let chars = 'KQRBNPkqrbnp'.split('');
  if (vc && vc.fen) {
    const fenPieces = vc.fen.split(' ')[0].replace(/[0-9\/]/g, '');
    const unique = [...new Set(fenPieces.split(''))];
    chars = [...new Set([...chars, ...unique])];
  }
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
  return Object.entries(SETS).map(([id, s]) => ({ id, ...s }));
}

function isLoaded(char) {
  return loadedSymbols.has(char);
}

const PieceSetResolver = {
  loadSet,
  loadForVariant,
  setConfig,
  getConfig,
  getAvailableSets,
  isLoaded,
  SETS,
};

export default PieceSetResolver;
export { loadSet, loadForVariant, setConfig, getConfig, getAvailableSets, isLoaded, SETS };
