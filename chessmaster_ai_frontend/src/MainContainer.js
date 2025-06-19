import React, { useState } from "react";

/**
 * MainContainer
 * Primary interface for ChessMaster AI. Features:
 *  - Chessboard area (center)
 *  - Move history panel (right side)
 *  - Themed for light appearance
 *  - Grid-based responsive layout
 *
 * Chess rules & move validation including:
 *  - Legal move logic for all pieces
 *  - Check, checkmate, and stalemate detection
 *  - User can only play legal moves; UI indicates invalid moves
 *  - Game state updates are enforced per chess rules
 */
// PUBLIC_INTERFACE
function MainContainer() {
  // ------ CHESS ENGINE LOGIC (minimal, enough for rule validation structure) ------

  // Set up starting chess position as 8x8 array; each cell is { type, color }
  function getInitialBoard() {
    // Uppercase for white, lowercase for black; type: K/Q/R/B/N/P
    const empty = Array(8).fill(null);
    return [
      [ {type:'r',color:'b'}, {type:'n',color:'b'}, {type:'b',color:'b'}, {type:'q',color:'b'}, {type:'k',color:'b'}, {type:'b',color:'b'}, {type:'n',color:'b'}, {type:'r',color:'b'} ],
      Array(8).fill({type:'p', color:'b'}),
      ...Array(4).fill([...empty]),
      Array(8).fill({type:'p', color:'w'}),
      [ {type:'r',color:'w'}, {type:'n',color:'w'}, {type:'b',color:'w'}, {type:'q',color:'w'}, {type:'k',color:'w'}, {type:'b',color:'w'}, {type:'n',color:'w'}, {type:'r',color:'w'} ]
    ];
  }

  // Returns FEN-like board array, e.g. used for UI and logic
  function deepCopyBoard(board) {
    return board.map(row => row.map(cell => (cell ? {...cell} : null)));
  }

  // Utility to check if two squares are equal
  function squaresEqual(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }

  // Chess move/direction helpers
  const pieceSymbols = {
    w: {
      k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙"
    },
    b: {
      k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟"
    }
  };

  // Returns array of possible moves for a piece at square [row, col]
  function getLegalMoves(board, from, turnColor, castling, enPassantTarget) {
    const res = [];
    const [r, c] = from;
    const piece = board[r][c];
    if (!piece || piece.color !== turnColor) return [];
    const color = piece.color;
    const opp = color === 'w' ? 'b' : 'w';

    // Generate candidate moves for piece at (r,c)
    function addMove(toR, toC, opts = {}) {
      // Out of board or capture own color?  
      if (toR < 0 || toR > 7 || toC < 0 || toC > 7) return;
      if (board[toR][toC] && board[toR][toC].color === color) return;
      // Optionally prevent king moving into check here (UI does check after for perf)
      res.push({from: [r,c], to: [toR, toC], ...opts});
    }

    switch (piece.type) {
      case 'p': {
        // Pawns: forward moves
        let dir = color === 'w' ? -1 : +1;
        // Forward 1
        if (!board[r+dir]?.[c]) addMove(r+dir, c);
        // Forward 2 from start
        if (((color==='w'&&r===6)||(color==='b'&&r===1)) && !board[r+dir]?.[c] && !board[r+2*dir]?.[c]) addMove(r+2*dir, c, {isDouble:true});
        // Captures
        [c-1,c+1].forEach(cc=>{
          if (board[r+dir]?.[cc] && board[r+dir][cc].color===opp) addMove(r+dir, cc);
        });
        // En passant
        if (enPassantTarget) {
          if (Math.abs(enPassantTarget[1]-c)===1 && enPassantTarget[0]===r+dir)
            addMove(enPassantTarget[0], enPassantTarget[1], {enPassant:true});
        }
        break;
      }
      case 'r':
      case 'b':
      case 'q': {
        const dirs = [];
        if (piece.type==='r'||piece.type==='q') dirs.push([0,1],[1,0],[0,-1],[-1,0]);
        if (piece.type==='b'||piece.type==='q') dirs.push([1,1],[1,-1],[-1,1],[-1,-1]);
        for (const [dr,dc] of dirs) {
          let rr=r+dr, cc=c+dc;
          while(rr>=0&&rr<8&&cc>=0&&cc<8) {
            if (board[rr][cc]) {
              if (board[rr][cc].color===opp) addMove(rr,cc);
              break;
            }
            addMove(rr,cc);
            rr+=dr; cc+=dc;
          }
        }
        break;
      }
      case 'n':
        [ [-2,-1],[-2,1],[2,-1],[2,1],[-1,-2],[-1,2],[1,-2],[1,2] ].forEach(([dr,dc]) =>
          addMove(r+dr, c+dc)
        );
        break;
      case 'k': {
        [ [1,0],[1,1],[0,1],[-1,1],[-1,0],[-1,-1],[0,-1],[1,-1] ].forEach(([dr,dc])=>addMove(r+dr,c+dc));
        // Castling
        if (!castling) break;
        // White: row 7, Black: row 0
        if (color==='w'&&r===7&&c===4){
          if (castling.wk && !board[7][5] && !board[7][6]) addMove(7,6,{castle:'K'});
          if (castling.wq && !board[7][1] && !board[7][2] && !board[7][3]) addMove(7,2,{castle:'Q'});
        }
        if (color==='b'&&r===0&&c===4){
          if (castling.bk && !board[0][5] && !board[0][6]) addMove(0,6,{castle:'K'});
          if (castling.bq && !board[0][1] && !board[0][2] && !board[0][3]) addMove(0,2,{castle:'Q'});
        }
        break;
      }
      default:
        break;
    }
    return res;
  }

  // Checks if the given color's king is in check
  function isInCheck(board, color, castling, enPassantTarget) {
    // Find king square
    let kingSq;
    for (let r=0; r<8; ++r) for(let c=0;c<8;++c)
      if (board[r][c]?.type==='k' && board[r][c].color===color) kingSq=[r,c];
    if (!kingSq) return false;
    // See if any enemy piece attacks king's square
    const opp = color==='w'?'b':'w';
    for (let r=0;r<8;++r) for(let c=0;c<8;++c)
      if (board[r][c] && board[r][c].color===opp) {
        const moves = getLegalMoves(board, [r,c], opp, castling, enPassantTarget);
        if (moves.some(m=>m.to[0]===kingSq[0]&&m.to[1]===kingSq[1])) return true;
      }
    return false;
  }

  // Main move validation: Does move represent a legal chess move for current player?
  function isMoveLegal(board, from, to, turnColor, castling, enPassantTarget) {
    if (!from||!to) return false;
    const moves = getLegalMoves(board, from, turnColor, castling, enPassantTarget);
    let foundMove = moves.find(m=>squaresEqual(m.to, to));
    if (!foundMove) return false;
    // Simulate move, check own king not in check
    const newBoard = deepCopyBoard(board);
    // En passant (capture)
    if (foundMove.enPassant) {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
      newBoard[from[0]+(turnColor==='w'?-1:1)][to[1]] = null; // Remove captured pawn
    } else if (foundMove.castle) {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
      // Move rook as well
      if (foundMove.castle==='K') { // kingside
        newBoard[to[0]][to[1]-1] = newBoard[to[0]][7];
        newBoard[to[0]][7] = null;
      } else { // queenside
        newBoard[to[0]][to[1]+1] = newBoard[to[0]][0];
        newBoard[to[0]][0] = null;
      }
    } else {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
    }
    return !isInCheck(newBoard, turnColor, castling, enPassantTarget);
  }

  // Checkmate/stalemate detection
  function getGameStatus(board, turnColor, castling, enPassantTarget) {
    if (isInCheck(board, turnColor, castling, enPassantTarget)) {
      // If no legal moves, then checkmate
      let hasLegal = false;
      for (let r=0;r<8;++r) for (let c=0;c<8;++c)
        if (board[r][c]?.color===turnColor) {
          const moves = getLegalMoves(board, [r,c], turnColor, castling, enPassantTarget)
            .filter(({to}) => isMoveLegal(board, [r,c], to, turnColor, castling, enPassantTarget));
          if (moves.length) { hasLegal = true; break; }
        }
      if (!hasLegal) return "checkmate";
      return "check";
    } else {
      // If no moves and not in check, stalemate
      let hasLegal = false;
      for (let r=0;r<8;++r) for (let c=0;c<8;++c)
        if (board[r][c]?.color===turnColor) {
          const moves = getLegalMoves(board, [r,c], turnColor, castling, enPassantTarget)
            .filter(({to}) => isMoveLegal(board, [r,c], to, turnColor, castling, enPassantTarget));
          if (moves.length) { hasLegal = true; break; }
        }
      if (!hasLegal) return "stalemate";
      return "running";
    }
  }

  // Track board, move history, turn, castling rights, en passant, selection, status, and invalid move info.
  const [board, setBoard] = useState(getInitialBoard());
  const [turn, setTurn] = useState('w'); // 'w' for white, 'b' for black
  const [moveHistory, setMoveHistory] = useState([]);
  const [selected, setSelected] = useState(null); // [row, col] of selected
  const [castling, setCastling] = useState({wk:true, wq:true, bk:true, bq:true});
  const [enPassant, setEnPassant] = useState(null);
  const [status, setStatus] = useState('running'); // running, check, checkmate, stalemate
  const [invalidMove, setInvalidMove] = useState(null);

  // Converts [row,col] to algebraic notation (e.g., 'e2')
  function algebraic([r,c]) {
    return String.fromCharCode(97 + c) + (8-r);
  }

  // Handle click on square: select or move
  function onCellClick(r, c) {
    if (status !== "running" && status !== "check") return; // Don't allow moves if game over
    if (!selected) {
      // Select only own color
      if (board[r][c] && board[r][c].color === turn) {
        setSelected([r, c]);
        setInvalidMove(null);
      }
    } else {
      if (r === selected[0] && c === selected[1]) {
        setSelected(null);
      } else {
        // Try make move
        if (isMoveLegal(board, selected, [r, c], turn, castling, enPassant)) {
          playMove(selected, [r, c]);
          setSelected(null);
        } else {
          setInvalidMove([selected, [r, c]]);
        }
      }
    }
  }

  // Play a move (assume already validated)
  function playMove(from, to) {
    let newBoard = deepCopyBoard(board);
    const piece = board[from[0]][from[1]];
    let moveText = algebraic(from) + " → " + algebraic(to);

    // Pawn promotion, ending just as queen for simplicity
    let promotion = false;
    if (piece.type === 'p' && (to[0] === 0 || to[0] === 7)) {
      newBoard[to[0]][to[1]] = {type:'q', color:piece.color};
      newBoard[from[0]][from[1]] = null;
      promotion = true;
    }
    // Regular move, also handle en passant and castling
    else {
      // Check if move is en passant (target square empty, pawn moved diagonally)
      const deltaR = to[0] - from[0], deltaC = to[1] - from[1];
      if (piece.type==='p' && Math.abs(deltaC) === 1 && !board[to[0]][to[1]]) {
        // Remove pawn behind
        newBoard[from[0]][to[1]] = null;
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        moveText += " e.p.";
      } else if (piece.type==='k' && Math.abs(deltaC)===2) {
        // Castling
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        if (deltaC === 2) { // kingside
          newBoard[to[0]][5] = newBoard[to[0]][7];
          newBoard[to[0]][7] = null;
        } else { // queenside
          newBoard[to[0]][3] = newBoard[to[0]][0];
          newBoard[to[0]][0] = null;
        }
        moveText += " (O-O" + (deltaC===2?"":"-O") + ")";
      } else {
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
      }
    }

    // Update castling rights
    let newCastling = {...castling};
    if (piece.type==='k') {
      if (piece.color==='w') { newCastling.wk = false; newCastling.wq = false; }
      else { newCastling.bk = false; newCastling.bq = false; }
    }
    if (piece.type==='r') {
      if (from[0]===7&&from[1]===0) newCastling.wq = false;
      if (from[0]===7&&from[1]===7) newCastling.wk = false;
      if (from[0]===0&&from[1]===0) newCastling.bq = false;
      if (from[0]===0&&from[1]===7) newCastling.bk = false;
    }

    // Set en passant target
    let newEnPassant = null;
    if (piece.type==='p' && Math.abs(to[0]-from[0])===2) {
      newEnPassant = [ (from[0]+to[0])/2, from[1] ];
    }

    // Update all state
    setBoard(newBoard);
    setMoveHistory([...moveHistory, moveText]);
    setInvalidMove(null);
    setTurn(turn === "w" ? "b" : "w");
    setCastling(newCastling);
    setEnPassant(newEnPassant);

    const nextStatus = getGameStatus(newBoard, turn === "w" ? "b" : "w", newCastling, newEnPassant);
    setStatus(nextStatus);
  }

  // --- RENDERING ---
  return (
    <div style={styles.wrapper}>
      {/* Title/Header area */}
      <header style={styles.header}>
        <span style={styles.logoSymbol}>♟️</span>
        <span style={styles.appName}>ChessMaster AI</span>
      </header>

      <div style={styles.gridContainer}>
        {/* Center Chessboard */}
        <section style={styles.chessboardSection}>
          <div style={styles.chessboard}>
            {board.map((row, i) => (
              <div style={styles.row} key={i}>
                {row.map((cell, j) => {
                  // Highlight selected square or invalid move
                  let cellStyle = {
                    ...styles.cell,
                    background:
                      (i + j) % 2 === 0
                        ? "#f0f0f0"
                        : "#b8d2e6"
                  };
                  if (selected && i === selected[0] && j === selected[1]) {
                    cellStyle.background = "#ffd180";
                  }
                  if (invalidMove && invalidMove[1][0] === i && invalidMove[1][1] === j) {
                    cellStyle.background = "#ffbdbd";
                  }
                  return (
                    <div
                      key={j}
                      style={cellStyle}
                      onClick={() => onCellClick(i, j)}
                    >
                      <span style={{ fontSize: "1.9rem", userSelect: "none" }}>
                        {cell ? pieceSymbols[cell.color][cell.type] : ''}
                      </span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
          <div style={styles.boardLabel}>
            {status === "checkmate"
              ? `Checkmate! ${turn === "w" ? "Black" : "White"} wins`
              : status === "stalemate"
              ? "Stalemate: Draw"
              : status === "check"
              ? `${turn === "w" ? "White" : "Black"} in check`
              : (turn === "w" ? "White" : "Black") + "'s Move"}
            {invalidMove && (
              <><br /><span style={{ color: "crimson", fontWeight: 500, fontSize:"1.07rem" }}>Illegal move</span></>
            )}
          </div>
        </section>

        {/* Side Move History */}
        <aside style={styles.moveHistorySection}>
          <h3 style={styles.historyTitle}>Move History</h3>
          <ol style={styles.moveList}>
            {moveHistory.map((move, idx) => (
              <li key={idx} style={styles.moveItem}>{move}</li>
            ))}
          </ol>
        </aside>
      </div>
    </div>
  );
}

// --- THEME/COLORS
const theme = {
  primary: "#4CAF50",
  secondary: "#FFC107",
  accent: "#2196F3",
  background: "#fafbff",
  surface: "#ffffff",
  boardLight: "#f0f0f0",
  boardDark: "#b8d2e6",
  text: "#222",
  border: "#e0e0e0"
};

// --- STYLES ---
const styles = {
  wrapper: {
    minHeight: "100vh",
    background: theme.background,
    color: theme.text,
    display: "flex",
    flexDirection: "column",
    fontFamily:
      "'Inter', 'Roboto', 'Helvetica', 'Arial', sans-serif"
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "26px 40px 20px 40px",
    fontSize: "2rem",
    fontWeight: 600,
    background: theme.surface,
    borderBottom: `2px solid ${theme.accent}`,
    letterSpacing: 2
  },
  logoSymbol: {
    color: theme.primary,
    fontSize: "2.3rem"
  },
  appName: {
    color: theme.accent
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "minmax(320px, 1fr) 270px",
    gap: "48px",
    justifyContent: "center",
    padding: "56px 24px",
    maxWidth: "1100px",
    margin: "0 auto",
    marginTop: 22
  },
  chessboardSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center"
  },
  chessboard: {
    display: "flex",
    flexDirection: "column",
    border: `4px solid ${theme.primary}`,
    borderRadius: "10px",
    boxShadow: "0 2px 18px rgba(0,0,0,0.05)",
    overflow: "hidden",
    width: 368,
    height: 368,
    background: theme.surface,
  },
  row: {
    display: "flex",
    flex: "1 1 0%"
  },
  cell: {
    width: 46,
    height: 46,
    border: `1px solid ${theme.border}`,
    transition: "background 0.2s"
  },
  boardLabel: {
    marginTop: 18,
    fontSize: "1.13rem",
    color: theme.primary,
    fontWeight: 500
  },
  moveHistorySection: {
    background: theme.surface,
    borderRadius: 14,
    boxShadow: "0 5px 32px rgba(33,150,243,0.07)",
    padding: "28px 22px 22px 22px",
    maxHeight: 458,
    minWidth: 200,
    border: `1.5px solid ${theme.accent}`,
    overflowY: "auto"
  },
  historyTitle: {
    margin: 0,
    color: theme.accent,
    fontWeight: 600,
    fontSize: "1.22rem",
    marginBottom: 12,
    letterSpacing: 1.5
  },
  moveList: {
    paddingLeft: 24,
    margin: 0
  },
  moveItem: {
    fontSize: "1.08rem",
    color: theme.text,
    marginBottom: 4
  }
};

export default MainContainer;
