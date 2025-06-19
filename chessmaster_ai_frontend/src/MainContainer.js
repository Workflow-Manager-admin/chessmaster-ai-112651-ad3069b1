import React, { useState, useRef, useEffect } from "react";

/**
 * Display a countdown clock for each player.
 * Props: time (seconds), active (is ticking), color ('w'/'b'), label (string)
 */
// PUBLIC_INTERFACE
function Clock({ time, active, color, label }) {
  // Format as mm:ss
  const mins = Math.floor(time / 60).toString().padStart(2, "0");
  const secs = (time % 60).toString().padStart(2, "0");
  return (
    <div
      style={{
        ...clockStyles.clockOuter,
        borderColor: color === "w" ? theme.primary : theme.accent,
        background:
          color === "w"
            ? "linear-gradient(90deg,#fafdff,#e6f3fc)"
            : "linear-gradient(90deg,#e3e9ff,#c9e0fb)",
        opacity: active ? 1 : 0.68,
        boxShadow: active
          ? "0 0 0 2.5px " +
            (color === "w" ? theme.primary : theme.accent) +
            ", 0 3px 18px rgba(33,150,243,0.09)"
          : "0 2.5px 14px rgba(150,150,180,0.05)",
        transition: "opacity 0.18s, box-shadow 0.18s"
      }}
      aria-label={label}
    >
      <span
        style={{
          ...clockStyles.clockLabel,
          color: color === "w" ? theme.primary : theme.accent
        }}
      >
        {label}
      </span>
      <span
        style={{
          ...clockStyles.clockDigits,
          fontWeight: active ? 700 : 500
        }}
      >
        {mins}:{secs}
      </span>
      <span
        style={{
          ...clockStyles.clockActiveDot,
          background: active
            ? color === "w"
              ? theme.primary
              : theme.accent
            : "transparent"
        }}
      />
    </div>
  );
}

// PUBLIC_INTERFACE
function MainContainer() {
  // ------ CHESS ENGINE LOGIC (omitted for brevity, same as previous) ------
  function getInitialBoard() {
    const empty = Array(8).fill(null);
    return [
      [ {type:'r',color:'b'}, {type:'n',color:'b'}, {type:'b',color:'b'}, {type:'q',color:'b'}, {type:'k',color:'b'}, {type:'b',color:'b'}, {type:'n',color:'b'}, {type:'r',color:'b'} ],
      Array(8).fill({type:'p', color:'b'}),
      ...Array(4).fill([...empty]),
      Array(8).fill({type:'p', color:'w'}),
      [ {type:'r',color:'w'}, {type:'n',color:'w'}, {type:'b',color:'w'}, {type:'q',color:'w'}, {type:'k',color:'w'}, {type:'b',color:'w'}, {type:'n',color:'w'}, {type:'r',color:'w'} ]
    ];
  }
  function deepCopyBoard(board) {
    return board.map(row => row.map(cell => (cell ? {...cell} : null)));
  }
  function squaresEqual(a, b) {
    return a && b && a[0] === b[0] && a[1] === b[1];
  }
  const pieceSymbols = {
    w: { k: "♔", q: "♕", r: "♖", b: "♗", n: "♘", p: "♙" },
    b: { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" }
  };
  function getLegalMoves(board, from, turnColor, castling, enPassantTarget) {
    const res = [];
    const [r, c] = from;
    const piece = board[r][c];
    if (!piece || piece.color !== turnColor) return [];
    const color = piece.color;
    const opp = color === 'w' ? 'b' : 'w';
    function addMove(toR, toC, opts = {}) {
      if (toR < 0 || toR > 7 || toC < 0 || toC > 7) return;
      if (board[toR][toC] && board[toR][toC].color === color) return;
      res.push({from: [r,c], to: [toR, toC], ...opts});
    }
    switch (piece.type) {
      case 'p': {
        let dir = color === 'w' ? -1 : +1;
        if (!board[r+dir]?.[c]) addMove(r+dir, c);
        if (((color==='w'&&r===6)||(color==='b'&&r===1)) && !board[r+dir]?.[c] && !board[r+2*dir]?.[c]) addMove(r+2*dir, c, {isDouble:true});
        [c-1,c+1].forEach(cc=>{
          if (board[r+dir]?.[cc] && board[r+dir][cc].color===opp) addMove(r+dir, cc);
        });
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
        if (!castling) break;
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
  function isInCheck(board, color, castling, enPassantTarget) {
    let kingSq;
    for (let r=0; r<8; ++r) for(let c=0;c<8;++c)
      if (board[r][c]?.type==='k' && board[r][c].color===color) kingSq=[r,c];
    if (!kingSq) return false;
    const opp = color==='w'?'b':'w';
    for (let r=0;r<8;++r) for(let c=0;c<8;++c)
      if (board[r][c] && board[r][c].color===opp) {
        const moves = getLegalMoves(board, [r,c], opp, castling, enPassantTarget);
        if (moves.some(m=>m.to[0]===kingSq[0]&&m.to[1]===kingSq[1])) return true;
      }
    return false;
  }
  function isMoveLegal(board, from, to, turnColor, castling, enPassantTarget) {
    if (!from||!to) return false;
    const moves = getLegalMoves(board, from, turnColor, castling, enPassantTarget);
    let foundMove = moves.find(m=>squaresEqual(m.to, to));
    if (!foundMove) return false;
    const newBoard = deepCopyBoard(board);
    if (foundMove.enPassant) {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
      newBoard[from[0]+(turnColor==='w'?-1:1)][to[1]] = null;
    } else if (foundMove.castle) {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
      if (foundMove.castle==='K') {
        newBoard[to[0]][to[1]-1] = newBoard[to[0]][7];
        newBoard[to[0]][7] = null;
      } else {
        newBoard[to[0]][to[1]+1] = newBoard[to[0]][0];
        newBoard[to[0]][0] = null;
      }
    } else {
      newBoard[to[0]][to[1]] = newBoard[from[0]][from[1]];
      newBoard[from[0]][from[1]] = null;
    }
    return !isInCheck(newBoard, turnColor, castling, enPassantTarget);
  }
  function getGameStatus(board, turnColor, castling, enPassantTarget) {
    if (isInCheck(board, turnColor, castling, enPassantTarget)) {
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
  const [board, setBoard] = useState(getInitialBoard());
  const [turn, setTurn] = useState('w');
  const [moveHistory, setMoveHistory] = useState([]);
  const [selected, setSelected] = useState(null); // [row, col] of selected
  const [castling, setCastling] = useState({wk:true, wq:true, bk:true, bq:true});
  const [enPassant, setEnPassant] = useState(null);
  const [status, setStatus] = useState('running'); // running, check, checkmate, stalemate
  const [invalidMove, setInvalidMove] = useState(null);

  // --- CHESS CLOCK STATE ---
  const DEFAULT_TIME = 5 * 60; // 5 minutes for each player
  const [whiteTime, setWhiteTime] = useState(DEFAULT_TIME);
  const [blackTime, setBlackTime] = useState(DEFAULT_TIME);
  const clockIntervalRef = useRef(null);

  // Resume/pause logic for timers: run only if (status is running or check) and it's their turn
  useEffect(() => {
    if (!(status === "running" || status === "check")) {
      if (clockIntervalRef.current) {
        clearInterval(clockIntervalRef.current);
        clockIntervalRef.current = null;
      }
      return;
    }
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);

    clockIntervalRef.current = setInterval(() => {
      if (turn === "w") {
        setWhiteTime((t) => (t > 0 ? t - 1 : 0));
      } else {
        setBlackTime((t) => (t > 0 ? t - 1 : 0));
      }
    }, 1000);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
    // Only run when turn or status changes
  }, [turn, status]);

  // Stop timers at time out (when clock hits 0)
  useEffect(() => {
    if (whiteTime === 0 && (status === "running" || status === "check")) {
      setStatus("checkmate");
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    }
    if (blackTime === 0 && (status === "running" || status === "check")) {
      setStatus("checkmate");
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    }
  }, [whiteTime, blackTime, status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, []);

  function algebraic([r,c]) {
    return String.fromCharCode(97 + c) + (8-r);
  }
  function onCellClick(r, c) {
    if (status !== "running" && status !== "check") return;
    if (!selected) {
      if (board[r][c] && board[r][c].color === turn) {
        setSelected([r, c]);
        setInvalidMove(null);
      }
    } else {
      if (r === selected[0] && c === selected[1]) {
        setSelected(null);
      } else {
        if (isMoveLegal(board, selected, [r, c], turn, castling, enPassant)) {
          playerMove(selected, [r, c]);
          setSelected(null);
        } else {
          setInvalidMove([selected, [r, c]]);
        }
      }
    }
  }

  // AI move logic: select and play a random legal move for the given color (AI plays black)
  function aiMove(currentBoard, currentTurn, currentCastling, currentEnPassant, currentHistory) {
    const moves = [];
    for (let r = 0; r < 8; ++r) {
      for (let c = 0; c < 8; ++c) {
        if (currentBoard[r][c]?.color === currentTurn) {
          const pieceMoves = getLegalMoves(currentBoard, [r,c], currentTurn, currentCastling, currentEnPassant)
            .filter(m => isMoveLegal(currentBoard, [r,c], m.to, currentTurn, currentCastling, currentEnPassant));
          for (const m of pieceMoves) {
            moves.push({from: [r, c], to: m.to});
          }
        }
      }
    }
    if (moves.length === 0) return;
    const choice = moves[Math.floor(Math.random() * moves.length)];
    aiPlayMove(choice.from, choice.to, currentBoard, currentHistory, currentCastling, currentEnPassant, currentTurn);
  }

  function aiPlayMove(from, to, localBoard, localHistory, localCastling, localEnPassant, localTurn) {
    let newBoard = deepCopyBoard(localBoard);
    const piece = localBoard[from[0]][from[1]];
    let moveText = algebraic(from) + " → " + algebraic(to);

    let promotion = false;
    if (piece.type === 'p' && (to[0] === 0 || to[0] === 7)) {
      newBoard[to[0]][to[1]] = {type:'q', color:piece.color};
      newBoard[from[0]][from[1]] = null;
      promotion = true;
    }
    else {
      const deltaR = to[0] - from[0], deltaC = to[1] - from[1];
      if (piece.type==='p' && Math.abs(deltaC) === 1 && !localBoard[to[0]][to[1]]) {
        newBoard[from[0]][to[1]] = null;
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        moveText += " e.p.";
      } else if (piece.type==='k' && Math.abs(deltaC)===2) {
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        if (deltaC === 2) {
          newBoard[to[0]][5] = newBoard[to[0]][7];
          newBoard[to[0]][7] = null;
        } else {
          newBoard[to[0]][3] = newBoard[to[0]][0];
          newBoard[to[0]][0] = null;
        }
        moveText += " (O-O" + (deltaC===2?"":"-O") + ")";
      } else {
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
      }
    }

    let newCastling = {...localCastling};
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

    let newEnPassant = null;
    if (piece.type==='p' && Math.abs(to[0]-from[0])===2) {
      newEnPassant = [ (from[0]+to[0])/2, from[1] ];
    }

    setTimeout(() => {
      setBoard(newBoard);
      setMoveHistory([...localHistory, moveText]);
      setInvalidMove(null);
      setTurn(localTurn === "w" ? "b" : "w");
      setCastling(newCastling);
      setEnPassant(newEnPassant);

      const nextStatus = getGameStatus(newBoard, localTurn === "w" ? "b" : "w", newCastling, newEnPassant);
      setStatus(nextStatus);
    }, 460);
  }

  function playerMove(from, to) {
    let newBoard = deepCopyBoard(board);
    const piece = board[from[0]][from[1]];
    let moveText = algebraic(from) + " → " + algebraic(to);

    let promotion = false;
    if (piece.type === 'p' && (to[0] === 0 || to[0] === 7)) {
      newBoard[to[0]][to[1]] = {type:'q', color:piece.color};
      newBoard[from[0]][from[1]] = null;
      promotion = true;
    }
    else {
      const deltaR = to[0] - from[0], deltaC = to[1] - from[1];
      if (piece.type==='p' && Math.abs(deltaC) === 1 && !board[to[0]][to[1]]) {
        newBoard[from[0]][to[1]] = null;
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        moveText += " e.p.";
      } else if (piece.type==='k' && Math.abs(deltaC)===2) {
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
        if (deltaC === 2) {
          newBoard[to[0]][5] = newBoard[to[0]][7];
          newBoard[to[0]][7] = null;
        } else {
          newBoard[to[0]][3] = newBoard[to[0]][0];
          newBoard[to[0]][0] = null;
        }
        moveText += " (O-O" + (deltaC===2?"":"-O") + ")";
      } else {
        newBoard[to[0]][to[1]] = piece;
        newBoard[from[0]][from[1]] = null;
      }
    }

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

    let newEnPassant = null;
    if (piece.type==='p' && Math.abs(to[0]-from[0])===2) {
      newEnPassant = [ (from[0]+to[0])/2, from[1] ];
    }
    setBoard(newBoard);
    setMoveHistory([...moveHistory, moveText]);
    setInvalidMove(null);

    const nextTurn = turn === "w" ? "b" : "w";
    setTurn(nextTurn);
    setCastling(newCastling);
    setEnPassant(newEnPassant);

    const nextStatus = getGameStatus(newBoard, nextTurn, newCastling, newEnPassant);
    setStatus(nextStatus);

    if (nextStatus === "running" || nextStatus === "check") {
      if (nextTurn === "b") {
        setTimeout(() => {
          aiMove(newBoard, "b", newCastling, newEnPassant, [...moveHistory, moveText]);
        }, 380);
      }
    }
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
        {/* Center Chessboard and clocks */}
        <section style={styles.chessboardSection}>

          {/* --- Clocks UI --- */}
          <div style={clockStyles.clockBar}>
            <Clock
              time={whiteTime}
              active={turn === "w" && (status === "running" || status === "check")}
              color="w"
              label="Player"
            />
            <span style={clockStyles.vsDivider}>vs</span>
            <Clock
              time={blackTime}
              active={turn === "b" && (status === "running" || status === "check")}
              color="b"
              label="AI"
            />
          </div>

          <div style={styles.chessboard}>
            {board.map((row, i) => (
              <div style={styles.row} key={i}>
                {row.map((cell, j) => {
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
              ? `${
                  turn === "w"
                    ? blackTime === 0
                      ? "Out of time! White loses"
                      : "Checkmate! Black wins"
                    : whiteTime === 0
                    ? "Out of time! Black loses"
                    : "Checkmate! White wins"
                }`
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

// --- CLOCK STYLES ---
const clockStyles = {
  clockBar: {
    width: "365px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 8,
    gap: 17
  },
  clockOuter: {
    border: "2.5px solid",
    borderRadius: "32px",
    padding: "6px 18px 7px 18px",
    minWidth: "114px",
    fontFamily: "'JetBrains Mono', 'Menlo', 'Consolas', monospace",
    fontWeight: 600,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: "1.62rem",
    background: "#f9fdff",
    position: "relative"
  },
  clockLabel: {
    fontSize: "0.97rem",
    marginBottom: -3,
    marginTop: 0,
    fontWeight: 500,
    opacity: 0.92
  },
  clockDigits: {
    fontSize: "2.01rem",
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "0.12em"
  },
  clockActiveDot: {
    width: 16,
    height: 4,
    borderRadius: 6,
    marginTop: 3,
    marginBottom: -3,
    alignSelf: "center",
    transition: "background 0.17s"
  },
  vsDivider: {
    fontWeight: 700,
    fontSize: "1.22rem",
    color: "#ACB4C5",
    margin: "0 6px"
  }
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
