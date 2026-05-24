# Moddable Chess

Modular chess engine with variant support. Zero dependencies, pure JavaScript, no build step.

---

### Stack

```
HTML + Vanilla JS + Zero dependencies + Zero build step
```

---

### Architecture

```
moddable-chess/
├── index.html              ← Test/demo page
├── css/
│   └── style.css           ← Minimal demo styles
├── js/
│   ├── chess-engine.js     ← Core: board state, FEN, coordinate helpers
│   ├── chess-moves.js      ← Move generation: pseudo-legal + legal moves
│   ├── chess-play.js       ← Make/unmake moves, game status detection
│   ├── chess-variants.js   ← Variant rule modifiers (composable flags)
│   ├── board-renderer.js   ← SVG board renderer (8×8)
│   └── game-controller.js  ← Demo: wires engine to renderer
└── assets/
    └── pieces.svg          ← Cburnett piece sprites (CC BY-SA 3.0)
```

---

### Variants

| Status | Variant | Key rule |
|--------|---------|----------|
| Done | Regular Chess | Standard FIDE rules |
| Done | King of the Hill | King reaches centre = win |
| Done | Three-Check | 3 checks = win |
| Done | Antichess | Forced captures, lose all pieces = win |
| Done | Racing Kings | No checks, king to 8th rank = win |
| Planned | Fog of War | Only see squares you attack |
| Planned | Atomic | Captures explode adjacent pieces |
| Planned | Duck Chess | Place blocker after each move |
| Planned | Rifle Chess | Capturing piece stays put |
| Planned | Marseillais | Two moves per turn |
| Planned | Fischer Random | Randomised back rank (960 positions) |
| Issue | 4-Player Chess | 14×14 cross board |
| Issue | Hexagonal (Glinski) | 91 hex tiles |
| Issue | Crazyhouse | Captured pieces can be dropped |
| Issue | Capablanca | 10×8 board + 2 new pieces |

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

### License

MIT
