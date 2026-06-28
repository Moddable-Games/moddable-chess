let SETS = [];

async function loadGalleryIndex() {
  const resp = await fetch('../assets/pieces/gallery-index.json');
  SETS = await resp.json();
  return SETS;
}

function renderIntro(sets) {
  const totalPieces = sets.reduce((sum, s) => sum + s.pieceCount, 0);
  const families = [...new Set(sets.map(s => s.family))];
  const familyList = families.sort().map(f => f.replace(/-/g, ' ')).join(', ');
  document.getElementById('gallery-intro').textContent =
    `Visual catalogue of all piece sets available to the engine — ${totalPieces.toLocaleString()} SVGs across ${sets.length} sets covering ${families.length} game families: ${familyList}. Each set provides individual SVGs that can be mixed, matched, and composed via the piece-set-resolver fallback chain.`;
}

function populateFilters(sets) {
  const familyFilter = document.getElementById('family-filter');
  const setFilter = document.getElementById('filter-select');
  const families = [...new Set(sets.map(s => s.family))].sort();

  families.forEach(f => {
    const count = sets.filter(s => s.family === f).length;
    const opt = document.createElement('option');
    opt.value = f;
    opt.textContent = `${f.replace(/-/g, ' ')} (${count})`;
    familyFilter.appendChild(opt);
  });

  sets.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.id;
    opt.textContent = `${s.name} (${s.pieceCount})`;
    setFilter.appendChild(opt);
  });
}

function getSetPath(set) {
  return `../assets/pieces/sets/${set.id}/`;
}

function renderGallery(sets, options = {}) {
  const container = document.getElementById('gallery-container');
  const { search, family, setId, size = 64, bg = 'checkered' } = options;

  let filtered = sets;
  if (family && family !== 'all') filtered = filtered.filter(s => s.family === family);
  if (setId && setId !== 'all') filtered = filtered.filter(s => s.id === setId);

  container.innerHTML = '';

  filtered.forEach(set => {
    const setPath = getSetPath(set);
    const svgFiles = set._svgCache || [];

    let filesToShow = svgFiles;
    if (search) {
      const q = search.toLowerCase();
      filesToShow = svgFiles.filter(f => f.toLowerCase().includes(q));
    }
    if (filesToShow.length === 0 && search) return;

    const section = document.createElement('div');
    section.className = 'gallery-set';

    const header = document.createElement('div');
    header.className = 'gallery-set__header';

    const title = document.createElement('h3');
    title.textContent = set.name;
    header.appendChild(title);

    const meta = document.createElement('div');
    meta.className = 'gallery-set__meta';

    const familyBadge = document.createElement('span');
    familyBadge.className = 'badge badge--family';
    familyBadge.textContent = set.family.replace(/-/g, ' ');
    meta.appendChild(familyBadge);

    const licenseBadge = document.createElement('span');
    licenseBadge.className = 'badge badge--license';
    licenseBadge.textContent = set.license;
    meta.appendChild(licenseBadge);

    const countBadge = document.createElement('span');
    countBadge.className = 'badge badge--count';
    countBadge.textContent = `${set.pieceCount} SVGs`;
    meta.appendChild(countBadge);

    header.appendChild(meta);

    const attribution = document.createElement('div');
    attribution.className = 'gallery-set__attribution';
    let authorHtml = set.author;
    if (set.authorUrl) {
      authorHtml = `<a href="${set.authorUrl}" target="_blank" rel="noopener">${set.author}</a>`;
    }
    let sourceHtml = '';
    if (set.source) {
      sourceHtml = ` · <a href="${set.source}" target="_blank" rel="noopener">Source</a>`;
    }
    attribution.innerHTML = `by ${authorHtml}${sourceHtml}`;
    header.appendChild(attribution);

    section.appendChild(header);

    const grid = document.createElement('div');
    grid.className = `gallery-grid bg-${bg}`;
    grid.style.setProperty('--piece-size', `${size}px`);

    const displayFiles = filesToShow.length > 0 ? filesToShow : svgFiles;
    displayFiles.forEach(file => {
      const cell = document.createElement('div');
      cell.className = 'gallery-cell';
      cell.title = file;

      const img = document.createElement('img');
      img.src = setPath + file;
      img.alt = file;
      img.width = size;
      img.height = size;
      img.loading = 'lazy';
      cell.appendChild(img);

      const label = document.createElement('span');
      label.className = 'gallery-cell__label';
      label.textContent = file.replace('.svg', '');
      cell.appendChild(label);

      grid.appendChild(cell);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });

  renderStats(filtered);
}

async function loadSvgList(set) {
  if (set._svgCache) return set._svgCache;
  const path = getSetPath(set);
  try {
    const resp = await fetch(path);
    if (!resp.ok) throw new Error();
    const html = await resp.text();
    const matches = html.match(/[\w.%+-]+\.svg/g);
    if (matches && matches.length > 0) {
      const svgs = [...new Set(matches)].filter(f => !f.includes('manifest') && !f.includes('LICENSE')).sort();
      set._svgCache = svgs;
      return svgs;
    }
  } catch (e) {}
  set._svgCache = [];
  return [];
}

function renderStats(filtered) {
  const statsEl = document.getElementById('gallery-stats');
  const totalPieces = filtered.reduce((sum, s) => sum + s.pieceCount, 0);
  const families = [...new Set(filtered.map(s => s.family))];
  statsEl.textContent = `Showing ${filtered.length} sets · ${totalPieces.toLocaleString()} SVGs · ${families.length} families`;
}

function renderLicenceTable(sets) {
  const tbody = document.querySelector('#licence-table tbody');
  tbody.innerHTML = '';
  sets.forEach(set => {
    const tr = document.createElement('tr');

    const nameCell = document.createElement('td');
    nameCell.textContent = set.name;
    tr.appendChild(nameCell);

    const familyCell = document.createElement('td');
    familyCell.textContent = set.family.replace(/-/g, ' ');
    tr.appendChild(familyCell);

    const authorCell = document.createElement('td');
    if (set.authorUrl) {
      authorCell.innerHTML = `<a href="${set.authorUrl}" target="_blank" rel="noopener">${set.author}</a>`;
    } else {
      authorCell.textContent = set.author;
    }
    tr.appendChild(authorCell);

    const licenseCell = document.createElement('td');
    if (set.licenseUrl) {
      licenseCell.innerHTML = `<a href="${set.licenseUrl}" target="_blank" rel="noopener">${set.license}</a>`;
    } else {
      licenseCell.textContent = set.license;
    }
    tr.appendChild(licenseCell);

    const sourceCell = document.createElement('td');
    if (set.source) {
      const short = set.source.replace('https://github.com/', '').split('/tree/')[0];
      sourceCell.innerHTML = `<a href="${set.source}" target="_blank" rel="noopener">${short}</a>`;
    }
    tr.appendChild(sourceCell);

    const countCell = document.createElement('td');
    countCell.textContent = set.pieceCount;
    tr.appendChild(countCell);

    tbody.appendChild(tr);
  });
}

function getOptions() {
  return {
    search: document.getElementById('search-input').value.trim(),
    family: document.getElementById('family-filter').value,
    setId: document.getElementById('filter-select').value,
    size: parseInt(document.getElementById('size-select').value),
    bg: document.getElementById('bg-select').value,
  };
}

async function init() {
  const sets = await loadGalleryIndex();
  renderIntro(sets);
  populateFilters(sets);
  renderLicenceTable(sets);

  await Promise.all(sets.map(s => loadSvgList(s)));
  renderGallery(sets, getOptions());

  const controls = ['search-input', 'filter-select', 'size-select', 'bg-select', 'color-filter'];
  controls.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener(el.tagName === 'INPUT' ? 'input' : 'change', () => {
        renderGallery(sets, getOptions());
      });
    }
  });

  document.getElementById('family-filter').addEventListener('change', () => {
    const family = document.getElementById('family-filter').value;
    const setFilter = document.getElementById('filter-select');
    setFilter.innerHTML = '<option value="all">All sets</option>';
    const filtered = family === 'all' ? sets : sets.filter(s => s.family === family);
    filtered.forEach(s => {
      const opt = document.createElement('option');
      opt.value = s.id;
      opt.textContent = `${s.name} (${s.pieceCount})`;
      setFilter.appendChild(opt);
    });
    renderGallery(sets, getOptions());
  });
}

init();
