import MCE from '../js/chess-engine.js';
import '../js/chess-moves.js';
import '../js/chess-play.js';
import '../js/chess-variants.js';
import '../js/chess-units.js';
import '../js/chess-ai.js';
import '../js/variants/index.js';
import { renderSvg } from '../js/chess-svg.js';

export const TOOLS = [
  {
    name: 'chess_list_variants',
    description: 'List all available chess variants with their descriptions, board sizes, and rules.',
    inputSchema: {
      type: 'object',
      properties: {
        group: {
          type: 'string',
          description: 'Filter by group name (Classic, Tactical, Alternate Rules, Asymmetric, Small Boards, Large Boards). Omit for all.',
        },
      },
    },
  },
  {
    name: 'chess_get_legal_moves',
    description: 'Get all legal moves for the current position. Returns moves in algebraic notation with annotations (capture, promotion, castling, etc).',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key (e.g. "standard", "atomic", "capablanca"). Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'FEN string of the position. Omit to use the variant starting position.',
        },
      },
    },
  },
  {
    name: 'chess_analyze_position',
    description: 'Evaluate a chess position using the engine. Returns a score (centipawns from the side to move), best move, and the principal variation.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key. Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'FEN string. Omit for starting position.',
        },
        depth: {
          type: 'number',
          description: 'Search depth (1-6). Higher is slower but more accurate. Defaults to 4.',
        },
      },
    },
  },
  {
    name: 'chess_validate_move',
    description: 'Check whether a specific move is legal in the current position. Returns legal/illegal with explanation.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key. Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'FEN string. Omit for starting position.',
        },
        move: {
          type: 'string',
          description: 'Move in coordinate notation (e.g. "e2e4", "e7e8q" for promotion).',
        },
      },
      required: ['move'],
    },
  },
  {
    name: 'chess_make_moves',
    description: 'Play a sequence of moves from a position and return the resulting FEN, game status, and move list.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key. Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'Starting FEN. Omit for variant start position.',
        },
        moves: {
          type: 'array',
          items: { type: 'string' },
          description: 'Moves in coordinate notation (e.g. ["e2e4", "e7e5", "g1f3"]).',
        },
      },
      required: ['moves'],
    },
  },
  {
    name: 'chess_get_opening_book',
    description: 'Look up opening book moves for a position. Returns known good continuations from the variant opening book.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key. Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'FEN string. Omit for starting position.',
        },
      },
    },
  },
  {
    name: 'chess_generate_puzzle',
    description: 'Generate a chess puzzle (mate-in-N or tactical sequence). Returns a FEN position and the solution moves.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key. Defaults to "standard".',
        },
        type: {
          type: 'string',
          enum: ['mate-in-1', 'mate-in-2', 'tactics'],
          description: 'Puzzle type. Defaults to "mate-in-1".',
        },
      },
    },
  },
  {
    name: 'chess_render_svg',
    description: 'Render a board position as a self-contained SVG string. No DOM or browser APIs required. Works in Cloudflare Workers.',
    inputSchema: {
      type: 'object',
      properties: {
        variant: {
          type: 'string',
          description: 'Variant key (e.g. "standard", "grand", "capablanca"). Defaults to "standard".',
        },
        fen: {
          type: 'string',
          description: 'FEN string of the position. Omit to use the variant starting position.',
        },
        theme: {
          type: 'string',
          enum: ['classic', 'cosmic', 'wood', 'marble', 'neon', 'minimal'],
          description: 'Board colour theme. Defaults to "classic".',
        },
        highlights: {
          type: 'array',
          items: { type: 'string' },
          description: 'Squares to highlight (algebraic notation, e.g. ["e2", "e4"] for last move).',
        },
        size: {
          type: 'number',
          description: 'Board width in pixels. Height is derived from rows. Defaults to 480.',
        },
      },
    },
  },
];

export function handleToolCall(name, args) {
  switch (name) {
    case 'chess_list_variants': return listVariants(args);
    case 'chess_get_legal_moves': return getLegalMoves(args);
    case 'chess_analyze_position': return analyzePosition(args);
    case 'chess_validate_move': return validateMove(args);
    case 'chess_make_moves': return makeMoves(args);
    case 'chess_get_opening_book': return getOpeningBook(args);
    case 'chess_generate_puzzle': return generatePuzzle(args);
    case 'chess_render_svg': return renderBoard(args);
    default: return { error: `Unknown tool: ${name}` };
  }
}

function listVariants(args) {
  const filterGroup = args && args.group;
  const results = [];
  for (const [key, vc] of Object.entries(MCE.variantRegistry)) {
    if (filterGroup && vc.group !== filterGroup) continue;
    results.push({
      key,
      label: vc.label || key,
      group: vc.group || 'Plugins',
      board: `${vc.rows || 8}x${vc.cols || 8}`,
      title: vc.title || null,
      description: vc.description || null,
      rule: vc.rule || null,
    });
  }
  results.sort((a, b) => a.label.localeCompare(b.label));
  return { variants: results, count: results.length };
}

function createGameFromArgs(args) {
  const variant = (args && args.variant) || 'standard';
  if (!MCE.getVariantConfig(variant)) {
    return { error: `Unknown variant: "${variant}". Use chess_list_variants to see available options.` };
  }
  const game = MCE.createGame(variant);
  if (args && args.fen) {
    MCE.loadFEN(game, args.fen);
  }
  return { game, variant };
}

function moveToAlgebraic(m, game) {
  const from = MCE.sqToAlgebraic(m.from, game);
  const to = MCE.sqToAlgebraic(m.to, game);
  let notation = from + to;
  if (m.promo) notation += m.promo;
  return notation;
}

function getLegalMoves(args) {
  const result = createGameFromArgs(args);
  if (result.error) return result;
  const { game, variant } = result;

  const vc = MCE.getVariantConfig(variant);
  const moves = (vc && vc.moveFilter) ? MCE.variantLegalMoves(game) : MCE.legalMoves(game);

  const annotated = moves.map(m => {
    const entry = { move: moveToAlgebraic(m, game) };
    if (m.flag === 'capture' || m.flag === 'ep') entry.type = 'capture';
    else if (m.flag === 'castle-k') entry.type = 'kingside-castle';
    else if (m.flag === 'castle-q') entry.type = 'queenside-castle';
    else if (m.flag === 'promo') entry.type = 'promotion';
    else if (m.flag === 'action') entry.type = 'action';
    else entry.type = 'quiet';
    return entry;
  });

  return {
    fen: MCE.toFEN(game),
    turn: game.turn === MCE.WHITE ? 'white' : 'black',
    moveCount: annotated.length,
    moves: annotated,
  };
}

function analyzePosition(args) {
  const result = createGameFromArgs(args);
  if (result.error) return result;
  const { game, variant } = result;

  const depth = Math.min(Math.max((args && args.depth) || 4, 1), 6);
  const timeMs = depth * 500;

  const move = MCE.aiPickMove(game, null, { timeMs });
  if (!move) {
    const status = MCE.getStatus(game);
    return { fen: MCE.toFEN(game), status, evaluation: null, bestMove: null };
  }

  const undo = MCE.makeMove(game, move);
  const line = [moveToAlgebraic(move, game)];

  for (let i = 1; i < depth; i++) {
    const next = MCE.aiPickMove(game, null, { timeMs: 200 });
    if (!next) break;
    line.push(moveToAlgebraic(next, game));
    MCE.makeMove(game, next);
  }

  return {
    fen: (args && args.fen) || MCE.toFEN(createGameFromArgs(args).game),
    turn: game.turn === MCE.WHITE ? 'black' : 'white',
    bestMove: line[0],
    principalVariation: line,
    depth,
  };
}

function validateMove(args) {
  if (!args || !args.move) return { error: 'move parameter is required' };

  const result = createGameFromArgs(args);
  if (result.error) return result;
  const { game, variant } = result;

  const notation = args.move;
  const fromCol = notation.charCodeAt(0) - 97;
  const fromRow = game.rows - parseInt(notation[1]);
  const toCol = notation.charCodeAt(2) - 97;
  const toRow = game.rows - parseInt(notation[3]);
  const promo = notation.length > 4 ? notation[4] : null;

  const from = MCE.sq(fromRow, fromCol, game);
  const to = MCE.sq(toRow, toCol, game);

  const vc = MCE.getVariantConfig(variant);
  const moves = (vc && vc.moveFilter) ? MCE.variantLegalMoves(game) : MCE.legalMoves(game);

  const match = moves.find(m => {
    if (m.from !== from || m.to !== to) return false;
    if (promo && m.promo !== promo) return false;
    if (!promo && m.promo) return false;
    return true;
  });

  if (match) {
    return {
      legal: true,
      move: moveToAlgebraic(match, game),
      type: match.flag || 'quiet',
      fen: MCE.toFEN(game),
    };
  }

  const piece = game.board[from];
  if (!piece) {
    return { legal: false, reason: `No piece on ${notation.slice(0, 2)}.` };
  }
  if (MCE.pieceColor(piece) !== game.turn) {
    return { legal: false, reason: `It is ${game.turn === MCE.WHITE ? 'white' : 'black'}'s turn, but the piece on ${notation.slice(0, 2)} belongs to ${MCE.pieceColor(piece) === MCE.WHITE ? 'white' : 'black'}.` };
  }

  const pieceMoves = moves.filter(m => m.from === from);
  if (pieceMoves.length === 0) {
    return { legal: false, reason: `The piece on ${notation.slice(0, 2)} has no legal moves (may be pinned or blocked).` };
  }

  return { legal: false, reason: `The piece on ${notation.slice(0, 2)} cannot move to ${notation.slice(2, 4)}. It has ${pieceMoves.length} legal moves available.` };
}

function makeMoves(args) {
  if (!args || !args.moves || !Array.isArray(args.moves)) {
    return { error: 'moves parameter is required (array of strings)' };
  }

  const result = createGameFromArgs(args);
  if (result.error) return result;
  const { game, variant } = result;

  const played = [];
  for (let i = 0; i < args.moves.length; i++) {
    const notation = args.moves[i];
    const fromCol = notation.charCodeAt(0) - 97;
    const fromRow = game.rows - parseInt(notation[1]);
    const toCol = notation.charCodeAt(2) - 97;
    const toRow = game.rows - parseInt(notation[3]);
    const promo = notation.length > 4 ? notation[4] : null;

    const from = MCE.sq(fromRow, fromCol, game);
    const to = MCE.sq(toRow, toCol, game);

    const vc = MCE.getVariantConfig(variant);
    const moves = (vc && vc.moveFilter) ? MCE.variantLegalMoves(game) : MCE.legalMoves(game);

    const match = moves.find(m => {
      if (m.from !== from || m.to !== to) return false;
      if (promo && m.promo !== promo) return false;
      if (!promo && m.promo) return false;
      return true;
    });

    if (!match) {
      return {
        error: `Illegal move "${notation}" at position ${i + 1}`,
        playedSoFar: played,
        fenAtError: MCE.toFEN(game),
      };
    }

    MCE.makeMove(game, match);
    played.push(notation);

    const status = MCE.getStatus(game);
    if (status !== 'active' && status !== 'check') {
      return {
        fen: MCE.toFEN(game),
        status,
        turn: game.turn === MCE.WHITE ? 'white' : 'black',
        movesPlayed: played,
        gameOver: true,
      };
    }
  }

  return {
    fen: MCE.toFEN(game),
    status: MCE.getStatus(game),
    turn: game.turn === MCE.WHITE ? 'white' : 'black',
    movesPlayed: played,
    gameOver: false,
  };
}

function getOpeningBook(args) {
  const result = createGameFromArgs(args);
  if (result.error) return result;
  const { game, variant } = result;

  const vc = MCE.getVariantConfig(variant);
  const key = MCE.positionKey(game);

  if (vc && vc.openingBook && vc.openingBook[key]) {
    return {
      position: key,
      variant,
      moves: vc.openingBook[key],
      source: 'variant-book',
    };
  }

  return {
    position: key,
    variant,
    moves: [],
    source: 'none',
    note: 'No opening book entries for this position.',
  };
}

function generatePuzzle(args) {
  const variant = (args && args.variant) || 'standard';
  const type = (args && args.type) || 'mate-in-1';

  if (!MCE.getVariantConfig(variant)) {
    return { error: `Unknown variant: "${variant}"` };
  }

  const maxAttempts = 200;
  const targetDepth = type === 'mate-in-2' ? 2 : 1;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const game = MCE.createGame(variant);
    const moveCount = 10 + Math.floor(Math.random() * 40);

    for (let i = 0; i < moveCount; i++) {
      const moves = MCE.legalMoves(game);
      if (moves.length === 0) break;
      MCE.makeMove(game, moves[Math.floor(Math.random() * moves.length)]);
      const status = MCE.getStatus(game);
      if (status !== 'active' && status !== 'check') break;
    }

    if (MCE.getStatus(game) !== 'active' && MCE.getStatus(game) !== 'check') continue;

    const solution = findMate(game, targetDepth);
    if (solution) {
      return {
        type,
        variant,
        fen: MCE.toFEN(game),
        turn: game.turn === MCE.WHITE ? 'white' : 'black',
        solution: solution.map(m => moveToAlgebraic(m, game)),
      };
    }
  }

  return {
    type,
    variant,
    error: 'Could not generate a puzzle within the attempt limit. Try again or use a different variant.',
  };
}

function renderBoard(args) {
  const variant = (args && args.variant) || 'standard';
  if (!MCE.getVariantConfig(variant) && variant !== 'standard') {
    return { error: `Unknown variant: "${variant}". Use chess_list_variants to see available options.` };
  }

  const svg = renderSvg({
    variant,
    fen: args && args.fen,
    theme: args && args.theme,
    highlights: args && args.highlights,
    size: args && args.size,
  });

  if (!svg) return { error: 'Failed to render SVG.' };

  const vc = MCE.getVariantConfig(variant);
  return {
    variant,
    board: `${(vc && vc.rows) || 8}x${(vc && vc.cols) || 8}`,
    svg,
  };
}

function findMate(game, depth) {
  const moves = MCE.legalMoves(game);
  for (const move of moves) {
    const undo = MCE.makeMove(game, move);
    const found = verifyMate(game, depth - 1);
    MCE.unmakeMove(game, undo);
    if (found) return [move, ...found];
  }
  return null;
}

function verifyMate(game, depth) {
  const status = MCE.getStatus(game);
  if (status === 'checkmate') return [];
  if (depth <= 0) return null;

  const defenderMoves = MCE.legalMoves(game);
  if (defenderMoves.length === 0) return null;

  for (const def of defenderMoves) {
    const undo = MCE.makeMove(game, def);
    const attackerMoves = MCE.legalMoves(game);
    let mateFound = false;

    for (const atk of attackerMoves) {
      const undo2 = MCE.makeMove(game, atk);
      const result = verifyMate(game, depth - 1);
      MCE.unmakeMove(game, undo2);
      if (result !== null) {
        mateFound = true;
        break;
      }
    }

    MCE.unmakeMove(game, undo);
    if (!mateFound) return null;
  }

  return [];
}
