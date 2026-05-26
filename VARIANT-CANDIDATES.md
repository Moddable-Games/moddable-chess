# Chess Variant Candidates — Master Review List

> **Purpose:** Review and approve/reject for future batches.
> **Date:** 2026-05-26 | **Implemented:** ~23 | **Candidates below:** ~100
> **Sources:** `W` Wikipedia, `CV` chessvariants.com, `Li` Lichess, `Py` PyChess, `CC` Chess.com, `FS` Fairy-Stockfish

## Priority Legend

- **P1 — Dungeon Chess needs:** Variants whose mechanics directly support DC's Phase 3 roadmap
- **P2 — Not playable online:** Variants no major platform offers (unique to MCE)
- **P3 — Novel boards/geometry:** Non-standard board sizes or multi-board setups
- **P4 — Standard competitive:** Well-known variants already playable elsewhere but expected in any variant engine
- **P5 — Niche/historical:** Interesting but low urgency

Mark each with `[YES]`, `[NO]`, or `[MAYBE]` for batch planning.

---

## P1 — DUNGEON CHESS RELEVANT

These directly support DC's Phase 3 (campaign mode, variant modes, multi-level dungeons).
DC already has: terrain, 4 factions, custom pieces, 10x10/cross boards, fog, portals, cannons.

| # | Variant | Src | Complexity | DC Relevance | Description |
|---|---------|-----|-----------|--------------|-------------|
| 1 | **Crazyhouse (full)** | W,Li,Py,CC,FS | Medium | Piece drops = treasure chests spawning units | Captured pieces switch colour, can be dropped on empty squares |
| 2 | **Portal Chess** | CV | Medium | DC already has portal terrain visually | Linked portal square pairs — enter one, exit the other |
| 3 | **Minefield Chess** | CV | Medium | Hidden dungeon traps | Random hidden mines destroy pieces that step on them |
| 4 | **Placement Chess** | W,Py,FS | Medium | Maps to XP-based team drafting phase | Place back-rank pieces before the game begins |
| 5 | **Absorption Chess** | CV | Medium | Loot/power-up: units gain captured unit's moves | Capturing piece permanently gains victim's movement |
| 6 | **Charged Chess** | CV | Medium | RPG progression: kills grant power | Pieces gain "charge" on capture → bonus move next turn |
| 7 | **Cheshire Cat Chess** | CV | Medium | Collapsing dungeon rooms | Squares disappear after being vacated — board shrinks |
| 8 | **Ice Age Chess** | CV | Medium | Dungeon hazards (frozen zones) | Random squares freeze each turn, trapping pieces |
| 9 | **Gravity Chess** | CV | Medium | Pit traps / falling mechanic | Pieces fall "down" after moving (Connect-4 physics) |
| 10 | **Recon Chess** | CV | Medium | Scouting in dim dungeon light | Fog of war + scan a 3x3 area before each move |
| 11 | **Alice Chess** | W,CV,Py,FS | Medium-High | Multi-level dungeon (upper/lower) | Two boards — pieces transfer to other board after moving |
| 12 | **Avalanche Chess** | CV | Medium | Environmental hazard pushing units forward | After your move, must push one opponent's pawn forward |
| 13 | **Zombie Chess** | CV | Low | Undead faction thematic (units revive) | Captured pawns respawn on starting square each turn |
| 14 | **Benedict Chess** | W,CV | Medium | Mind control / corruption mechanic | Pieces "convert" enemies they see to your colour instead of capturing |
| 15 | **Circe Chess** | W,CV | Medium | Respawn mechanic for dungeon battles | Captured pieces reborn on their starting square (if empty) |
| 16 | **Andernach Chess** | W,CV | Medium | Faction-switching / betrayal mechanic | Capturing piece changes colour (joins enemy) |
| 17 | **Einstein Chess** | W,CV | Medium | Equipment degradation / power-up theme | Pieces demote on move, promote on capture (Q→R→B→N→P / reverse) |

---

## P2 — NOT PLAYABLE ONLINE (Unique to MCE)

Not available on Lichess, Chess.com, or PyChess. These would differentiate MCE.

| # | Variant | Src | Complexity | Description |
|---|---------|-----|-----------|-------------|
| 18 | ~~Rifle Chess~~ | CV | Done | *(Already implemented)* |
| 19 | **Grid Chess** | CV | Low | Invisible 4x4 grid overlay; moves must cross a grid line |
| 20 | **Patrol Chess** | W,CV | Medium | Pieces can only capture when defended by a friendly piece |
| 21 | **Madrasi Chess** | W,CV | Medium | Same-type opposing pieces paralyze each other on mutual attack |
| 22 | **Checkless Chess** | CV,FS | Low | Cannot give check unless it's checkmate |
| 23 | **Berolina Chess** | W,CV,FS | Low | Pawns move diagonally, capture straight (inverted) |
| 24 | **Legan Chess** | CV | Low | Pawns move diagonal-forward, capture straight-forward |
| 25 | **No Retreat** | CV | Low | Pieces can never move backward toward own starting rank |
| 26 | **Self-Capture Chess** | CV | Low | Can capture your own pieces (removing them) |
| 27 | **Displacement Chess** | W,CV | Low | Swap positions with an adjacent friendly piece |
| 28 | **Berserk Chess** | CV | Low | Delivering check grants an extra move |
| 29 | **Omnicide Chess** | CV | Low | Lose all pieces to win (like Antichess but captures NOT forced) |
| 30 | **Weak!** | W,CV | Low | Weakest piece must move first if possible |
| 31 | **Refusal Chess** | CV | Medium | Opponent can reject your move once, forcing another |
| 32 | **Dynamo Chess** | CV | High | Push/pull opponent's pieces instead of normal moves |
| 33 | **Anti-King Chess** | CV,FS | Medium | Second king-like piece that MUST stay in check or you lose |
| 34 | **Knight Relay** | CV | Medium | Knights grant adjacent friendlies knight-movement ability |
| 35 | **Cylinder Chess** | W,CV | Medium | Files a/h wrap around — pieces slide off one edge onto the other |
| 36 | **Toroidal Chess** | W,CV | Medium | Both ranks AND files wrap — no board edges at all |
| 37 | **Ultima (Baroque)** | W,CV | High | 6 piece types each with unique capture method (freeze, coordinate, withdraw, leap) |
| 38 | **Synchronous Chess** | CV | High | Both players choose simultaneously, then resolve conflicts |

---

## P3 — NOVEL BOARD SIZES & MULTI-BOARD

Non-8x8 boards, multi-board games, or unusual geometries not already in MCE.
MCE already supports: 7x7, 8x8, 10x8, 10x10, 12x8.

| # | Variant | Src | Complexity | Board | Description |
|---|---------|-----|-----------|-------|-------------|
| 39 | **Alice Chess** | W,CV,Py,FS | Medium-High | 8x8 x2 | Two boards — pieces transfer after each move *(see also P1 #11)* |
| 40 | **Gardner's Minichess** | CV,FS | Low | 5x5 | Full piece types on tiny board. Fast and tactical |
| 41 | **Los Alamos Chess** | W,CV,FS | Low | 6x6 | No bishops, no castling, no double-step. First computer chess (1956) |
| 42 | **Half Chess** | CV | Low | 4x8 | Half-width board, reduced army |
| 43 | **Diana Chess** | CV | Low | 6x6 | One bishop, one knight per side |
| 44 | **Petty Chess** | CV | Low | 5x6 | Compact variant with full tactics |
| 45 | **Wildebeest Chess** | W,CV,FS | Medium | 11x10 | Adds Camel (3,1) and Wildebeest (Camel+Knight) |
| 46 | **Omega Chess** | W,CV | High | 10x10+4 corners | 104 squares total, Champion + Wizard pieces |
| 47 | **Gross Chess** | CV,FS | High | 12x12 | 12 piece types including nightrider, grasshopper, cannon |
| 48 | **Xiangqi** | W,CV,Py,FS | High | 9x10 | Chinese Chess — river, palace, cannons, elephants |
| 49 | **Shogi** | W,CV,Py,FS | High | 9x9 | Japanese Chess — drops, promotion zone, 8 piece types |
| 50 | **Janggi** | W,CV,Py,FS | High | 9x10 | Korean Chess — no river, different elephant, passing |
| 51 | **Minishogi** | W,CV,Py,FS | Medium | 5x5 | Small Shogi with drops and promotion |
| 52 | **Dobutsu Shogi** | W,CV,Py,FS | Low | 3x4 | Animal chess for beginners — 4 piece types, drops |
| 53 | **Kyoto Shogi** | W,Py,FS | Medium | 5x5 | Pieces flip between two forms each move |
| 54 | **Tori Shogi** | W,Py,FS | Medium | 7x7 | Bird-themed Shogi variant |
| 55 | **Minixiangqi** | Py,FS | Medium | 7x7 | Small Chinese Chess |
| ~~56~~ | ~~Glinski's Hex Chess~~ | W,CV | Very High | 91 hexagons | **REJECTED** — requires non-rectangular renderer |
| ~~57~~ | ~~Circular Chess~~ | W,CV | Very High | 4 rings x 16 | **REJECTED** — requires non-rectangular renderer |
| 58 | **Raumschach (3D)** | W,CV,FS | Very High | 5x5x5 | Three-dimensional chess with unicorn piece |
| 59 | **Dragonchess** | W,CV | Very High | 8x8 x3 levels | Gary Gygax's three-level variant (air/ground/underground) |
| 60 | **Chess on a Really Big Board** | CV | High | 16x16 | Six fairy pieces, massive tactical space |

---

## P4 — STANDARD COMPETITIVE (Already playable online)

Well-known variants available on Lichess/Chess.com/PyChess. Expected in a comprehensive engine.
Lower priority since players can already access them, but good for completeness.

| # | Variant | Src | Complexity | Available on | Description |
|---|---------|-----|-----------|-------------|-------------|
| 61 | **Crazyhouse** | W,Li,Py,CC,FS | Medium | Li, Py, CC | Captured pieces drop *(see also P1 #1)* |
| 62 | **Bughouse** | W,CV,Py,CC,FS | Very High | Py, CC | 2v2 team, pass captures to partner — needs networking |
| 63 | **4-Player Chess** | W,CC | High | CC | Cross-shaped board, FFA or teams |
| 64 | **Placement Chess** | Py,FS | Medium | Py | Place back-rank pieces before play (also in P1) |
| 65 | **Shatranj** | W,CV,Py,FS | Low | Py | Medieval chess — fers + alfil instead of queen + bishop |
| 66 | **Seirawan Chess** | W,Py,FS | High | Py | Gate Archbishop/Chancellor when back-rank pieces first move |
| 67 | **Orda Chess** | Py | Medium | Py | Asymmetric Mongol army vs standard chess |
| 68 | **Spartan Chess** | CV,Py,FS | High | Py | 2 kings + unique pieces vs standard army |
| 69 | **Shogun Chess** | Py | Medium | Py | Pieces promote to compounds; captured promoted pieces drop |
| 70 | **Hoppel-Poppel** | Py,FS | Low | Py | Knights capture like bishops, bishops capture like knights |
| 71 | **Shako** | CV,Py,FS | Medium | Py | 10x10 with cannons and elephants from Xiangqi |
| 72 | **Makpong** | Py,FS | Trivial | Py | Makruk variant — king can't move out of check |
| 73 | **Sittuyin** | W,Py,FS | Medium | Py | Burmese chess — placement phase, restricted promotion |

---

## P5 — NICHE, HISTORICAL & LOW-PRIORITY

Interesting variants but low urgency — either obscure, extremely complex, or not widely demanded.

### Quick-implement rule tweaks (trivial/low)

| # | Variant | Src | Complexity | Description |
|---|---------|-----|-----------|-------------|
| 74 | **Giveaway** | W,CV,FS | Trivial | Antichess with stalemate = loss (not win) |
| 75 | **Suicide Chess** | W,CV,FS | Trivial | Antichess with stalemate = draw |
| 76 | **Chigorin** | W,FS | Trivial | White: knights for bishops. Black: bishops for knights |
| 77 | **Upside-Down** | W,CV | Trivial | Pieces start on opponent's rank |
| 78 | **Peasants' Revolt** | W,CV,FS | Trivial | King + 8 pawns vs King + 4 knights |
| 79 | **Pawns Only** | CV,FS | Trivial | Just pawns — first promotion wins |
| 80 | **Single-Check** | FS | Trivial | One check wins |
| 81 | **Five-Check** | FS | Trivial | Five checks wins |
| 82 | **Transcendental** | W,CV,FS | Trivial | Chess960 but non-mirrored |
| 83 | **Stalemate = Win** | CV | Trivial | Stalemating your opponent wins |
| 84 | **Almost Chess** | FS | Trivial | One queen replaced by chancellor |
| 85 | **Amazon Chess** | W,CV,FS | Trivial | Both sides get Q+N compound instead of queen |
| 86 | **Codrus** | FS | Trivial | Lose your king to win |
| 87 | **Endgame Chess** | W | Trivial | Start with only pawns + kings |
| 88 | **Coregal** | FS | Low | Queen is also royal |
| 89 | **Kinglet** | FS | Low | All pieces are royal |
| 90 | **Pawn Sideways** | CV | Low | Pawns can also move one square sideways |
| 91 | **Backwards Chess** | CV | Low | Pawns move toward own back rank |
| 92 | **Swap Chess** | CV | Low | Swap positions with adjacent friendly piece |
| 93 | **Take-All Chess** | W,CV | Low | Capture all enemy pieces (including king) to win |
| 94 | **Zombie Chess** | CV | Low | Captured pawns respawn on starting square *(see also P1 #13)* |

### New piece types (low-medium)

| # | Variant | Src | Complexity | Description |
|---|---------|-----|-----------|-------------|
| 95 | **Nightrider Chess** | W,CV,FS | Low | Extended knight — continues in L-direction until blocked |
| 96 | **Grasshopper Chess** | W,CV,FS | Medium | Piece moves along queen lines, hops over one piece, lands beyond |
| 97 | **Camel variant** | W,CV,FS | Low | (3,1) leaper — stretched knight |
| 98 | **Zebra variant** | W,CV,FS | Low | (3,2) leaper — another knight cousin |

### Historical/regional (medium-high)

| # | Variant | Src | Complexity | Description |
|---|---------|-----|-----------|-------------|
| 99 | **Tamerlane Chess** | W,CV | High | 10x11, citadels, 5+ unique medieval pieces |
| 100 | **Chu Shogi** | W,CV,FS | Very High | 12x12 with 20+ piece types and multi-move lion |
| 101 | **Shatar (Mongolian)** | W,FS | Low | Shatranj variant with bodyguard piece |
| 102 | **Ouk Chatrang** | W,Py,FS | Trivial | Cambodian chess — nearly identical to Makruk with first-move leaps |

### Exotic/impractical

| # | Variant | Src | Complexity | Description |
|---|---------|-----|-----------|-------------|
| 103 | **Kung Fu Chess** | W,CV | Very High | Real-time, no turns, piece cooldowns |
| 104 | **5D Multiverse** | W | Impossible | Time travel + parallel timelines |
| 105 | **Infinite Chess** | W | Very High | Unbounded board |
| 106 | **Penultima** | W,CV | Impossible | One player secretly defines rules, other discovers them |

---

## PIECE INVENTORY

### Currently Supported (10 piece types, 20 sprites)

| Code | Name | Movement | Used by |
|------|------|----------|---------|
| `P/p` | Pawn | Forward 1 (2 from start), capture diagonal | All standard variants |
| `N/n` | Knight | L-shape (2,1) leap | All standard; royal piece in Knightmate |
| `B/b` | Bishop | Diagonal slider | All standard |
| `R/r` | Rook | Orthogonal slider | All standard |
| `Q/q` | Queen | Orthogonal + diagonal slider | All standard |
| `K/k` | King | 1 step any direction + castling | All standard; knight-mover in Knightmate |
| `A/a` | Archbishop | Bishop + Knight compound | Capablanca, Grand |
| `C/c` | Chancellor | Rook + Knight compound | Capablanca, Grand |
| `S/s` | Sage | 1 step any direction (non-royal king) | Courier |
| `M/m` | Maharaja | Queen + Knight compound | Maharaja variant |

### New Pieces Required by Candidate Variants

| Piece | Movement | Needed for | Complexity |
|-------|----------|-----------|-----------|
| **Fers** | 1 step diagonal only | Shatranj, Sittuyin, Makruk variants | Low — like king but diagonal only |
| **Alfil** | 2-square diagonal leap (jumps over) | Shatranj | Low — simple leaper |
| **Camel** | (3,1) leap | Camel variant, Wildebeest | Low — like knight but 3,1 |
| **Zebra** | (3,2) leap | Zebra variant | Low — like knight but 3,2 |
| **Wildebeest** | Camel + Knight compound | Wildebeest Chess | Low — combine existing |
| **Nightrider** | Repeating knight in one direction | Nightrider Chess, Gross Chess | Medium — ray-based knight |
| **Grasshopper** | Queen-line hop: must jump exactly one piece, land beyond | Grasshopper Chess, Gross Chess | Medium — hop logic |
| **Cannon** | Rook movement; capture by hopping over one piece | Xiangqi, Janggi, Shako | Medium — divergent move/capture |
| **Horse (lame)** | Knight but can be blocked on intermediate square | Xiangqi, Janggi | Low — knight with blocking check |
| **Elephant (Chinese)** | 2-square diagonal (can be blocked), no river crossing | Xiangqi | Low — restricted alfil |
| **Advisor** | 1 step diagonal, confined to palace | Xiangqi, Janggi | Low — restricted fers |
| **General** | 1 step orthogonal, confined to palace | Xiangqi, Janggi | Low — restricted wazir |
| **Gold General** | Wazir + forward-diagonal | Shogi, Minishogi | Low — combined leaper |
| **Silver General** | Ferz + forward-orthogonal | Shogi, Minishogi | Low — combined leaper |
| **Lance** | Forward-only rook (slides forward, no retreat) | Shogi | Low — restricted rook |
| **Shogi Knight** | Forward-only knight (2 forward, 1 side — only 2 targets) | Shogi | Low — restricted knight |
| **Dragon King** | Rook + King (promoted rook) | Shogi | Low — already have similar |
| **Dragon Horse** | Bishop + King (promoted bishop) | Shogi | Low — already have similar |
| **Champion** | 1-2 squares orthogonal leap + 1 step diagonal | Omega Chess | Medium — multi-range |
| **Wizard** | Camel + Ferz compound | Omega Chess | Low — combine leapers |
| **Lion** | Double-move piece (can move twice per turn) | Chu Shogi | High — multi-step turn |
| **Immobiliser** | Freezes all adjacent enemy pieces (no capture) | Ultima/Baroque | High — new mechanic |
| **Withdrawer** | Captures by moving away from adjacent enemy | Ultima/Baroque | High — new capture type |
| **Coordinator** | Captures by coordinate alignment with king | Ultima/Baroque | High — geometric capture |
| **Long Leaper** | Hops over enemy piece and captures it (checker-like) | Ultima/Baroque | Medium — hop-capture |

### Piece Count Summary

- **Currently have:** 10 types (20 sprites)
- **Needed for P1 (Dungeon Chess):** 0 new sprites (mechanics-only variants)
- **Needed for P2 (Unique to MCE):** 0-2 (Anti-King reuses King sprite; Ultima needs 4-6 new)
- **Needed for P3 (Novel boards):** 8-15 (Xiangqi: 5, Shogi: 6, various leapers: 4+)
- **Needed for P4 (Standard):** 4-8 (Orda army: 4, Spartan: 5, Shatranj: 2)
- **Needed for P5 (Niche):** 2-4 (Nightrider, Grasshopper, Camel, Zebra)

### Art Asset Estimation

Each new piece type needs 2 SVG sprites (white + black). Some can share visual language:
- **Leapers** (Camel, Zebra, Wildebeest): knight-family silhouettes with variations
- **Shogi pieces**: Traditional pentagonal tokens with kanji (or simplified icons)
- **Xiangqi pieces**: Circular discs with Chinese characters (or symbolic icons)
- **Fairy pieces** (Grasshopper, Nightrider): Stylised abstract icons

**Total new sprites estimated:** ~50 (25 piece types x 2 colours) to support all candidates through P4.

---

## SOURCE SUMMARY

| Source | Variants catalogued | Live-verified? | Notes |
|--------|-------------------|----------------|-------|
| **Wikipedia** | ~80 named | Yes (fetched) | Good descriptions, historical context |
| **chessvariants.com** | 1000+ (claims 2000 pages) | Partial (Cloudflare blocks) | Most comprehensive, many obscure |
| **Lichess** | 8 | Yes (fetched) | Only popular western variants |
| **PyChess** | ~65 | Yes (fetched) | Best for Asian variants + asymmetric armies |
| **Chess.com** | 10 | Yes (fetched) | Only one with 4-player |
| **Fairy-Stockfish** | 80+ built-in | Yes (fetched) | Most powerful engine, unlimited custom via config |

---

## ENGINE FEATURES THAT UNLOCK THE MOST VARIANTS

Implementing these capabilities (in MCE) would enable multiple variants at once:

1. **Variant composition** — stack rules (Atomic + KOTH, Three-Check + Crazyhouse) → dozens of combos instantly
2. **Piece drop system** — completes Crazyhouse, enables Pocket Knight, Shogun, Loop, all Shogi family
3. **Placement phase UI** — enables Pre-Chess, Sittuyin, Musketeer (before-game piece placement)
4. **Terrain types** — portals, mines, frozen, void squares (already partially in DC, bring to MCE)
5. **Post-move transformations** — hook for "after move, change piece" → Einstein, Absorption, Shogun
6. **Colour-change mechanic** — piece switching sides → Andernach, Benedict
7. **Divergent movement** — pieces move differently than they capture → Hoppel-Poppel, Orda, Berolina
8. **Wrap-around geometry** — board edges connect → Cylinder, Toroidal
9. **Multi-board state** — two or more boards tracked simultaneously → Alice, Bughouse, Dragonchess

---

## NEXT STEPS

- [ ] User reviews this document and marks [YES] / [NO] / [MAYBE]
- [ ] Rejected variants removed; approved variants move to README "Variant Roadmap" section
- [ ] Roadmap section sits below the changelog in README — public-facing, shows what's coming
- [ ] As variants are implemented, move them from Roadmap into the main Variants list
- [ ] Approved variants grouped into implementation batches (3-5 per session)
- [ ] Engine feature priorities set based on which P1/P2 variants need them
- [ ] GitHub issues created per batch
- [ ] This file (`VARIANT-CANDIDATES.md`) remains source of truth until review is complete, then deletes
