import React from 'react';
import './App.css';
import MainContainer from './MainContainer';

// PUBLIC_INTERFACE
function App() {
  // Add outer wrapper for easy theme class toggling, but dark mode logic is in MainContainer
  return (
    <div className="app" style={{background: "var(--base-dark)", color: "var(--text-color)"}}>
      <MainContainer />
    </div>
  );
}

export default App;