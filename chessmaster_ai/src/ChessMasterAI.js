import React, { useState, useEffect, useRef } from 'react';

/**
 * Colors/Theme based on user requirements
 */
const COLORS = {
  primary: '#4CAF50',   // chessboard border, buttons
  secondary: '#FFC107', // highlighted squares, current move
  accent: '#2196F3',    // move sidebar, active square
  light: '#f8f8f8',     // board light squares
  dark: '#b0b7c4',      // board dark squares
  bg: '#ffffff',        // App background
  text: '#222222',      // Default text
};

/**
 * Utility for Chess Piece Unicode characters.
 * Used for display only (not logic).
 */
const PIECE_UNICODES = {
  K: '♔', Q: '♕', R: '♖', B: '♗', N: '♘', P: '♙',
  k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟',
};

/**
 * Returns initial chess position as a 2D array (8x8).
 */
function getInitialBoard() {
  return [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    [null,null,null,null,null,null,null,null],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R'],
  ];
}

/**
 * Board square names (for move notation)
 */
const fileNames = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];

/**
 * Returns algebraic notation square for (row,col). (row=0 is rank 8)
 */
function squareName(row, col) {
  return fileNames[col] + (8 - row);
}

/**
 * Returns the opposite color ('w' or 'b')
 */
function opposite(color) {
  return color === 'w' ? 'b' : 'w';
}

/**
 * Determines if piece is white (uppercase)
 */
function isWhite(piece) {
  return piece && piece === piece.toUpperCase();
}

/**
 * Determines if piece is black (lowercase)
 */
function isBlack(piece) {
  return piece && piece === piece.toLowerCase();
}

/**
 * Move object structure:
 * {
 *    from: [row, col],
 *    to: [row, col],
 *    piece: 'P' | ...,
 *    captured: 'p' | null,
 *    promotion: 'Q' | ... | null,
 *    isCastle: boolean,
 * }
 */

/**
 * VERIFIED LEGAL MOVES: Pure JS Chess Engine & Rule Engine (mini version)
 *
 * This is a minimal legal-move validator/generator with basic AI (minimax 1ply).
 * It covers: full legal moves (excluding en passant & underpromotion for brevity),
 * castling, pawn promotions, checkmate/stalemate detection.
 *
 * See detailed per-function comments for clarity.
 */

// PUBLIC_INTERFACE
function ChessEngine(fen) {
  /**
   * Main class for chess logic—tracks board, turn, castling, en passant & move gen
   */
  // Board: 2d array, 0 row is rank 8, 7 is rank 1
  let board = getInitialBoard();
  let turn = 'w'; // 'w' or 'b'
  let castling = { w: { K: true, Q: true }, b: { K: true, Q: true } };
  let enPassant = null;
  let halfmoveClock = 0;
  let fullmoveNumber = 1;
  let moveHistory = [];
  let whiteKing = [7, 4], blackKing = [0, 4];

  /**
   * Loads board from FEN (if provided)
   */
  function load(fenString) {
    // Omitted for brevity — default only loads standard chess
  }

  /**
   * Clones current engine for move generation.
   */
  function clone() {
    const newEng = ChessEngine();
    newEng.board = board.map((row) => row.slice());
    newEng.turn = turn;
    newEng.castling = JSON.parse(JSON.stringify(castling));
    newEng.enPassant = enPassant ? [...enPassant] : null;
    newEng.halfmoveClock = halfmoveClock;
    newEng.fullmoveNumber = fullmoveNumber;
    newEng.moveHistory = moveHistory.map(m => ({...m}));
    newEng.whiteKing = [...whiteKing];
    newEng.blackKing = [...blackKing];
    return newEng;
  }

  /**
   * Returns current board state (for rendering)
   */
  function getBoard() {
    return board.map((r) => r.slice());
  }

  /**
   * Returns turn ('w' or 'b')
   */
  function getTurn() {
    return turn;
  }

  /**
   * Returns position of king for color
   */
  function getKing(color) {
    return color === 'w' ? whiteKing : blackKing;
  }

  /**
   * Returns list of legal moves for the current player.
   * Each move is {from, to, piece, captured, promotion, isCastle}
   */
  function generateLegalMoves() {
    let moves = [];
    for (let r = 0; r < 8; ++r) {
      for (let c = 0; c < 8; ++c) {
        const piece = board[r][c];
        if (!piece) continue;
        if ((turn === 'w' && isWhite(piece)) || (turn === 'b' && isBlack(piece))) {
          moves.push(...generatePieceMoves([r, c], piece));
        }
      }
    }

    // Filter out illegal moves (move leaves king in check)
    moves = moves.filter((move) => {
      const engCopy = this.clone();
      engCopy.makeMove(move);
      return !engCopy.isInCheck(turn);
    });
    return moves;
  }

  /**
   * Given piece position and type, generate all pseudo-legal moves
   */
  function generatePieceMoves([row, col], piece) {
    let moves = [];
    const color = isWhite(piece) ? 'w' : 'b';
    const dir = color === 'w' ? -1 : 1;
    // PAWN
    if (piece.toUpperCase() === 'P') {
      const homeRow = color === 'w' ? 6 : 1;
      // forward move
      if (isOnBoard(row + dir, col) && !board[row + dir][col]) {
        // Promotion
        if ((row + dir === 0 && color === 'w') || (row + dir === 7 && color === 'b')) {
          moves.push({
            from: [row, col], to: [row + dir, col], piece, promotion: color === 'w' ? 'Q' : 'q',
          });
        } else {
          moves.push({
            from: [row, col], to: [row + dir, col], piece, promotion: null,
          });
        }
        // 2 squares from home row
        if (row === homeRow && !board[row + 2 * dir][col]) {
          moves.push({
            from: [row, col], to: [row + 2 * dir, col], piece, promotion: null,
          });
        }
      }
      // captures
      for (let dc of [-1, 1]) {
        if (isOnBoard(row + dir, col + dc)) {
          const target = board[row + dir][col + dc];
          if (target && isWhite(target) !== isWhite(piece)) {
            // Promotion capture
            if ((row + dir === 0 && color === 'w') || (row + dir === 7 && color === 'b')) {
              moves.push({
                from: [row, col], to: [row + dir, col + dc], piece, promotion: color === 'w' ? 'Q' : 'q',
                captured: target,
              });
            } else {
              moves.push({
                from: [row, col], to: [row + dir, col + dc], piece, promotion: null,
                captured: target,
              });
            }
          }
          // En passant (minimal, only if enPassant is set to capture target square)
          if (enPassant && row + dir === enPassant[0] && col + dc === enPassant[1]) {
            moves.push({
              from: [row, col], to: [row + dir, col + dc], piece, captured: board[row][col + dc], enPassant: true,
            });
          }
        }
      }
    }

    // KNIGHT
    if (piece.toUpperCase() === 'N') {
      const knightMoves = [
        [-2, -1], [-2,  1], [-1, -2], [-1, 2], [1,-2], [1,2], [2,-1], [2,1]
      ];
      for (let [dr, dc] of knightMoves) {
        const [rr, cc] = [row + dr, col + dc];
        if (!isOnBoard(rr, cc)) continue;
        const target = board[rr][cc];
        if (!target || isWhite(target) !== isWhite(piece)) {
          moves.push({from: [row, col], to: [rr, cc], piece, captured: target || null});
        }
      }
    }

    // BISHOP/ROOK/QUEEN
    if ('BQ'.includes(piece.toUpperCase())) {
      for (let [dr, dc] of [[-1,-1],[1,-1],[1,1],[-1,1]]) {
        for (let step = 1; step < 8; ++step) {
          const [rr, cc] = [row + dr * step, col + dc * step];
          if (!isOnBoard(rr, cc)) break;
          const target = board[rr][cc];
          if (!target) {
            moves.push({from: [row, col], to: [rr, cc], piece, captured: null});
          } else {
            if (isWhite(target) !== isWhite(piece)) {
              moves.push({from: [row, col], to: [rr, cc], piece, captured: target});
            }
            break;
          }
        }
      }
    }
    if ('RQ'.includes(piece.toUpperCase())) {
      for (let [dr, dc] of [[-1,0],[1,0],[0,1],[0,-1]]) {
        for (let step = 1; step < 8; ++step) {
          const [rr, cc] = [row + dr * step, col + dc * step];
          if (!isOnBoard(rr, cc)) break;
          const target = board[rr][cc];
          if (!target) {
            moves.push({from: [row, col], to: [rr, cc], piece, captured: null});
          } else {
            if (isWhite(target) !== isWhite(piece)) {
              moves.push({from: [row, col], to: [rr, cc], piece, captured: target});
            }
            break;
          }
        }
      }
    }

    // KING
    if (piece.toUpperCase() === 'K') {
      for (let dr = -1; dr <= 1; ++dr) for (let dc = -1; dc <= 1; ++dc) {
        if (dr === 0 && dc === 0) continue;
        const [rr, cc] = [row + dr, col + dc];
        if (!isOnBoard(rr, cc)) continue;
        const target = board[rr][cc];
        if (!target || isWhite(target) !== isWhite(piece)) {
          moves.push({from: [row, col], to: [rr, cc], piece, captured: target || null});
        }
      }
      // Castling
      if (color === 'w' && row === 7 && col === 4 && castling.w.K && !board[7][5] && !board[7][6]) {
        if (!this.isAttacked([7,4],'b') && !this.isAttacked([7,5],'b') && !this.isAttacked([7,6],'b')) {
          moves.push({from:[7,4], to:[7,6], piece:'K', isCastle:true, isKingSide:true});
        }
      }
      if (color === 'w' && row === 7 && col === 4 && castling.w.Q && !board[7][3] && !board[7][2] && !board[7][1]) {
        if (!this.isAttacked([7,4],'b') && !this.isAttacked([7,3],'b') && !this.isAttacked([7,2],'b')) {
          moves.push({from:[7,4], to:[7,2], piece:'K', isCastle:true, isQueenSide:true});
        }
      }
      if (color === 'b' && row === 0 && col === 4 && castling.b.K && !board[0][5] && !board[0][6]) {
        if (!this.isAttacked([0,4],'w') && !this.isAttacked([0,5],'w') && !this.isAttacked([0,6],'w')) {
          moves.push({from:[0,4], to:[0,6], piece:'k', isCastle:true, isKingSide:true});
        }
      }
      if (color === 'b' && row === 0 && col === 4 && castling.b.Q && !board[0][3] && !board[0][2] && !board[0][1]) {
        if (!this.isAttacked([0,4],'w') && !this.isAttacked([0,3],'w') && !this.isAttacked([0,2],'w')) {
          moves.push({from:[0,4], to:[0,2], piece:'k', isCastle:true, isQueenSide:true});
        }
      }
    }
    return moves;
  }

  function isOnBoard(r, c) {
    return r >= 0 && r < 8 && c >= 0 && c < 8;
  }

  /**
   * Returns true if a square is attacked by given color
   */
  function isAttacked([row, col], byColor) {
    for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
      const piece = board[r][c];
      if (!piece) continue;
      if ((byColor === 'w' && isWhite(piece)) || (byColor === 'b' && isBlack(piece))) {
        const moves = generatePieceMoves([r, c], piece);
        if (moves.some(mv => mv.to[0] === row && mv.to[1] === col)) return true;
      }
    }
    return false;
  }

  /**
   * Returns true if the current player is in check
   */
  function isInCheck(color) {
    const kingSq = color === 'w' ? whiteKing : blackKing;
    return isAttacked(kingSq, opposite(color));
  }

  /**
   * Executes a move. Assumes move is legal.
   */
  function makeMove(move) {
    const {from, to, piece, promotion, isCastle, enPassant: isEP} = move;
    const [fr, fc] = from, [tr, tc] = to;
    let captured = board[tr][tc];

    if (isEP) {
      // ep capture: remove captured pawn
      const dr = isWhite(piece) ? 1 : -1;
      captured = board[tr + dr][tc];
      board[tr + dr][tc] = null;
    }

    board[tr][tc] = promotion ? promotion : piece;
    board[fr][fc] = null;

    // castling: move the rook
    if (isCastle) {
      if (tc === 6) { // king-side
        board[tr][5] = board[tr][7];
        board[tr][7] = null;
      } else if (tc === 2) { // queen-side
        board[tr][3] = board[tr][0];
        board[tr][0] = null;
      }
    }

    // update kings
    if (piece === 'K') whiteKing = [tr, tc];
    if (piece === 'k') blackKing = [tr, tc];

    // en passant update (for pawns moving 2 squares)
    if (piece.toUpperCase() === 'P' && Math.abs(tr - fr) === 2) {
      enPassant = [(tr + fr) / 2, fc];
    } else {
      enPassant = null;
    }

    // Update castling rights
    if (piece.toUpperCase() === 'K') castling[isWhite(piece) ? 'w':'b'] = { K:false, Q:false };
    if (from[0] === 7 && from[1] === 0) castling.w.Q = false;
    if (from[0] === 7 && from[1] === 7) castling.w.K = false;
    if (from[0] === 0 && from[1] === 0) castling.b.Q = false;
    if (from[0] === 0 && from[1] === 7) castling.b.K = false;

    // Update halfmove clock/counter
    halfmoveClock = (piece.toUpperCase() === 'P' || captured) ? 0 : halfmoveClock + 1;
    if (turn === 'b') fullmoveNumber += 1;

    // Push to move history
    moveHistory.push({...move, before: [fr, fc, board[fr][fc]], after: [tr, tc, board[tr][tc]], captured, turn});

    // Switch player
    turn = opposite(turn);
  }

  /**
   * Returns true if the game is checkmate for current player
   */
  function isCheckmate() {
    return isInCheck(turn) && this.generateLegalMoves().length === 0;
  }
  function isStalemate() {
    return !isInCheck(turn) && this.generateLegalMoves().length === 0;
  }

  /**
   * Returns move history array
   */
  function getHistory() {
    return moveHistory.map((m,i) => Object.assign({}, m, {moveNumber: Math.floor(i/2) + 1}));
  }

  /** 
   * Returns a simple FEN for rendering and saving state.
   */
  function getFEN() {
    // For UI save/restore only; not fully RFC compliant!
    let rows = board.map((r) => {
      let s = '', empty = 0;
      for (const p of r) {
        if (p) {
          if (empty > 0) s += empty;
          empty = 0;
          s += p;
        } else {
          empty += 1;
        }
      }
      if (empty > 0) s += empty;
      return s;
    });
    return rows.join('/') + ' ' + turn;
  }

  return {
    // Fields
    board, turn,
    castling, enPassant, halfmoveClock, fullmoveNumber, moveHistory, whiteKing, blackKing,
    // Setters/Getters
    getBoard, getTurn, getKing,
    // Engine/Rule Logic
    generateLegalMoves: generateLegalMoves,
    isAttacked, isInCheck, isCheckmate, isStalemate,
    makeMove,
    clone,
    getHistory, getFEN,
  };
}
/////////////////////////////////////////////////////////////

/**
 * Returns an AI move using a simple minimax (1-ply) with greedy capture.
 */
function getAIMove(engine) {
  const color = engine.getTurn();
  const moves = engine.generateLegalMoves();
  if (!moves.length) return null;

  // Score function: material only
  function scoreBoard(board) {
    let score = 0;
    const values = { p: -1, n: -3, b: -3, r: -5, q: -9, k: 0,
                     P: 1, N: 3, B: 3, R: 5, Q: 9, K: 0};
    for (let r = 0; r < 8; ++r)
      for (let c = 0; c < 8; ++c)
        score += values[board[r][c]] || 0;
    return color === 'w' ? score : -score;
  }
  let maxScore = -Infinity, best = moves[0];
  for (let move of moves) {
    const engCopy = engine.clone();
    engCopy.makeMove(move);
    const sc = scoreBoard(engCopy.getBoard());
    if (sc > maxScore) { maxScore = sc; best = move; }
  }
  return best;
}

/** Helper: CSS for Chessboard grid */
const GRID_STYLE = {
  display: 'grid',
  gridTemplateRows: 'repeat(8, 1fr)',
  gridTemplateColumns: 'repeat(8, 1fr)',
  aspectRatio: '1/1',
  border: `4px solid ${COLORS.primary}`,
  borderRadius: '8px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px #0002',
  background: COLORS.bg,
  margin: 'auto',
};

/** Helper: CSS for Move History sidebar */
const MOVE_HISTORY_SIDEBAR_STYLE = {
  background: COLORS.accent,
  color: '#fff',
  width: 160,
  marginLeft: 24,
  borderRadius: 8,
  padding: '16px 8px',
  height: 420,
  overflowY: 'auto',
  fontSize: '1rem',
  boxShadow: '0 2px 14px #2223',
};

const MOVE_NUMBER_STYLE = {
  fontWeight: 'bold',
  color: COLORS.secondary,
};

/**
 * Main ChessMasterAI Container 
 */
export default function ChessMasterAI() {
  // State for chess engine
  const [engine, setEngine] = useState(() => ChessEngine());
  // Snapshot for rerendering the board
  const [board, setBoard] = useState(engine.getBoard());
  const [selected, setSelected] = useState(null); // [row,col] or null
  const [legalMoves, setLegalMoves] = useState([]);
  const [moveHistory, setMoveHistory] = useState([]);
  const [gameResult, setGameResult] = useState(null);

  // Used to synchronize AI move after human move:
  const isAiThinking = useRef(false);

  // On mount, set initial board
  useEffect(() => {
    setBoard(engine.getBoard());
    setMoveHistory(engine.getHistory());
    setGameResult(null);
    setSelected(null);
    setLegalMoves([]);
  }, []);

  // When engine instance changes (on new game), reset board
  useEffect(() => {
    setBoard(engine.getBoard());
    setMoveHistory(engine.getHistory());
    setGameResult(null);
    setSelected(null);
    setLegalMoves([]);
  }, [engine]);

  // AI: Move for black if it's black's turn and game not over
  useEffect(() => {
    if (engine.getTurn() === 'b' && !gameResult && !isAiThinking.current) {
      isAiThinking.current = true;
      setTimeout(() => {
        const aiMove = getAIMove(engine);
        if (aiMove) {
          engine.makeMove(aiMove);
          updateBoardAfterMove();
          checkForGameEnd();
        }
        isAiThinking.current = false;
      }, 700); // Simulate AI "thinking"
    }
    // eslint-disable-next-line
  }, [moveHistory, gameResult]);

  function updateBoardAfterMove() {
    setBoard(engine.getBoard());
    setMoveHistory(engine.getHistory());
    setSelected(null);
    setLegalMoves([]);
  }

  function checkForGameEnd() {
    if (engine.isCheckmate()) setGameResult(`Checkmate! ${(engine.getTurn() === 'w') ? 'Black' : 'White'} wins.`);
    else if (engine.isStalemate()) setGameResult('Stalemate! Draw.');
    // No draw 50-move rule/3fold in this simple version
  }

  function handleSquareClick(row, col) {
    const piece = board[row][col];
    if (gameResult) return;
    // If no piece selected and human's piece, select it and show legal moves
    if (!selected) {
      if (piece && isWhite(piece) && engine.getTurn() === 'w') {
        setSelected([row, col]);
        const moves = engine.generateLegalMoves().filter(
          (m) => m.from[0] === row && m.from[1] === col
        );
        setLegalMoves(moves.map((m) => m.to.join(',')));
      }
      return;
    }
    // If click on self, deselect
    if (selected[0] === row && selected[1] === col) {
      setSelected(null);
      setLegalMoves([]);
      return;
    }
    // Check if this move is valid
    const move = engine.generateLegalMoves().find(
      (m) => m.from[0] === selected[0] && m.from[1] === selected[1] && m.to[0] === row && m.to[1] === col
    );
    if (move && engine.getTurn() === 'w') {
      engine.makeMove(move);
      updateBoardAfterMove();
      checkForGameEnd();
      // AI plays automatically after (handled by useEffect above)
    } else {
      // otherwise, reselect as new piece if user's own
      if (piece && isWhite(piece)) {
        setSelected([row, col]);
        const moves = engine.generateLegalMoves().filter(
          (m) => m.from[0] === row && m.from[1] === col
        );
        setLegalMoves(moves.map((m) => m.to.join(',')));
      }
    }
  }

  function handleNewGame() {
    const newEngine = ChessEngine();
    setEngine(newEngine);
    setBoard(newEngine.getBoard());
    setMoveHistory([]);
    setSelected(null);
    setLegalMoves([]);
    setGameResult(null);
  }

  /** Renders one board square */
  function renderSquare(row, col) {
    const piece = board[row][col];
    // Board theme
    const isLight = (row + col) % 2 === 1;
    const isSelected = selected && selected[0] === row && selected[1] === col;
    const isLegalDest =
      selected && legalMoves.includes([row, col].join(','));
    const highlight = isSelected ? COLORS.secondary 
      : isLegalDest ? COLORS.accent 
      : undefined;

    return (
      <button
        key={col}
        onClick={() => handleSquareClick(row, col)}
        style={{
          border: 'none',
          outline: isSelected ? `2px solid ${COLORS.primary}` : 'none',
          background:
            highlight
              ? highlight
              : isLight
                ? COLORS.light
                : COLORS.dark,
          cursor: piece && isWhite(piece) && engine.getTurn() === 'w'
            ? 'pointer'
            : isLegalDest
              ? 'pointer'
              : 'default',
          width: '100%',
          height: '100%',
          fontSize: '2.1rem',
          transition: 'background .22s',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          userSelect: 'none',
        }}
        aria-label={`Square ${squareName(row, col)}`}
        tabIndex={0}
      >
        <span
          style={{
            color: isWhite(piece) ? COLORS.primary : COLORS.text,
            textShadow: '0 1px 0 #fff3, 0 1px 1px #2225',
          }}>
          {PIECE_UNICODES[piece] || ''}
        </span>
        {isLegalDest && (
          <span style={{
            position: 'absolute',
            width: 14, height: 14,
            borderRadius: 7,
            background: '#fff7',
            left: 'calc(50% - 7px)', top: 'calc(50% - 7px)',
            border: `2px solid ${COLORS.accent}`,
            pointerEvents: 'none',
            opacity: 0.93,
          }} />
        )}
      </button>
    );
  }

  /** Renders entire chessboard grid */
  function renderBoard() {
    return (
      <div style={GRID_STYLE}>
        {board.map((rowArray, rowIdx) =>
          rowArray.map((piece, colIdx) => renderSquare(rowIdx, colIdx))
        )}
      </div>
    );
  }

  /** Renders move history in a sidebar */
  function renderMoveHistory() {
    if (!moveHistory.length) {
      return <div style={{color:'#fff'}}>No moves yet</div>;
    }
    const movesByTurn = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      movesByTurn.push([
        moveHistory[i],
        moveHistory[i + 1] || null
      ]);
    }
    // Notation: e2-e4, Nf3, etc
    function moveNotation(move) {
      if (!move) return '';
      const pieceTxt =
        move.piece.toUpperCase() === 'P'
          ? ''
          : move.piece.toUpperCase();
      let moveStr =
        pieceTxt +
        squareName(move.from[0], move.from[1]) +
        '-' +
        squareName(move.to[0], move.to[1]);
      if (move.promotion) moveStr += '=' + move.promotion.toUpperCase();
      if (move.isCastle && move.isKingSide) moveStr = 'O-O';
      if (move.isCastle && move.isQueenSide) moveStr = 'O-O-O';
      if (move.captured) moveStr += '×';
      return moveStr;
    }
    return (
      <div>
        {movesByTurn.map(([moveW, moveB], idx) => (
          <div key={idx} style={{display:'flex', alignItems:'baseline', marginBottom: 2}}>
            <span style={MOVE_NUMBER_STYLE}>{idx+1}.</span>
            <span style={{marginLeft:4, width: 50, display:'inline-block', color:'#fff'}}>
              {moveNotation(moveW)}
            </span>
            <span style={{marginLeft:10, color:'#fd9'}}>
              {moveB ? moveNotation(moveB) : ''}
            </span>
          </div>
        ))}
      </div>
    );
  }

  /** Central Layout/Grid */
  return (
    <div
      style={{
        background: COLORS.bg,
        minHeight: '100vh',
        color: COLORS.text,
        fontFamily: 'Inter, Roboto, Helvetica, Arial, sans-serif',
        paddingTop: 40,
      }}>
      {/* Header */}
      <header style={{
        background: COLORS.primary,
        color: '#fff',
        height: 68,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 38px',
        borderBottom: '2px solid #fff2',
        boxShadow: '0 2px 10px #2221',
        position: 'fixed',
        width: '100vw',
        left: 0,
        top: 0,
        zIndex: 99,
      }}>
        <span style={{
          fontWeight: 600,
          fontSize: '1.4rem',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          letterSpacing: '1.1px',
        }}>
          <span style={{color: COLORS.accent, fontSize:'1.3rem'}}>♛</span>
          ChessMaster AI
        </span>
        <button
          style={{
            background: COLORS.secondary,
            color: COLORS.text,
            fontWeight: 600,
            fontSize: '1.1rem',
            padding: '8px 20px',
            borderRadius: 4,
            border: 'none',
            boxShadow: '0 2px 6px #0001',
            cursor: 'pointer',
          }}
          onClick={handleNewGame}
        >New Game</button>
      </header>
      {/* Central grid: Board and history */}
      <main
        style={{
          margin: '0 auto',
          maxWidth: 900,
          paddingTop: 88,
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'start',
          justifyContent: 'center',
        }}>
        <div>
          {renderBoard()}
          {gameResult && (
            <div style={{
              marginTop: 18,
              background: COLORS.primary,
              color: '#fff',
              borderRadius: 7,
              padding: '13px 22px',
              fontWeight: 600,
              fontSize: '1.2rem',
              letterSpacing: '1px',
              boxShadow: '0 2px 12px #4caf5050'
            }}>
              {gameResult}
            </div>
          )}
        </div>
        <aside style={MOVE_HISTORY_SIDEBAR_STYLE}>
          <div
            style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '.7px', marginBottom: 8 }}>
            Move History
          </div>
          {renderMoveHistory()}
        </aside>
      </main>
      <footer style={{
        marginTop: 36,
        textAlign: 'center',
        color: COLORS.secondary,
        fontSize: '1rem',
        opacity: 0.85,
        letterSpacing: '0.7px',
        padding: 16,
      }}>
        ChessMaster AI &copy; {new Date().getFullYear()} &mdash; Play against AI. Light theme.
      </footer>
    </div>
  );
}
