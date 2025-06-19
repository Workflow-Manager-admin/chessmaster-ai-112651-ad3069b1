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

/**
 * Main chess container with selectable AI difficulty and delayed AI move.
 */
// PUBLIC_INTERFACE
function MainContainer() {
  // --- DIFFICULTY STATE ---
  const [aiDifficulty, setAiDifficulty] = useState('Easy');
  const [aiThinking, setAiThinking] = useState(false);

  // ------ CHESS ENGINE LOGIC ------
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
  // Modern SVG piece renderer for glassmorphism
  // PUBLIC_INTERFACE
  function ChessPieceSVG({ type, color, highlight }) {
    // Base colors for visual pop and glass
    const main = color === "w" ? "#f9fafb" : "#11264a";
    const shade = color === "w" ? "#e7e8ef" : "#47365e";
    const edge = color === "w" ? "#8fc3ee" : "#63b3e6";
    const glow = highlight
      ? (color === "w" ? "#ffe7c785" : "#96ebff91")
      : (color === "w" ? "#E7F3FF90" : "#345c8d85");
    // Simple glass-shine-on gradient for highlight
    const shineGradient = color === "w"
      ? "url(#piece-glass-shine-w)"
      : "url(#piece-glass-shine-b)";
    // Each piece SVG: scalable, glassy, minimalist-modern icons.

    // King, Queen, Rook, Bishop, Knight, Pawn
    // SVGs based on minimal "glass" style with modern gradient fills.
    switch (type) {
      case "k":
        return (
          <svg width="38" height="38" viewBox="0 0 42 42" style={{transition:'filter 0.26s', filter: highlight ? `drop-shadow(0 0 16px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="60%" cy="22%" r="65%">
                <stop offset="0.05" stopColor="#fff" stopOpacity="0.85" />
                <stop offset="0.54" stopColor="#deedfc" stopOpacity="0.13" />
                <stop offset="1" stopColor="#ccd6ef" stopOpacity="0.07" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="58%" cy="19%" r="72%">
                <stop offset="0.05" stopColor="#e8f4ff" stopOpacity="0.22" />
                <stop offset="0.49" stopColor="#4466a4" stopOpacity="0.13" />
                <stop offset="1" stopColor="#678eb4" stopOpacity="0.10" />
              </radialGradient>
            </defs>
            <ellipse cx="21" cy="35.6" rx="14" ry="4.2" fill={shade} opacity="0.33" />
            <rect x="18" y="3.2" width="6" height="15.2" rx="2.7" fill={main} stroke={edge} strokeWidth="1.3"/>
            <ellipse cx="21" cy="12.7" rx="7" ry="7.45" fill={main} stroke={edge} strokeWidth="1.6" />
            <rect x="11.9" y="18.8" width="18.2" height="15.2" rx="6.2" fill={main} stroke={edge} strokeWidth="1.6" />
            <ellipse cx="21" cy="29.7" rx="7.9" ry="6.9" fill={shade} stroke={edge} strokeWidth="1"/>
            <ellipse cx="21" cy="15" rx="7" ry="7.43" fill={shineGradient} />
          </svg>
        );
      case "q":
        return (
          <svg width="37" height="37" viewBox="0 0 41 41" style={{transition:'filter 0.26s', filter: highlight ? `drop-shadow(0 0 13px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="65%" cy="23%" r="58%">
                <stop offset="0.07" stopColor="#fff" stopOpacity="0.78" />
                <stop offset="0.35" stopColor="#e7fbfc" stopOpacity="0.26" />
                <stop offset="1" stopColor="#eaf7ff" stopOpacity="0.05" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="58%" cy="17%" r="64%">
                <stop offset="0.07" stopColor="#f3f8fe" stopOpacity="0.14" />
                <stop offset="0.4" stopColor="#a6beec" stopOpacity="0.12" />
                <stop offset="1" stopColor="#6b94c9" stopOpacity="0.08" />
              </radialGradient>
            </defs>
            <ellipse cx="20.5" cy="34.9" rx="13.2" ry="3.6" fill={shade} opacity="0.26" />
            {/* Crown spikes */}
            <ellipse cx="8.5" cy="14" rx="1.9" ry="2.5" fill={main} stroke={edge} strokeWidth="1.2"/>
            <ellipse cx="20.5" cy="7.5" rx="2.3" ry="2.6" fill={main} stroke={edge} strokeWidth="1.06"/>
            <ellipse cx="32.6" cy="14" rx="1.9" ry="2.5" fill={main} stroke={edge} strokeWidth="1.2"/>
            {/* Body */}
            <rect x="11.9" y="15.7" width="17.2" height="16.2" rx="6.7" fill={main} stroke={edge} strokeWidth="1.5" />
            <ellipse cx="20.5" cy="24.4" rx="8.2" ry="8.1" fill="url(#piece-glass-shine-w)" />
            <ellipse cx="20.5" cy="14.9" rx="7.7" ry="7.2" fill={main} stroke={edge} strokeWidth="1.3"/>
            <ellipse cx="20.5" cy="17.6" rx="7.2" ry="6.1" fill={shineGradient} />
          </svg>
        );
      case "r":
        return (
          <svg width="34" height="34" viewBox="0 0 34 34" style={{transition:'filter 0.22s', filter: highlight ? `drop-shadow(0 0 12px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="54%" cy="24%" r="70%">
                <stop offset="0.11" stopColor="#fff" stopOpacity="0.84" />
                <stop offset="0.65" stopColor="#c9eaf9" stopOpacity="0.14" />
                <stop offset="1" stopColor="#f7fafd" stopOpacity="0.07" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="58%" cy="21%" r="60%">
                <stop offset="0.12" stopColor="#daeaff" stopOpacity="0.23" />
                <stop offset="0.48" stopColor="#5688be" stopOpacity="0.09" />
                <stop offset="1" stopColor="#dbeafe" stopOpacity="0.04" />
              </radialGradient>
            </defs>
            <ellipse cx="17" cy="29.8" rx="9.5" ry="2.6" fill={shade} opacity="0.22" />
            <rect x="9" y="7" width="15" height="19" rx="4" fill={main} stroke={edge} strokeWidth="1.3" />
            <rect x="11.8" y="5.4" width="9.7" height="4" rx="1.4" fill={main} stroke={edge} strokeWidth="1"/>
            <ellipse cx="17" cy="13" rx="7" ry="6" fill={shineGradient}/>
          </svg>
        );
      case "b":
        return (
          <svg width="35" height="35" viewBox="0 0 35 35" style={{transition:'filter 0.22s', filter: highlight ? `drop-shadow(0 0 10px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="68%" cy="16%" r="60%">
                <stop offset="0.09" stopColor="#fff" stopOpacity="0.73" />
                <stop offset="0.45" stopColor="#ededf9" stopOpacity="0.19" />
                <stop offset="1" stopColor="#cfe0f7" stopOpacity="0.06" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="64%" cy="30%" r="52%">
                <stop offset="0.12" stopColor="#e8f9fe" stopOpacity="0.17" />
                <stop offset="0.46" stopColor="#8ec7df" stopOpacity="0.09" />
                <stop offset="1" stopColor="#b4ddfa" stopOpacity="0.06" />
              </radialGradient>
            </defs>
            <ellipse cx="17.5" cy="30.7" rx="9.6" ry="2.5" fill={shade} opacity="0.18" />
            <ellipse cx="17.5" cy="12.7" rx="6" ry="6.7" fill={main} stroke={edge} strokeWidth="1.2" />
            <rect x="13" y="18" width="9" height="11" rx="3.6" fill={main} stroke={edge} strokeWidth="1.13"/>
            <ellipse cx="17.5" cy="16.8" rx="6" ry="4.5" fill={shineGradient}/>
          </svg>
        );
      case "n":
        return (
          <svg width="37" height="37" viewBox="0 0 37 37" style={{transition:'filter 0.21s', filter: highlight ? `drop-shadow(0 0 13px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="57%" cy="13%" r="60%">
                <stop offset="0.22" stopColor="#fff" stopOpacity="0.87" />
                <stop offset="0.78" stopColor="#dfedff" stopOpacity="0.11" />
                <stop offset="1" stopColor="#e7fbff" stopOpacity="0.06" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="61%" cy="30%" r="53%">
                <stop offset="0.19" stopColor="#c4daee" stopOpacity="0.24" />
                <stop offset="0.61" stopColor="#a1c7d6" stopOpacity="0.09" />
                <stop offset="1" stopColor="#b8d5e0" stopOpacity="0.04" />
              </radialGradient>
            </defs>
            <ellipse cx="18.5" cy="30.7" rx="12" ry="2.7" fill={shade} opacity="0.16" />
            {/* Horse silhouette, minimally */}
            <path d="M13 26 Q13 19, 21.5 7 Q27 13.6, 19 15 Q20 20.5, 27 19 Q26.7 22.4, 22 26 Q18 28, 13 26"
              stroke={edge} strokeWidth="1.2" fill={main} />
            <ellipse cx="18" cy="14.5" rx="7" ry="5.7" fill={shineGradient}/>
            <circle cx="16" cy="12.9" r="1.01" fill={edge} opacity="0.6"/>
          </svg>
        );
      case "p":
        return (
          <svg width="27" height="27" viewBox="0 0 26 26" style={{transition:'filter 0.18s', filter: highlight ? `drop-shadow(0 0 7px ${glow})` : undefined}}>
            <defs>
              <radialGradient id="piece-glass-shine-w" cx="50%" cy="0%" r="66%">
                <stop offset="0.18" stopColor="#fff" stopOpacity="0.83" />
                <stop offset="0.57" stopColor="#e7eefb" stopOpacity="0.09" />
                <stop offset="1" stopColor="#c6e7fc" stopOpacity="0.04" />
              </radialGradient>
              <radialGradient id="piece-glass-shine-b" cx="50%" cy="20%" r="80%">
                <stop offset="0.23" stopColor="#e8f4fe" stopOpacity="0.09" />
                <stop offset="1" stopColor="#aecaee" stopOpacity="0.02" />
              </radialGradient>
            </defs>
            <ellipse cx="13" cy="21.2" rx="7.4" ry="2" fill={shade} opacity="0.17" />
            <ellipse cx="13" cy="7.6" rx="4" ry="4.45" fill={main} stroke={edge} strokeWidth="1.08" />
            <rect x="7.08" y="12" width="12" height="7.2" rx="4" fill={main} stroke={edge} strokeWidth="1" />
            <ellipse cx="13" cy="11.8" rx="4.2" ry="4.15" fill={shineGradient}/>
          </svg>
        );
      default: // fallback (error)
        return null;
    }
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

  // Track if the first move has occurred: keep clocks paused until this is true
  const [hasStarted, setHasStarted] = useState(false);

  // Resume/pause logic for timers:
  // Only run clocks if (status is running or check), it's their turn, AND first move has occurred
  useEffect(() => {
    if (!(status === "running" || status === "check") || !hasStarted) {
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
    // Only run when turn, status, or hasStarted changes
  }, [turn, status, hasStarted]);

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

  // AI move logic: choose based on difficulty and apply delay before playing
  function aiMove(currentBoard, currentTurn, currentCastling, currentEnPassant, currentHistory) {
    let aiDelaySec = ({
      Easy: 0.9 + 1 * Math.random(),
      Medium: 1.3 + 1 * Math.random(),
      Hard: 1.8 + Math.random(),
    })[aiDifficulty];
    let aiDelayMs = Math.round(aiDelaySec * 1000);

    // Pause clock during AI move (clear interval)
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    setAiThinking(true);

    // Select an AI move based on difficulty
    // Enhanced AI: Medium = 1-ply minimax, Hard = 2-ply minimax, Easy = random
    function selectAIMove(difficulty) {
      // Helper: get all legal moves for current color
      function enumerateMoves(bd, color, castling, enPassantTarget) {
        const moves = [];
        for (let r = 0; r < 8; ++r) for (let c = 0; c < 8; ++c) {
          if (bd[r][c]?.color !== color) continue;
          const pieceMoves = getLegalMoves(bd, [r, c], color, castling, enPassantTarget)
            .filter(m => isMoveLegal(bd, [r, c], m.to, color, castling, enPassantTarget));
          for (const m of pieceMoves) {
            moves.push({ from: [r, c], to: m.to });
          }
        }
        return moves;
      }
      // Assign piece values (material only)
      function getPieceValue(type) {
        switch (type) {
          case 'q': return 9;
          case 'r': return 5;
          case 'b': case 'n': return 3;
          case 'p': return 1;
          default: return 0;
        }
      }
      // Material and simple position evaluation
      function evaluate(bd, color) {
        // Material sum (positive for color, minus for opponent), also bonus for mobility
        let meScore = 0, oppScore = 0;
        for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
          const p = bd[r][c];
          if (!p) continue;
          if (p.color === color) meScore += getPieceValue(p.type);
          else oppScore += getPieceValue(p.type);
        }
        return meScore - oppScore;
      }

      // 1-ply minimax root (used for medium, but prefers captures)
      function minimax1ply(bd, color, castling, enPassantTarget) {
        const moves = enumerateMoves(bd, color, castling, enPassantTarget);
        if (moves.length === 0) return null;
        let maxScore = -Infinity, bestMoves = [];
        for (const move of moves) {
          const testBoard = deepCopyBoard(bd);
          const movingPiece = testBoard[move.from[0]][move.from[1]];
          const cap = testBoard[move.to[0]][move.to[1]];
          testBoard[move.to[0]][move.to[1]] = movingPiece;
          testBoard[move.from[0]][move.from[1]] = null;
          // promote if pawn reaches end
          if (movingPiece.type === 'p' && (move.to[0] === 0 || move.to[0] === 7))
            testBoard[move.to[0]][move.to[1]] = {type:'q', color:movingPiece.color};

          let score = evaluate(testBoard, color);
          if (cap) score += getPieceValue(cap.type); // favor captures extra
          if (score > maxScore) {
            maxScore = score;
            bestMoves = [move];
          } else if (score === maxScore) {
            bestMoves.push(move);
          }
        }
        return bestMoves.length ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : moves[Math.floor(Math.random() * moves.length)];
      }

      // 2-ply minimax, only material (for Hard), no alpha-beta for speed, random breaks ties
      function minimax2ply_root(bd, color, castling, enPassantTarget) {
        const moves = enumerateMoves(bd, color, castling, enPassantTarget);
        if (moves.length === 0) return null;
        let maxScore = -Infinity, bestMoves = [];
        for (const move of moves) {
          let testBoard = deepCopyBoard(bd);
          const movingPiece = testBoard[move.from[0]][move.from[1]];
          testBoard[move.to[0]][move.to[1]] = movingPiece;
          testBoard[move.from[0]][move.from[1]] = null;
          // pawn promo
          if (movingPiece.type === 'p' && (move.to[0] === 0 || move.to[0] === 7))
            testBoard[move.to[0]][move.to[1]] = {type:'q', color:movingPiece.color};
          // Opponent reply (minimizing)
          const oppColor = color === 'w' ? 'b' : 'w';
          const oppMoves = enumerateMoves(testBoard, oppColor, castling, enPassantTarget);
          let worstForMe = Infinity;
          if (oppMoves.length === 0) {
            // No opponent move, treat as win (checkmate or stalemate)
            worstForMe = evaluate(testBoard, color) + 999;
          } else {
            for (const oppMove of oppMoves) {
              let oppBoard = deepCopyBoard(testBoard);
              const oppPiece = oppBoard[oppMove.from[0]][oppMove.from[1]];
              oppBoard[oppMove.to[0]][oppMove.to[1]] = oppPiece;
              oppBoard[oppMove.from[0]][oppMove.from[1]] = null;
              if (oppPiece.type === 'p' && (oppMove.to[0] === 0 || oppMove.to[0] === 7))
                oppBoard[oppMove.to[0]][oppMove.to[1]] = {type:'q', color:oppPiece.color};
              const score = evaluate(oppBoard, color);
              if (score < worstForMe) worstForMe = score;
            }
          }
          if (worstForMe > maxScore) {
            maxScore = worstForMe;
            bestMoves = [move];
          } else if (worstForMe === maxScore) {
            bestMoves.push(move);
          }
        }
        return bestMoves.length ? bestMoves[Math.floor(Math.random() * bestMoves.length)] : moves[Math.floor(Math.random() * moves.length)];
      }

      // --- Main difficulty branches ---
      if (difficulty === "Easy") {
        // Random move
        const possible = enumerateMoves(currentBoard, currentTurn, currentCastling, currentEnPassant);
        if (possible.length === 0) return null;
        return possible[Math.floor(Math.random() * possible.length)];
      }
      if (difficulty === "Medium") {
        // Use 1-ply minimax with material/capture bias (not just greedy capture)
        return minimax1ply(currentBoard, currentTurn, currentCastling, currentEnPassant);
      }
      // Hard: Deeper 2-ply minimax for more strategic moves
      return minimax2ply_root(currentBoard, currentTurn, currentCastling, currentEnPassant);
    }

    const chosenMove = selectAIMove(aiDifficulty);
    if (!chosenMove) {
      setAiThinking(false);
      return;
    }

    setTimeout(() => {
      setAiThinking(false);
      aiPlayMove(
        chosenMove.from,
        chosenMove.to,
        currentBoard,
        currentHistory,
        currentCastling,
        currentEnPassant,
        currentTurn
      );
    }, aiDelayMs);
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

      // Set hasStarted on the first AI move if it hasn't started yet (in theory, only if AI opens)
      setHasStarted((prev) => prev || true);
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

    // On the player's first move, set hasStarted to true
    setHasStarted((prev) => prev || true);

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
        if (!aiThinking) {
          aiMove(newBoard, "b", newCastling, newEnPassant, [...moveHistory, moveText]);
        }
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

      {/* AI Difficulty selection at the top */}
      <div style={styles.difficultyBar}>
        <span style={styles.difficultyLabel}>AI Difficulty:&nbsp;</span>
        <select
          value={aiDifficulty}
          onChange={e => setAiDifficulty(e.target.value)}
          style={styles.difficultySelect}
          aria-label="Select AI Difficulty"
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        {aiThinking && (
          <span style={styles.thinkingHint}>
            <span style={styles.thinkingDot}>•</span> AI is thinking...
          </span>
        )}
      </div>

      <div style={styles.gridContainer}>
        {/* Center Chessboard and clocks */}
        <section style={styles.chessboardSection}>

          {/* --- Clocks UI --- */}
          <div style={clockStyles.clockBar}>
            <Clock
              time={whiteTime}
              active={hasStarted && turn === "w" && (status === "running" || status === "check")}
              color="w"
              label="Player"
            />
            <span style={clockStyles.vsDivider}>vs</span>
            <Clock
              time={blackTime}
              active={hasStarted && turn === "b" && (status === "running" || status === "check")}
              color="b"
              label="AI"
            />
          </div>

          {/* Modern Chessboard with Glassmorphism, SVG pieces, gradient cells and subtle hover/animation */}
          <div style={styles.chessboardModern}>
            {board.map((row, i) => (
              <div style={styles.row} key={i}>
                {row.map((cell, j) => {
                  // Determine board cell styling
                  const isLight = (i + j) % 2 === 0;
                  let cellGradient = isLight
                    ? "linear-gradient(120deg, rgba(255,255,255,0.77) 60%, rgba(218,244,252,0.63) 100%)"
                    : "linear-gradient(140deg, rgba(20,38,78,0.37) 55%, rgba(0,82,143,0.31) 100%)";
                  let cellBackdrop =
                    "backdrop-filter: blur(13px) saturate(1.2); -webkit-backdrop-filter: blur(13px) saturate(1.2)";
                  let cellBorder = isLight
                    ? "1.2px solid rgba(250,250,250,0.55)"
                    : "1.2px solid rgba(20,40,69,0.14)";
                  let cellShadow =
                    isLight
                      ? "0 2px 9px rgba(66,183,255,0.05), 0 1px 2px rgba(97,165,255,0.07)"
                      : "0 2px 9px rgba(18,22,35,0.23), 0 1px 2px rgba(17,36,54,0.11)";
                  let cellStyle = {
                    ...styles.cellModern,
                    background: cellGradient,
                    boxShadow: cellShadow,
                    border: cellBorder,
                    position: "relative",
                    cursor: cell && cell.color === turn && (status === "running" || status === "check")
                      ? "pointer"
                      : "default",
                    transition: "background .21s, box-shadow .24s, border .15s, transform .13s",
                  };
                  // Overlay for selection/feedback
                  if (selected && i === selected[0] && j === selected[1]) {
                    cellStyle.background = "linear-gradient(120deg,#ffe7c7a9 60%, #ffd180 100%)";
                    cellStyle.boxShadow = "0 0 0 6px #ffd1805a, 0 2px 30px #ffedcc44";
                    cellStyle.zIndex = 2;
                  }
                  if (invalidMove && invalidMove[1][0] === i && invalidMove[1][1] === j) {
                    cellStyle.background = "linear-gradient(128deg,#ffd7d7 58%, #ffbdbd 100%)";
                    cellStyle.boxShadow = "0 0 0 7px rgba(255,50,60,0.27)";
                    cellStyle.animation = "shake .20s cubic-bezier(.41, .01, .59, .97)";
                  }
                  // Slight scale animation for move/select
                  if (selected && i === selected[0] && j === selected[1]) cellStyle.transform = "scale(1.065)";
                  return (
                    <div
                      key={j}
                      style={cellStyle}
                      onClick={() => onCellClick(i, j)}
                      tabIndex={0}
                      aria-label={`${cell ? (cell.color === "w" ? "White " : "Black ") + cell.type.toUpperCase() : "Empty"} square ${String.fromCharCode(65 + j)}${8 - i}`}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          userSelect: "none",
                          transition: "transform .17s cubic-bezier(.51,.4,.29,1.31)"
                        }}
                      >
                        {cell ? <ChessPieceSVG type={cell.type} color={cell.color} highlight={(selected && i === selected[0] && j === selected[1])} /> : ""}
                      </div>
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
    letterSpacing: 2,
    boxShadow: "0 6px 32px rgba(106,182,254,0.035)"
  },
  logoSymbol: {
    color: theme.primary,
    fontSize: "2.3rem"
  },
  appName: {
    color: theme.accent
  },
  difficultyBar: {
    width: "100%",
    padding: "16px 40px 0 40px",
    display: "flex",
    alignItems: "center",
    gap: 13,
    marginBottom: 0,
    background: "transparent",
    minHeight: 42
  },
  difficultyLabel: {
    fontWeight: 500,
    color: theme.accent,
    fontSize: "1.02rem",
    letterSpacing: 1
  },
  difficultySelect: {
    background: "#f0f0f8",
    color: theme.text,
    border: `1.5px solid ${theme.accent}`,
    borderRadius: 5,
    padding: "5.5px 12px",
    fontSize: "1.05rem",
    fontWeight: 500,
    outline: "none"
  },
  thinkingHint: {
    marginLeft: 27,
    color: "#FF9933",
    fontWeight: 600,
    letterSpacing: "0.5px",
    fontSize: "1.06rem",
    display: "flex",
    gap: 5,
    alignItems: "center",
    opacity: 0.96
  },
  thinkingDot: {
    fontSize: "1.6rem",
    color: "#F47C22",
    animation: "blink 1.2s infinite alternate"
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
  // Modern glassmorphism chessboard styles
  chessboardModern: {
    display: "flex",
    flexDirection: "column",
    border: `4.2px solid #6ec2ff88`,
    borderRadius: "20px",
    boxShadow:
      "0 6px 48px 0px rgba(35,142,206,0.10), 0 1.5px 20px 0 rgba(50,165,255,0.09)",
    overflow: "hidden",
    width: 372,
    height: 372,
    margin: 0,
    background:
      "linear-gradient(135deg, rgba(216,245,255,0.52) 0%, rgba(120,204,253,0.07) 100%)",
    backdropFilter: "blur(16px) saturate(1.09)",
    WebkitBackdropFilter: "blur(16px) saturate(1.09)",
    zIndex: 2,
    position: "relative",
    transition: "box-shadow 0.23s, border 0.17s"
  },
  row: {
    display: "flex",
    flex: "1 1 0%",
    minHeight: 1,
    zIndex: 1, // above background
  },
  cellModern: {
    width: 46,
    height: 46,
    borderRadius: "7px",
    border: "none",
    position: "relative",
    overflow: "hidden",
    background: "transparent",
    boxShadow: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    zIndex: 1,
    transition: "background 0.18s, box-shadow 0.15s, border 0.1s, transform .15s"
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
