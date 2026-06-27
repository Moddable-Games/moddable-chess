# Moddable Chess

Modular chess engine with 70 playable variants on boards from 4×8 to 12×8. Zero dependencies, pure JavaScript, no build step.

---

### Stack

```
Native ESM + Vanilla JS + Zero dependencies + Zero build step
```

---

### Architecture

```
moddable-chess/
├── package.json            ← ESM config + npm exports map
├── index.html              ← Homepage / marketing page
├── play/
│   └── index.html          ← 3-column app shell with sidebar variant picker, responsive mobile layout
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
│   ├── chess-engine.js         ← Core: board state, FEN, coordinate helpers
│   ├── chess-moves.js          ← Move generation: pseudo-legal + legal moves
│   ├── chess-play.js           ← Make/unmake moves, turn logic dispatch
│   ├── chess-variants.js       ← Variant status + custom piece registration
│   ├── board-renderer.js       ← SVG board renderer (tilePainter, pieceProvider, afterRender)
│   ├── piece-set-resolver.js   ← Visual piece set resolution with manifest-driven fallback chains
│   ├── game-controller-core.js ← Reusable MCE.createGameController() for consumers
│   ├── replay.js               ← MCE.createReplay() for move-by-move playback
│   ├── game-controller.js      ← Play page: wires engine to renderer
│   ├── home.js                 ← Homepage: variant grid from JSON
│   ├── pieces/                 ← Piece type registry with metadata (name, category, movement rules)
│   │   ├── index.js            ← Barrel import (loads all 18)
│   │   └── ...                 ← 18 piece definition files
│   └── variants/               ← Plugin files (one per variant, ESM)
│       ├── index.js            ← Barrel import (loads all 70)
│       ├── standard.js
│       ├── atomic.js
│       └── ...                 ← 70 total
└── assets/
    ├── pieces.svg          ← Cburnett piece sprites (CC BY-SA 3.0)
    └── pieces/
        ├── sets/           ← 22 piece set directories with individual SVGs
        └── manifests/      ← Manifest JSON files defining set composition
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
| Done | Berolina Chess | 8×8 | Pawns move diagonally, capture straight |
| Done | Berserk Chess | 8×8 | Check grants bonus move |
| Done | Breakthrough | 7×7 | Pawns only, first to far rank wins |
| Done | Capablanca | 10×8 | Archbishop + Chancellor |
| Done | Checkless Chess | 8×8 | No check unless it's checkmate |
| Done | Chigorin | 8×8 | White has knights instead of bishops |
| Done | Codrus | 8×8 | Lose your king to win |
| Done | Courier Chess | 12×8 | Medieval German variant (1200s) |
| Done | Cylinder Chess | 8×8 | Files wrap: a connects to h |
| Done | Dark Chess | 8×8 | Total fog, capture king to win |
| Done | Diana Chess | 6×6 | No queens or knights |
| Done | Dice Chess | 8×8 | Die roll constrains which piece type moves |
| Done | Displacement Chess | 8×8 | Swap with adjacent friendly pieces |
| Done | Duck Chess | 8×8 | Place blocker duck after each move |
| Done | Einstein Chess | 8×8 | Moves demote, captures promote pieces |
| Done | Endgame Chess | 8×8 | Start with only pawns + kings |
| Done | Extinction Chess | 8×8 | Lose when any piece type is eliminated |
| Done | Fischer Random (960) | 8×8 | Randomised back rank |
| Done | Five-Check | 8×8 | Five checks to win |
| Done | Fog of War | 8×8 | Only see squares you attack |
| Done | Giveaway | 8×8 | Antichess (stalemate = loss) |
| Done | Grand Chess | 10×10 | Same new pieces, bigger board |
| Done | Grid Chess | 8×8 | Moves must cross 2×2 grid lines |
| Done | Half Chess | 4×8 | Compressed board, instant contact |
| Done | Hoppel-Poppel | 8×8 | Knights capture like bishops, vice versa |
| Done | Horde Chess | 8×8 | 36 pawns vs normal army |
| Done | King of the Hill | 8×8 | King reaches centre = win |
| Done | Knightmate | 8×8 | Knight is royal, king moves like knight |
| Done | Legan Chess | 8×8 | Berolina pawns, swapped royals |
| Done | Los Alamos | 6×6 | No bishops, first computer chess (1956) |
| Done | Madrasi Chess | 8×8 | Same-type pieces paralyse each other |
| Done | Maharaja & Sepoys | 8×8 | One Queen+Knight piece vs full army |
| Done | Makpong | 8×8 | King can't move from check |
| Done | Makruk | 8×8 | Thai chess, promote on rank 6 to Met |
| Done | Marseillais | 8×8 | Two moves per turn, check ends turn |
| Done | Minichess | 5×5 | Full piece types on tiny board |
| Done | Monster Chess | 8×8 | White gets 2 moves per turn |
| Done | No Castling | 8×8 | Standard chess, castling disabled |
| Done | No Retreat | 8×8 | Pieces can't move backward |
| Done | Omnicide | 8×8 | Lose all pieces, captures not forced |
| Done | Orda Chess | 8×8 | Asymmetric Mongol army, divergent movers |
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
| Done | Toroidal Chess | 8×8 | Board wraps both directions (torus) |
| Done | Torpedo Chess | 8×8 | Pawns can always double-move |
| Done | Upside-Down | 8×8 | Pieces start on opponent's rank |
| Done | Weak! | 8×8 | Weakest piece must move first |

---

### Usage

**Browser (ESM):**

```html
<script type="module">
import MCE from './js/chess-engine.js';
import './js/chess-moves.js';
import './js/chess-play.js';
import './js/board-renderer.js';
import './js/variants/standard.js';
import './js/variants/atomic.js';

const game = MCE.createGame('atomic');
const moves = MCE.legalMoves(game);
MCE.makeMove(game, moves[0]);
MCE.renderBoard(document.getElementById('board'), game, { size: 480 });
</script>
```

**Node.js / Cloudflare Workers (no DOM):**

```javascript
import MCE, { createGame } from './js/chess-engine.js';
import './js/chess-moves.js';
import './js/chess-play.js';
import './js/variants/standard.js';

const game = createGame('standard');
const moves = MCE.legalMoves(game);
MCE.makeMove(game, moves[0]);
console.log(MCE.getStatus(game));
```

---

### MCP Server (AI Integration)

Connect to Claude Code or Claude Desktop for AI-powered chess analysis:

**Remote (zero install):**
```json
{
  "mcpServers": {
    "moddable-chess": {
      "url": "https://mcp.moddable.games/chess"
    }
  }
}
```

**Local (self-hosted):**
```bash
claude mcp add --transport stdio moddable-chess node /path/to/moddable-chess/mcp/server.js
```

**Available tools (8):**
- `chess_list_variants` — Browse all 70 variants with descriptions and rules
- `chess_get_legal_moves` — Get annotated legal moves for any position
- `chess_analyze_position` — Engine evaluation with best move and principal variation
- `chess_validate_move` — Check if a move is legal with explanation
- `chess_make_moves` — Play a sequence of moves, get resulting position
- `chess_get_opening_book` — Look up book moves for known positions
- `chess_generate_puzzle` — Serve puzzles from a pool of 1,500+ across 66 variants (via remote); random-search fallback (local)
- `chess_render_svg` — Render any position as a self-contained SVG image

---

### Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000/`

---

### Changelog

#### 2026-06-27 (v0.9.21)
- Complete engine decoupling: all 18 piece types registered via registerPiece with movement primitives
- Add movement primitive system: Leaper, Rider, compose, divergent (js/movement.js)
- Extract chess rules into plugin system: castling, en-passant, promotion, check (js/rules/)
- Add registerRule/getRules API to core engine
- Core move generator (pseudoLegalMoves, attacks) is now fully piece-agnostic
- Fix pre-existing castlingClear bug (column vs square index comparison)

#### 2026-06-27 (v0.9.20)
- Redesign play page: 3-column app shell layout with sidebar variant picker
- Add piece set resolver: manifest-driven fallback chains, 22 swappable piece sets
- Add piece gallery: 1145 SVGs across 22 sets with search/filter UI
- Add piece type registry: 18 piece types with metadata (js/pieces/)
- Graphical fairy piece SVGs replace all text-letter glyphs
- Add 4 new variants: Chaturanga, Shatranj, Absorption, Sittuyin (74 total)
- Add Xiangqi board renderer, Shogi board provider, and dedicated piece sprites
- Add board generation docs page with live SVG examples
- Fix 11 bugs from Kevin's Round 3 playtest
- Add automated test suite: engine smoke tests + Playwright visual tests
- Add puzzle pool: 1,500+ puzzles across all variants

#### 2026-06-16 (v0.9.10)
- Add headless SVG board renderer for chess and draughts families
- Add chess_render_svg MCP tool (8 tools total)
- Fix variant bugs from extensive AI vs AI testing (70/70 pass)
- Rework AI difficulty system with variant-specific evaluators
- Remove all hardcoded variant names from core engine files

#### 2026-06-10 (v0.9.2)
- Add GA4 event tracking across all user interactions
- Add SDK demo page: live themes grid, AI-vs-AI panel
- Docs overhaul: ESM examples, MCP section, breadcrumb navigation

#### 2026-06-10 (v0.9.0)
- Migrate entire codebase to native ESM (`<script type="module">`, `import`/`export`)
- Same source files now run in browser, Node.js, and Cloudflare Workers without any build step
- Add package.json with `"type": "module"` and npm-style exports map
- Add MCP server with 8 AI-callable tools for chess analysis
- All 70 variants produce legal moves in Node.js without browser globals

#### 2026-06-09
- Add animation style selector: slide, arc, bounce, warp (toolbar dropdown)
- Add animation speed selector: slow (400ms), normal (200ms), fast (100ms), instant (toolbar dropdown)
- Fix human move animations not playing (render was being destroyed before animation completed)
- Add fullscreen mode: board-only viewport view via `?mode=fullscreen` or toolbar button
- Add piece colour styles: auto, gold, charcoal, burgundy, navy (recolours SVG pieces at render time)
- Add toolbar above board: theme selector, piece style selector, fullscreen button
- Restructure controls bar: game actions (Flip, Undo, New Game) left, AI difficulty right
- Rename AI difficulty labels to Elo-style: Novice (~600), Club (~1000), Intermediate (~1200), Advanced (~1400), Expert (~1600)
- Add URL persistence for theme, piece style, and animation preferences
- Update API docs with piece styles, animation styles, fullscreen mode, and URL parameter reference

#### 2026-06-06 (v0.7.1)
- Fix basePath selector: match game-controller.js not game-controller-core.js (broke live play page)
- Fix variant URL param validation: check registry instead of hardcoded subset (fixes embed for 32 variants)
- Remove hardcoded DESCRIPTIONS and VARIANT_GROUPS; all variant metadata now derived from plugin registry
- Add URL update on variant switch (refresh/share preserves selection)
- Update docs hub variant table from 54 to 70
- Improve transparent theme contrast: use grey-based rgba instead of white-based
- Bump cache-busting strings to v0.7.1

#### 2026-06-02
- Add renderBoard hooks: excludePieces array, suppressHighlights, legalMoveRenderer
- Add tilePainter transform positioning (supports `<g>` elements)
- Add excludePiece option to hide pieces during animation
- Add game controller extensions: customRender, onSquareClick hook, interaction API
- Add unit template system for config-driven piece registration
- Migrate opening books into variant plugins (openingBook config property)
- Add opening books for 18 new variants (26 total, up from 8)
- New docs: Dungeon Chess integration guide, expanded API reference (controller callbacks, unit templates, terrain predicates)
- Homepage: add "Build with MCE" consumer section with DC showcase
- Add effect lifecycle hooks, controller callbacks, renderer extensions
- Add generic terrain predicate system (replaces hardcoded water checks)
- Add genJumps waterBlock boolean parameter
- Fix handleAIResult to schedule next AI move in multi-player games

#### 2026-06-01 (v0.7.0)
- Add custom positionKey hook for pieceData-based games (#75)
- Add multi-step turns via pendingAction pattern (#74, #78)
- Add board renderer extension points: tilePainter, pieceProvider, afterRender (#76, #79-81)
- Extract reusable MCE.createGameController() module (#77, #82)
- Add MCE.createReplay() for move-by-move playback (#83)
- All DC decoupling blockers resolved (dungeon-chess#40 Phases 2-6 unblocked)
- Bump to v0.7.0

#### 2026-06-01
- Add Tier 3 engine subsystems: effects system, action moves, capture interception, board mutations (#59-#63)
- Add 4 new Tier 3 variants (68 total): Crazyhouse, Recruitment Chess, Teleportation Chess, Poison Chess
- Add AI difficulty levels (beginner through expert) with time-based iterative deepening
- Add search optimisations: move ordering, quiescence search, transposition table, Web Worker
- Add variant-aware AI evaluation for 21 variants (custom evaluators per plugin)
- Add piece-square tables to default evaluator (positional knowledge for all variants)
- Fix AI move generation to use variantLegalMoves for all moveFilter variants
- Refactor Einstein, Benedict, Andernach to use mutateBoard() helper
- Add Medusa Chess and Immunization Chess (70 total)
- Add opening book system for 8 variants (instant response in known positions)
- Add 3 developer guides (Orda, Crazyhouse, Poison) covering all hooks
- Restructure guide page as hub with decision table
- Bump to v0.6.16

#### 2026-05-31
- Add postMessage embed API: `chess:setVariant`, `chess:setTheme`, `chess:setBg`, `chess:newGame` (#65)
- Add transparent theme for seamless embedding on any background (#64)
- Bump to v0.6.9

#### 2026-05-28
- Add Tier 2 engine extensions: wrap-around geometry, promotionRank, divergent movement, post-move transformation, displacement moves
- Add 9 new variants (64 total): Cylinder, Toroidal, Berolina, Legan, Hoppel-Poppel, Makruk, Orda, Einstein, Displacement
- Add Shatar (Mongolian Chess) variant — bare king win condition
- Sort all variant listings alphabetically within categories (#52)
- Add "For Developers" section with tabbed code examples and "Moddable Engines" sister project section to homepage
- Add hero parallax effect (title lag, button fade, glow drift)
- Fix section colour contrast: dark dev section, mid-tone engines section
- Consolidate `text-wrap: pretty` into shared.css (DRY)

#### 2026-05-27
- Add 15 Tier 1 plugin-ready variants (54 at this point): Half Chess, Diana, Petty, Omnicide, Dark Chess, Berserk, Benedict, Andernach, Grid, Checkless, No Retreat, Weak!, Patrol, Madrasi, Dice
- Complete plugin architecture migration: all variants are now self-contained plugin files using `MCE.registerVariant()`
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
