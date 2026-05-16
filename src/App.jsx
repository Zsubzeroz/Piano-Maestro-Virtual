import React, { useState } from 'react';
import Piano from './components/Piano';
import MaestroMode from './components/MaestroMode';
import { Music, Eye, BookOpen, Layers } from 'lucide-react';
import './App.css';

const SONGS = [
  {
    id: 1,
    title: "Leila Fletcher: The Bell Rings",
    difficulty: "Basic Hand Position",
    notes: [
      { note: 'C4', time: 1.0, duration: 1.0 }, { note: 'D4', time: 2.5, duration: 1.0 },
      { note: 'E4', time: 4.0, duration: 1.0 }, { note: 'D4', time: 5.5, duration: 1.0 },
      { note: 'C4', time: 7.0, duration: 2.0 }
    ]
  },
  {
    id: 2,
    title: "Leila Fletcher: Robin Redbreast",
    difficulty: "Five Finger Scale",
    notes: [
      { note: 'C4', time: 1.0, duration: 0.8 }, { note: 'D4', time: 2.0, duration: 0.8 },
      { note: 'E4', time: 3.0, duration: 0.8 }, { note: 'F4', time: 4.0, duration: 0.8 },
      { note: 'G4', time: 5.0, duration: 1.5 }, { note: 'F4', time: 7.0, duration: 0.8 },
      { note: 'E4', time: 8.0, duration: 0.8 }, { note: 'D4', time: 9.0, duration: 0.8 },
      { note: 'C4', time: 10.0, duration: 2.0 }
    ]
  },
  {
    id: 3,
    title: "Leila Fletcher: Merry-Go-Round",
    difficulty: "Both Hands Intro",
    notes: [
      { note: 'C4', time: 1.0, duration: 1.0 }, { note: 'B3', time: 2.2, duration: 1.0 },
      { note: 'A3', time: 3.4, duration: 1.0 }, { note: 'G3', time: 4.6, duration: 1.0 },
      { note: 'A3', time: 5.8, duration: 1.0 }, { note: 'B3', time: 7.0, duration: 1.0 },
      { note: 'C4', time: 8.2, duration: 2.0 }
    ]
  },
  {
    id: 4,
    title: "Leila Fletcher: Song of the Waves",
    difficulty: "Arpeggio & Intervals",
    notes: [
      { note: 'C4', time: 1.0, duration: 1.2 }, { note: 'E4', time: 2.5, duration: 1.2 },
      { note: 'G4', time: 4.0, duration: 1.2 }, { note: 'E4', time: 5.5, duration: 1.2 },
      { note: 'C4', time: 7.0, duration: 2.5 }
    ]
  },
  {
    id: 5,
    title: "Leila Fletcher: Organ Grinder",
    difficulty: "Bass Clef Intro",
    notes: [
      { note: 'C3', time: 1.0, duration: 1.2 }, { note: 'E3', time: 2.5, duration: 1.2 },
      { note: 'G3', time: 4.0, duration: 1.2 }, { note: 'E3', time: 5.5, duration: 1.2 },
      { note: 'C3', time: 7.0, duration: 2.5 }
    ]
  },
  {
    id: 6,
    title: "Leila Fletcher: Song of Long Ago",
    difficulty: "Review Melody",
    notes: [
      { note: 'C4', time: 1.0, duration: 1.2 }, { note: 'E4', time: 2.5, duration: 1.2 },
      { note: 'G4', time: 4.0, duration: 1.2 }, { note: 'E4', time: 5.5, duration: 1.2 },
      { note: 'C4', time: 7.0, duration: 2.5 }
    ]
  },
  {
    id: 7,
    title: "Leila Fletcher: Evening Bells",
    difficulty: "Inverted Intervals",
    notes: [
      { note: 'G3', time: 1.0, duration: 1.2 }, { note: 'E3', time: 2.5, duration: 1.2 },
      { note: 'C3', time: 4.0, duration: 1.2 }, { note: 'E3', time: 5.5, duration: 1.2 },
      { note: 'G3', time: 7.0, duration: 2.5 }
    ]
  },
  {
    id: 8,
    title: "Leila Fletcher: On the Way to School",
    difficulty: "Walking Tempo",
    notes: [
      { note: 'C4', time: 1.0, duration: 1.0 }, { note: 'D4', time: 2.2, duration: 1.0 },
      { note: 'E4', time: 3.4, duration: 1.0 }, { note: 'F4', time: 4.6, duration: 1.0 },
      { note: 'G4', time: 5.8, duration: 2.5 }
    ]
  },
  {
    id: 9,
    title: "Leila Fletcher: My New Bike",
    difficulty: "Extended Scale",
    notes: [
      { note: 'G3', time: 1.0, duration: 1.0 }, { note: 'A3', time: 2.2, duration: 1.0 },
      { note: 'B3', time: 3.4, duration: 1.0 }, { note: 'C4', time: 4.6, duration: 1.0 },
      { note: 'D4', time: 5.8, duration: 1.0 }, { note: 'E4', time: 7.0, duration: 1.0 },
      { note: 'F4', time: 8.2, duration: 1.0 }, { note: 'G4', time: 9.4, duration: 2.5 }
    ]
  },
  {
    id: 10,
    title: "Leila Fletcher: The Dancing Bear",
    difficulty: "Staccato & Dynamics",
    notes: [
      { note: 'C3', time: 1.0, duration: 0.8 }, { note: 'D3', time: 2.0, duration: 0.8 },
      { note: 'E3', time: 3.0, duration: 0.8 }, { note: 'C3', time: 4.0, duration: 0.8 },
      { note: 'D3', time: 5.0, duration: 0.8 }, { note: 'E3', time: 6.0, duration: 1.5 }
    ]
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState('maestro');
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [lastNotePlayed, setLastNotePlayed] = useState('');

  const handleNotePlayback = (note) => {
    setLastNotePlayed(note);
    setTimeout(() => setLastNotePlayed(''), 100);
  };

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
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

      {/* Main Two-Column Content Layout */}
      <div style={{ display: 'flex', flex: 1, gap: 16, minHeight: 0 }}>
        {/* Left column sidebar for tutorial songs */}
        <div className="glass-panel" style={{ width: '280px', height: '100%', display: 'flex', flexDirection: 'column', gap: 8, padding: 12, overflow: 'hidden' }}>
          <h3 className="text-gradient" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem' }}>
            <BookOpen size={16} /> Tutorial Songs
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 8 }}>
            Select a tune to learn using interactive cues.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }} className="song-list-scrollable">
            {SONGS.map(song => (
              <div
                key={song.id}
                className={`song-card ${selectedSong.id === song.id ? 'active' : ''}`}
                style={{ padding: '8px 12px' }}
                onClick={() => {
                  setSelectedSong(song);
                }}
              >
                <div className="song-name" style={{ fontSize: '0.85rem' }}>{song.title}</div>
                <div className="song-diff" style={{ fontSize: '0.7rem' }}>{song.difficulty}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right column with Maestro & Keyboard */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {activeTab === 'maestro' ? (
            <MaestroMode pianoNotePlayed={lastNotePlayed} selectedSong={selectedSong} />
          ) : (
            <div className="glass-panel" style={{ padding: 12, minHeight: '80px' }}>
              <h2 className="text-gradient" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, fontSize: '1.25rem' }}>
                <Layers size={20} /> Synth Focus Mode
              </h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 0 }}>
                Use your PC keyboard or mouse/touch screen to unleash customized timbres and creative musical ideas.
              </p>
            </div>
          )}

          {/* Piano Component (Always accessible for continuous experimentation) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <h3 style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', paddingLeft: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <Eye size={14} className="text-gradient" /> Visual Keyboard & Sound Settings
            </h3>
            <Piano notePlayCallback={handleNotePlayback} />
          </div>
        </main>
      </div>

      {/* Modern Footer section */}
      <footer className="app-footer" style={{ padding: '4px 0', fontSize: '0.75rem', marginTop: 'auto' }}>
        Piano Maestro Virtual • Premium Synthesis & Musical Education Platform • 2026
      </footer>
    </div>
  );
}
