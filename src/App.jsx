import React, { useState } from 'react';
import Piano from './components/Piano';
import MaestroMode from './components/MaestroMode';
import { Music, Eye, BookOpen, Layers } from 'lucide-react';
import './App.css';

export default function App() {
  const [activeTab, setActiveTab] = useState('maestro');
  const [lastNotePlayed, setLastNotePlayed] = useState('');

  const handleNotePlayback = (note) => {
    setLastNotePlayed(note);
    // clear note after 100ms
    setTimeout(() => setLastNotePlayed(''), 100);
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">
            <Music size={24} />
          </div>
          <div>
            <h1 className="text-gradient" style={{ fontSize: '1.65rem', lineHeight: 1.2 }}>
              Piano Maestro Virtual
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
              Advanced Virtual Synth & Maestro Learning Center
            </p>
          </div>
        </div>

        {/* Tab Selection Navigation */}
        <nav className="nav-buttons">
          <button 
            className={`nav-tab ${activeTab === 'maestro' ? 'active' : ''}`}
            onClick={() => setActiveTab('maestro')}
          >
            <BookOpen size={18} /> Maestro Learning
          </button>
          <button 
            className={`nav-tab ${activeTab === 'synth' ? 'active' : ''}`}
            onClick={() => setActiveTab('synth')}
          >
            <Layers size={18} /> Direct Play (Synth Only)
          </button>
        </nav>
      </header>

      {/* Dynamic Module Content */}
      <main style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {activeTab === 'maestro' ? (
          <MaestroMode pianoNotePlayed={lastNotePlayed} />
        ) : (
          <div className="glass-panel" style={{ padding: 24 }}>
            <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <Layers size={22} /> Synth Focus Mode
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 0 }}>
              Use your PC keyboard or mouse/touch screen to unleash customized timbres and creative musical ideas.
            </p>
          </div>
        )}

        {/* Piano Component (Always accessible for continuous experimentation) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)', paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Eye size={16} className="text-gradient" /> Visual Keyboard & Sound Settings
          </h3>
          <Piano notePlayCallback={handleNotePlayback} />
        </div>
      </main>

      {/* Modern Footer section */}
      <footer className="app-footer">
        Piano Maestro Virtual • Premium Synthesis & Musical Education Platform • 2026
      </footer>
    </div>
  );
}
