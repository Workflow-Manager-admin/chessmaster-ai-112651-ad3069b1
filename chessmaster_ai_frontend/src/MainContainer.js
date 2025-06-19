import React, { useState } from "react";

/**
 * MainContainer
 * Primary interface for ChessMaster AI. Features:
 *  - Chessboard area (center)
 *  - Move history panel (right side)
 *  - Themed for light appearance
 *  - Grid-based responsive layout
 *
 * Notes:
 *  - Chess functionality to be implemented in follow-ups.
 *  - Color scheme: primary #4CAF50, secondary #FFC107, accent #2196F3.
 *  - Minimal demo chessboard and history list for scaffolding.
 */
// PUBLIC_INTERFACE
function MainContainer() {
  // Placeholder: empty 8x8 chessboard array and move history
  const [board] = useState(Array(8).fill(Array(8).fill(null)));
  const [moveHistory] = useState([
    "e2 → e4",
    "e7 → e5",
    "g1 → f3",
    "b8 → c6",
    // Demo history, not real game logic
  ]);

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
                {row.map((cell, j) => (
                  <div
                    key={j}
                    style={{
                      ...styles.cell,
                      background:
                        (i + j) % 2 === 0
                          ? "#f0f0f0"
                          : "#b8d2e6"
                    }}
                  />
                ))}
              </div>
            ))}
          </div>
          <div style={styles.boardLabel}>Your Move (AI coming soon)</div>
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
