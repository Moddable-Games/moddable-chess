# Board Generation Pipeline

Static SVG board diagram generator for all games in `moddable-rules`. Produces self-contained SVG files used as illustrations in rulebooks.

## Quick Start

```bash
node scripts/generate-rules-boards.js
```

Generates diagrams into `../moddable-rules/games/<family>/diagrams/svg/`. Requires the `moddable-rules` repo as a sibling directory.

## Architecture

```
scripts/generate-rules-boards.js    Orchestration script (reads variants, calls renderer)
js/svg-renderer.js                  Core renderer (layout, labels, piece placement)
js/svg-providers/                   Board style providers (geometry + drawing)
js/svg-pieces.js                    Chess piece SVG definitions (from assets/pieces.svg)
assets/pieces.svg                   Single source of truth for all chess piece glyphs
```

### Data Flow

1. Generator reads variant plugin files to extract FEN, dimensions, and slug
2. For each variant, it calls `renderBoardSVG()` with a board style and position
3. The renderer delegates geometry to the matching provider
4. Provider draws the board (squares, lines, intersections, terrain)
5. Renderer overlays pieces from the position data
6. Output is a self-contained SVG string written to disk

## Board Styles (Providers)

Each provider implements `computeLayout()`, `renderBoard()`, and optional `renderPiece()`.

| Provider | Style | Position Type | Used By |
|----------|-------|---------------|---------|
| `checkered` | Alternating light/dark squares | `square` | Chess (74 variants), Dungeon Chess |
| `mono-grid` | Single colour with grid lines | `square` | Turkish Draughts |
| `alquerque` | Intersection points with diagonal lines | `intersection` | Fanorona, Alquerque |
| `go` | Intersection grid with star points | `intersection` | Go (9x9, 13x13, 19x19) |
| `morris` | Concentric rings with connecting lines | `node` | Nine Men's Morris (7 variants) |
| `dungeon` | Terrain-driven map with void/water/spawn zones | `square` | Dungeon Chess |
| `royal-ur` | Fixed asymmetric layout with rosettes | `square` | Royal Game of Ur |
| `xiangqi` | 9x10 intersection grid with river and palace | `intersection` | Xiangqi (Chinese Chess) |
| `shogi` | 9x9 grid with promotion zone shading | `square` | Shogi (Japanese Chess) |

### Position Types

- **`square`** — Pieces occupy the centre of tiles. Standard chess-style.
- **`intersection`** — Pieces sit on line intersections. Go/Xiangqi-style.
- **`node`** — Pieces sit on specific graph nodes. Morris-style.

## Piece Rendering Systems

| System | Source File | Used By |
|--------|------------|---------|
| Chess pieces (standard + fairy) | `js/svg-pieces.js` sourced from `assets/pieces.svg` | All chess variants |
| Draughts pieces | Inline (circles + crowns) | Draughts family |
| Go stones | Inline (filled circles) | Go family |
| Xiangqi (traditional) | `assets/pieces-xiangqi-trad.svg` | Xiangqi |
| Xiangqi (western) | `assets/pieces-xiangqi-west.svg` | Xiangqi (alternative) |
| Shogi (kanji) | `assets/pieces-shogi.svg` | Shogi family |

### Chess Piece Registry

`svg-pieces.js` exports uppercase (white) and lowercase (black) glyphs for:
- Standard: K, Q, R, B, N, P
- Fairy: A (Archbishop), C (Chancellor), M (Maharaja), S (Sage), F (Fers), G (Guard), Y (Yurt), L (Lancer), H (Archer), E (Elephant)

All glyphs are designed on a 45x45 viewBox and rendered at the provider's tile size.

## Adding a New Board Style

1. Create `js/svg-providers/my-style.js`:

```javascript
export const myStyle = {
  name: 'my-style',
  positionType: 'square',     // or 'intersection' / 'node'
  labelStyle: 'algebraic',    // or 'none'

  computeLayout({ rows, cols, tileSize }) {
    return { boardW: cols * tileSize, boardH: rows * tileSize };
  },

  renderBoard({ rows, cols, tileSize, colors, layout }) {
    let svg = '';
    // Draw tiles, lines, decorations...
    return svg;
  },

  // Optional: override piece placement coordinates
  piecePosition(row, col, tileSize, layout) {
    return { x: col * tileSize, y: row * tileSize };
  },
};
```

2. Register in `js/svg-providers/index.js`:

```javascript
import { myStyle } from './my-style.js';
// Add to exports:
'my-style': myStyle,
```

3. Add a section in `scripts/generate-rules-boards.js` that calls `renderBoardSVG()` with your style.

## Adding a New Piece Set

1. Create an SVG sprite sheet (e.g. `assets/pieces-my-game.svg`) with one `<symbol id="piece-X">` per piece type, designed on a 45x45 viewBox.

2. Create a JS export file that maps piece characters to SVG markup:

```javascript
export const MY_PIECES = {
  W: `<g>...</g>`,   // white piece
  w: `<g>...</g>`,   // black equivalent
};
```

3. In the generator, pass pieces to `renderBoardSVG()` via the `position` object:

```javascript
// Square-based: position['e4'] = 'K' (chess char)
// Object-based: position['e4'] = { type: 'man', color: 'white' }
```

The renderer checks piece type: if it's a single character, it looks up `CHESS_PIECES`. If it's an object, the provider handles rendering via `renderPiece()`.

## Generator Sections

The generator processes game families in order:

1. **Chess** — Auto-discovers from `js/variants/*.js` plugin files. Extracts FEN, rows, cols via regex. Falls back to `MANUAL_CHESS_VARIANTS` for variants without plugins.
2. **Draughts** — Hardcoded configs for 8 variants with piece placement rules.
3. **Go** — Three board sizes (9, 13, 19) with star point placement.
4. **Morris** — 7 variants configured by ring count and diagonal presence.
5. **Dungeon Chess** — Reads map data from `../dungeon-chess/data/maps.json`.
6. **Royal Ur** — Single fixed board layout.
7. **Xiangqi** — River, palace, and piece placement from FEN.
8. **Shogi** — Promotion zones, kanji piece rendering.

## Relationship to moddable-rules

This generator lives in `moddable-chess` but produces output consumed by `moddable-rules`:

- **moddable-chess** owns the rendering code (providers, piece sprites, renderer)
- **moddable-rules** owns the output directory and references SVGs in rulebook markdown via `{{svg:filename.svg "caption"}}`
- The generator reads variant data from moddable-chess plugins and writes SVGs into moddable-rules diagrams folders

This means moddable-chess is a build-time dependency of moddable-rules for diagram generation, but moddable-rules has no runtime dependency on moddable-chess.
