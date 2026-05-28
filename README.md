# Moddable Chess

Modular chess engine with 55 playable variants on boards from 4×8 to 12×8. Zero dependencies, pure JavaScript, no build step.

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
│   └── variants.html       ← Plugin guide (how to create variants)
├── data/
│   └── variants.json       ← Variant metadata (single source of truth)
├── css/
│   ├── home.css            ← Homepage styles
│   ├── style.css           ← Play page styles
│   └── docs.css            ← Documentation styles
├── js/
│   ├── chess-engine.js     ← Core: board state, FEN, coordinate helpers
│   ├── chess-moves.js      ← Move generation: pseudo-legal + legal moves
│   ├── chess-play.js       ← Make/unmake moves, turn logic dispatch
│   ├── chess-variants.js   ← Variant status + custom piece registration
│   ├── board-renderer.js   ← SVG board renderer (variable sizes)
│   ├── game-controller.js  ← Play page: wires engine to renderer
│   ├── home.js             ← Homepage: variant grid from JSON
│   └── variants/           ← Plugin files (one per variant)
│       ├── index.js        ← Auto-loader
│       ├── standard.js
│       ├── atomic.js
│       └── ...             ← 55 total
└── assets/
    └── pieces.svg          ← Cburnett piece sprites (CC BY-SA 3.0)
```

---

### Variants

| Status | Variant | Board | Key rule |
|--------|---------|-------|----------|
| Done | Standard Chess | 8×8 | Standard FIDE rules |
| Done | Almost Chess | 8×8 | One queen replaced by chancellor |
| Done | Amazon Chess | 8×8 | Amazon (Q+N) replaces queen |
| Done | Andernach Chess | 8×8 | Captures flip piece colour |
| Done | Antichess | 8×8 | Forced captures, lose all pieces = win |
| Done | Atomic | 8×8 | Captures explode adjacent pieces |
| Done | Benedict Chess | 8×8 | Convert enemies instead of capturing |
| Done | Berserk Chess | 8×8 | Check grants bonus move |
| Done | Breakthrough | 7×7 | Pawns only, first to far rank wins |
| Done | Capablanca | 10×8 | Archbishop + Chancellor |
| Done | Checkless Chess | 8×8 | No check unless it's checkmate |
| Done | Chigorin | 8×8 | White has knights instead of bishops |
| Done | Codrus | 8×8 | Lose your king to win |
| Done | Courier Chess | 12×8 | Medieval German variant (1200s) |
| Done | Dark Chess | 8×8 | Total fog, capture king to win |
| Done | Diana Chess | 6×6 | No queens or knights |
| Done | Dice Chess | 8×8 | Die roll constrains which piece type moves |
| Done | Duck Chess | 8×8 | Place blocker duck after each move |
| Done | Endgame Chess | 8×8 | Start with only pawns + kings |
| Done | Extinction Chess | 8×8 | Lose when any piece type is eliminated |
| Done | Fischer Random (960) | 8×8 | Randomised back rank |
| Done | Five-Check | 8×8 | Five checks to win |
| Done | Fog of War | 8×8 | Only see squares you attack |
| Done | Giveaway | 8×8 | Antichess (stalemate = loss) |
| Done | Grand Chess | 10×10 | Same new pieces, bigger board |
| Done | Grid Chess | 8×8 | Moves must cross 2×2 grid lines |
| Done | Half Chess | 4×8 | Compressed board, instant contact |
| Done | Horde Chess | 8×8 | 36 pawns vs normal army |
| Done | King of the Hill | 8×8 | King reaches centre = win |
| Done | Knightmate | 8×8 | Knight is royal, king moves like knight |
| Done | Los Alamos | 6×6 | No bishops, first computer chess (1956) |
| Done | Madrasi Chess | 8×8 | Same-type pieces paralyse each other |
| Done | Maharaja & Sepoys | 8×8 | One Queen+Knight piece vs full army |
| Done | Makpong | 8×8 | King can't move from check |
| Done | Marseillais | 8×8 | Two moves per turn, check ends turn |
| Done | Minichess | 5×5 | Full piece types on tiny board |
| Done | Monster Chess | 8×8 | White gets 2 moves per turn |
| Done | No Castling | 8×8 | Standard chess, castling disabled |
| Done | No Retreat | 8×8 | Pieces can't move backward |
| Done | Omnicide | 8×8 | Lose all pieces, captures not forced |
| Done | Patrol Chess | 8×8 | Capture only when defended |
| Done | Pawns Only | 8×8 | Only pawns, first promotion wins |
| Done | Peasants' Revolt | 8×8 | King + pawns vs king + knights |
| Done | Petty Chess | 5×6 | All pieces on compact board |
| Done | Progressive | 8×8 | Escalating moves: 1, 2, 3, 4... |
| Done | Racing Kings | 8×8 | No checks, king to 8th rank = win |
| Done | Rifle Chess | 8×8 | Capturing piece stays on its square |
| Done | Shatar | 8×8 | Mongolian chess, bare king = loss |
| Done | Single-Check | 8×8 | One check wins instantly |
| Done | Stalemate Wins | 8×8 | Stalemating opponent wins |
| Done | Suicide Chess | 8×8 | Antichess (stalemate = draw) |
| Done | Three-Check | 8×8 | 3 checks = win |
| Done | Torpedo Chess | 8×8 | Pawns can always double-move |
| Done | Upside-Down | 8×8 | Pieces start on opponent's rank |
| Done | Weak! | 8×8 | Weakest piece must move first |

---

### Usage

```html
<script src="js/chess-engine.js"></script>
<script src="js/chess-moves.js"></script>
<script src="js/chess-play.js"></script>
<script src="js/chess-variants.js"></script>
<script src="js/board-renderer.js"></script>
<script src="js/variants/standard.js"></script>
<script src="js/variants/atomic.js"></script>
<!-- or load all: <script src="js/variants/index.js"></script> -->
<script>
const game = MCE.createGame('atomic');
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

#### 2026-05-28
- Add Shatar (Mongolian Chess) variant — bare king win condition (55 total)
- Sort all variant listings alphabetically within categories (#52)
- Add "For Developers" section with tabbed code examples and "Moddable Engines" sister project section to homepage
- Add hero parallax effect (title lag, button fade, glow drift)
- Fix section colour contrast: dark dev section, mid-tone engines section
- Consolidate `text-wrap: pretty` into shared.css (DRY)

#### 2026-05-27
- Add 15 Tier 1 plugin-ready variants (54 total): Half Chess, Diana, Petty, Omnicide, Dark Chess, Berserk, Benedict, Andernach, Grid, Checkless, No Retreat, Weak!, Patrol, Madrasi, Dice
- Complete plugin architecture migration: all 54 variants are now self-contained plugin files using `MCE.registerVariant()`
- Remove all hardcoded variant if/else chains from core engine (chess-engine, chess-play, chess-moves, chess-variants, chess-ai)
- Remove legacy `VARIANT_BOARDS` and `VARIANTS` objects — plugins are sole source of truth
- Add plugin hooks: `winCondition`, `moveFilter`, `beforeMove`, `turnLogic`, `restoreState`, `init`, `visibility`, `statusText`, `aiMoveCount`
- Add variant inheritance via `extends` property
- Rewrite docs/variants.html as Plugin Guide with full hook documentation and examples
- Update docs/api.html with `registerVariant()`, `getVariantConfig()`, `registerPiece()`, `advanceTurn()` API docs
- Add 6 board colour themes: Classic, Cosmic Dark, Classic Wood, Marble, Neon, Minimal
- Add theme picker control to play page board controls
- Add theme API: `MCE.setTheme()`, `MCE.getTheme()`, `MCE.THEMES` with custom theme support
- Add `theme` URL parameter for embeds (cosmic, wood, marble, neon, minimal)
- Add hex-grid-blue.svg tiling background to hero and developer sections
- Add cross-promotion for Moddable Hexmaps in docs (hex-board geometry limitations)
- Add "Sister Projects" section to documentation hub
- Update API reference with full theme documentation and examples
- Fix variant count in docs (36 → 39)
- Bump version to 0.6.0
- Sticky nav: site nav stays pinned on scroll

#### 2026-05-26
- Add 19 new variants (36 total): Knightmate, Monster Chess, Progressive, Chigorin, Almost Chess, Amazon Chess, Upside-Down, Single-Check, Five-Check, Giveaway, Suicide Chess, Stalemate Wins, Codrus, Makpong, Endgame Chess, Peasants' Revolt, Pawns Only, Los Alamos (6x6), Minichess (5x5)
- Add two new board sizes: 6x6 and 5x5
- Fix unmakeMove: restore progressiveMove and lastMovedSq from undo records
- Update developer docs: expanded variant table (36 entries), new examples

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
