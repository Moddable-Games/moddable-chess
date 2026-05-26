fetch('data/variants.json')
  .then(r => r.json())
  .then(variants => {
    const grid = document.getElementById('variant-grid');

    variants.forEach(v => {
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
  });
