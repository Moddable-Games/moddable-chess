function track(event, params) {
  if (typeof window.gtag === 'function') window.gtag('event', event, params || {});
}

document.querySelectorAll('a[href^="http"]').forEach(function(a) {
  a.addEventListener('click', function() {
    track('outbound_click', { link_url: a.href, link_label: a.textContent.trim() });
  });
});

(function() {
  var tracked = {};
  var sections = document.querySelectorAll('[data-section]');
  if (sections.length === 0) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var name = entry.target.getAttribute('data-section');
        if (name && !tracked[name]) {
          tracked[name] = true;
          track('section_scroll', { section_name: name });
        }
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(function(s) { observer.observe(s); });
})();

fetch('data/variants.json')
  .then(r => r.json())
  .then(variants => {
    const grid = document.getElementById('variant-grid');
    const filterWrap = document.getElementById('variant-filter');

    const boards = [...new Set(variants.map(v => v.board))];
    boards.sort((a, b) => {
      const aNum = parseInt(a);
      const bNum = parseInt(b);
      return aNum - bNum;
    });

    let activeFilter = 'All';

    function renderFilter() {
      filterWrap.innerHTML = '';
      const sizes = ['All', ...boards];
      sizes.forEach(size => {
        const btn = document.createElement('button');
        btn.className = 'mc-filter-btn' + (size === activeFilter ? ' mc-filter-btn--active' : '');
        btn.textContent = size;
        btn.addEventListener('click', () => {
          activeFilter = size;
          renderFilter();
          renderGrid();
        });
        filterWrap.appendChild(btn);
      });
    }

    function renderGrid() {
      grid.innerHTML = '';
      const filtered = activeFilter === 'All'
        ? variants
        : variants.filter(v => v.board === activeFilter);

      filtered.forEach(v => {
        const card = document.createElement('a');
        card.href = 'play/?variant=' + encodeURIComponent(v.slug || v.key);
        card.className = 'mc-variant-card';
        card.innerHTML =
          '<div class="mc-variant-card__name">' + (v.title || v.name) + '</div>' +
          '<div class="mc-variant-card__board">' + v.board + '</div>' +
          '<div class="mc-variant-card__desc">' + (v.special || v.desc || '') + '</div>';
        grid.appendChild(card);
      });

      const dc = document.createElement('a');
      dc.href = 'https://dungeon.moddable.games';
      dc.target = '_blank';
      dc.rel = 'noopener';
      dc.className = 'mc-variant-card mc-variant-card--featured';
      dc.innerHTML =
        '<div class="mc-variant-card__eyebrow">POWERED BY THIS ENGINE</div>' +
        '<div class="mc-variant-card__name">Dungeon Chess</div>' +
        '<div class="mc-variant-card__board">Modular boards · 4 species · 24 units</div>' +
        '<div class="mc-variant-card__desc">Asymmetric fantasy skirmishes on dungeon boards. Four species, XP drafting, solo vs AI. A standalone game built on the Moddable Chess engine.</div>';
      grid.appendChild(dc);
    }

    renderFilter();
    renderGrid();
  });
