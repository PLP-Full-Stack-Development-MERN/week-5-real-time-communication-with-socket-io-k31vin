import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import NoteEditor from './components/NoteEditor';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Real-Time Collaborative Notes</h1>
        </header>
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/notes/:roomId" element={<NoteEditor />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
