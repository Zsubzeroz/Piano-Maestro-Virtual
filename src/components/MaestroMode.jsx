import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Award, Music, BookOpen } from 'lucide-react';

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

const WHITE_KEYS_NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export default function MaestroMode({ pianoNotePlayed }) {
  const [selectedSong, setSelectedSong] = useState(SONGS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [totalPossibleHits, setTotalPossibleHits] = useState(0);
  const [visibleNotes, setVisibleNotes] = useState([]);
  
  const timerRef = useRef(null);
  const songStartTimeRef = useRef(0);
  
  // Columns matching exactly 15 white keys for perfect alignment!
  const getNoteLeftPosition = (note) => {
    // Determine note column index
    const cleanNote = note.replace('#', '');
    const colIndex = WHITE_KEYS_NOTES.indexOf(cleanNote);
    if (colIndex === -1) return 0;
    return (colIndex / 15) * 100;
  };

  useEffect(() => {
    if (isPlaying) {
      songStartTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - songStartTimeRef.current) / 1000;
        
        // Push notes from current song that should be falling
        const updatedVisible = selectedSong.notes.map((noteItem) => {
          // calculate falling position based on elapsed time and target note play time
          const fallTime = noteItem.time - elapsed;
          
          // Note drops down from top (0%) to target hit area (100%)
          // If fallTime > 2s it's too high/far
          // If fallTime < -0.3s it passed the boundary
          let topPercentage = -50;
          let hitStatus = false;
          
          if (fallTime <= 2.5 && fallTime >= -0.3) {
            topPercentage = ((2.5 - fallTime) / 2.8) * 100;
          }

          return {
            ...noteItem,
            top: topPercentage,
            expired: fallTime < -0.5,
            hit: fallTime >= -0.5 && fallTime <= 0.5
          };
        }).filter(n => n.top >= -10 && !n.expired);

        setVisibleNotes(updatedVisible);

        // Check if song has finished
        const lastNoteTime = selectedSong.notes[selectedSong.notes.length - 1].time;
        if (elapsed > lastNoteTime + 1.5) {
          stopSong();
        }
      }, 50);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setVisibleNotes([]);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, selectedSong]);

  // Handle note hitting feedback
  useEffect(() => {
    if (pianoNotePlayed && isPlaying) {
      // Cross-reference any active falling note that aligns with the target pitch
      const matchedNote = visibleNotes.find(n => n.note === pianoNotePlayed && n.hit);
      if (matchedNote) {
        setScore(prev => prev + 100);
        setHits(prev => prev + 1);
        // Remove visually once hit
        setVisibleNotes(prev => prev.filter(n => n !== matchedNote));
      }
    }
  }, [pianoNotePlayed, isPlaying, visibleNotes]);

  const startSong = () => {
    setScore(0);
    setHits(0);
    setTotalPossibleHits(selectedSong.notes.length);
    setIsPlaying(true);
  };

  const stopSong = () => {
    setIsPlaying(false);
  };

  return (
    <div className="glass-panel maestro-panel" style={{ height: '270px', padding: '12px' }}>
      {/* Sidebar containing Song Options */}
      <div className="song-list" style={{ maxHeight: '246px', overflowY: 'auto' }}>
        <h3 className="text-gradient" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6, fontSize: '1rem' }}>
          <BookOpen size={16} /> Tutorial Songs
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 8 }}>
          Select a tune to learn using interactive cues.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, overflowY: 'auto', flex: 1 }}>
          {SONGS.map(song => (
            <div
              key={song.id}
              className={`song-card ${selectedSong.id === song.id ? 'active' : ''}`}
              style={{ padding: '8px 12px' }}
              onClick={() => {
                if (!isPlaying) {
                  setSelectedSong(song);
                  setScore(0);
                  setHits(0);
                }
              }}
            >
              <div className="song-name" style={{ fontSize: '0.85rem' }}>{song.title}</div>
              <div className="song-diff" style={{ fontSize: '0.7rem' }}>{song.difficulty}</div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', paddingTop: 8 }}>
          {!isPlaying ? (
            <button className="btn-primary" style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem' }} onClick={startSong}>
              <Play size={16} /> Play Lesson
            </button>
          ) : (
            <button className="btn-accent" style={{ width: '100%', padding: '6px 12px', fontSize: '0.85rem' }} onClick={stopSong}>
              <Square size={16} /> Stop
            </button>
          )}
        </div>
      </div>

      {/* Main Falling Notes Visualization Area */}
      <div className="visualizer-wrapper" style={{ height: '100%' }}>
        <div className="visualizer-header" style={{ paddingBottom: 6 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={18} className="text-gradient-accent" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Maestro Precision Score</div>
              <div className="feedback-score text-gradient-accent" style={{ fontSize: '1.1rem' }}>{score} pts</div>
            </div>
          </div>
          {isPlaying && (
            <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}>
              • Precision listening activated
            </div>
          )}
        </div>

        <div className="falling-notes-area" style={{ height: '180px', position: 'relative' }}>
          {visibleNotes.map((noteItem, idx) => {
            const leftOffset = getNoteLeftPosition(noteItem.note);
            return (
              <div
                key={idx}
                className={`falling-note ${noteItem.hit ? 'hit' : ''}`}
                style={{
                  top: `${noteItem.top}%`,
                  left: `${leftOffset}%`,
                  height: `${(noteItem.duration || 1) * 35}px`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontSize: '0.65rem',
                  fontWeight: 'bold',
                  borderRadius: '4px'
                }}
              >
                {noteItem.note}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
