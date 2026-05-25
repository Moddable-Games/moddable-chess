# Moddable Chess

Modular chess engine with 18 playable variants on boards from 8×8 to 12×8. Zero dependencies, pure JavaScript, no build step.

---

### Stack

```
HTML + Vanilla JS + Zero dependencies + Zero build step
```

---

### Architecture

```
moddable-chess/
├── index.html              ← Homepage / marketing page
├── play/
│   └── index.html          ← Interactive demo (variant picker + board)
├── docs/
│   ├── index.html          ← Documentation hub
│   ├── api.html            ← Full API reference
│   └── variants.html       ← "Add a variant" guide
├── data/
│   └── variants.json       ← Variant metadata (single source of truth)
├── css/
│   ├── home.css            ← Homepage styles
│   ├── style.css           ← Play page styles
│   └── docs.css            ← Documentation styles
├── js/
│   ├── chess-engine.js     ← Core: board state, FEN, coordinate helpers
│   ├── chess-moves.js      ← Move generation: pseudo-legal + legal moves
│   ├── chess-play.js       ← Make/unmake moves, game status detection
│   ├── chess-variants.js   ← Variant rule modifiers (composable flags)
│   ├── board-renderer.js   ← SVG board renderer (variable sizes)
│   ├── game-controller.js  ← Play page: wires engine to renderer
│   └── home.js             ← Homepage: variant grid from JSON
└── assets/
    └── pieces.svg          ← Cburnett piece sprites (CC BY-SA 3.0)
```

---

### Variants

| Status | Variant | Board | Key rule |
|--------|---------|-------|----------|
| Done | Standard Chess | 8×8 | Standard FIDE rules |
| Done | King of the Hill | 8×8 | King reaches centre = win |
| Done | Three-Check | 8×8 | 3 checks = win |
| Done | Antichess | 8×8 | Forced captures, lose all pieces = win |
| Done | Racing Kings | 8×8 | No checks, king to 8th rank = win |
| Done | Fischer Random (960) | 8×8 | Randomised back rank |
| Done | Rifle Chess | 8×8 | Capturing piece stays on its square |
| Done | Atomic | 8×8 | Captures explode adjacent pieces |
| Done | Marseillais | 8×8 | Two moves per turn, check ends turn |
| Done | Duck Chess | 8×8 | Place blocker duck after each move |
| Done | Fog of War | 8×8 | Only see squares you attack |
| Done | Capablanca | 10×8 | Archbishop + Chancellor |
| Done | Grand Chess | 10×10 | Same new pieces, bigger board |
| Done | Courier Chess | 12×8 | Medieval German variant (1200s) |
| Done | No Castling | 8×8 | Standard chess, castling disabled |
| Done | Torpedo Chess | 8×8 | Pawns can always double-move |
| Done | Horde Chess | 8×8 | 36 pawns vs normal army |
| Done | Extinction Chess | 8×8 | Lose when any piece type is eliminated |

---

### Usage

```html
<script src="js/chess-engine.js"></script>
<script src="js/chess-moves.js"></script>
<script src="js/chess-play.js"></script>
<script src="js/chess-variants.js"></script>
<script src="js/board-renderer.js"></script>
<script>
const game = MCE.createGame('standard');
const moves = MCE.legalMoves(game);
MCE.makeMove(game, moves[0]);
MCE.renderBoard(document.getElementById('board'), game, { size: 480 });
</script>
```

---

### Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`

---

### Changelog

#### 2026-05-25
- Add 4 new variants: No Castling, Torpedo Chess, Horde Chess, Extinction Chess (18 total)
- Add version system: version.txt + bump.sh for cache-busting propagation
- Add Moddable Games logo to footer (replaces text link)
- Document embed/iframe URL parameters in API reference
- Fix mobile touch targeting on board (SVG scale correction)

#### 2026-05-24
- Unify site branding: Moddable Games cube logo, Rajdhani/Barlow fonts, consistent nav + footer across all pages
- Add docs UX: sticky sidebar TOC, active page highlighting, improved layout
- Add move animation system: `animate`, `animStyle` ('slide' or 'arc'), `animDuration`, `animCaptureBurst` as renderer params
- Add capture burst particle effect (expanding ring + sparks)
- Deploy to GitHub Pages with custom domain (chess.moddable.games)
- Add OG/Twitter meta tags and favicon to all pages
- Add responsive mobile layout (stacked on mobile, horizontal variant scroll)
- Update API docs with animation, draw detection, and positionKey documentation
- Add promotion UI dialog with piece selection (Q/R/B/N, plus A/C for Capablanca/Grand)
- Add draw detection: threefold repetition, insufficient material, improved 50-move rule messaging
- Add board controls: flip board, undo move, new game
- Add last-move highlight (blue overlay on from/to squares)
- Add captured pieces display (sorted by value, grouped by color)
- Fix board shift bug — container dimensions now locked between re-renders
- Refactor play page CSS to use custom properties
- Engine extensions for Dungeon Chess support: terrain system, config-based game creation, custom piece registry, multi-player turns, pluggable legality/win conditions, per-square metadata, feature flags (noCastling/noEnPassant/noPromotion), capturedAt in undo descriptor
- Add AI opponent with Solo / Pass & Play mode selection
- Extract inline script to external `js/home.js` backed by `data/variants.json`
- Add homepage, docs hub, API reference, and "add a variant" guide
- Add Dungeon Chess featured card to homepage variant grid
- Add variant description panel to play page

#### 2026-05-23
- Variable board sizes — support 10×8, 10×10, 12×8 with Archbishop, Chancellor, Sage
- Add all medium variants: Rifle, Atomic, Marseillais, Duck Chess, Fog of War
- Add variant picker sidebar, fix Chess960 FEN, add Racing Kings start position

#### 2026-05-22
- Initial chess engine — core, moves, variants, SVG renderer, piece sprites

---

### License

MIT
