import React from 'react';
import './App.css';
import ChessMasterAI from './ChessMasterAI';

// PUBLIC_INTERFACE
function App() {
  /**
   * Root app: renders main ChessMasterAI container.
   */
  return (
    <div className="app">
      <ChessMasterAI />
    </div>
  );
}

export default App;