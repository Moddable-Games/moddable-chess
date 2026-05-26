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
        const card = document.createElement('div');
        card.className = 'mc-variant-card';
        card.innerHTML =
          '<div class="mc-variant-card__name">' + v.name + '</div>' +
          '<div class="mc-variant-card__board">' + v.board + '</div>' +
          '<div class="mc-variant-card__desc">' + v.desc + '</div>';
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
