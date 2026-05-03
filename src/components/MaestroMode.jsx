import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Award } from 'lucide-react';

const WHITE_KEYS_NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export default function MaestroMode({ pianoNotePlayed, selectedSong }) {
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
    if (isPlaying && selectedSong) {
      songStartTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const elapsed = (Date.now() - songStartTimeRef.current) / 1000;
        
        // Push notes from current song that should be falling
        const updatedVisible = selectedSong.notes.map((noteItem) => {
          const fallTime = noteItem.time - elapsed;
          let topPercentage = -50;
          
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
      const matchedNote = visibleNotes.find(n => n.note === pianoNotePlayed && n.hit);
      if (matchedNote) {
        setScore(prev => prev + 100);
        setHits(prev => prev + 1);
        setVisibleNotes(prev => prev.filter(n => n !== matchedNote));
      }
    }
  }, [pianoNotePlayed, isPlaying, visibleNotes]);

  const startSong = () => {
    setScore(0);
    setHits(0);
    setTotalPossibleHits(selectedSong ? selectedSong.notes.length : 0);
    setIsPlaying(true);
  };

  const stopSong = () => {
    setIsPlaying(false);
  };

  return (
    <div className="glass-panel maestro-panel" style={{ height: '240px', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Visualizer header + Controls */}
      <div className="visualizer-header" style={{ paddingBottom: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Award size={20} className="text-gradient-accent" />
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Maestro Precision Score</div>
              <div className="feedback-score text-gradient-accent" style={{ fontSize: '1.2rem' }}>{score} pts</div>
            </div>
          </div>

          {!isPlaying ? (
            <button className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={startSong}>
              <Play size={16} /> Play Lesson
            </button>
          ) : (
            <button className="btn-accent" style={{ padding: '6px 14px', fontSize: '0.85rem' }} onClick={stopSong}>
              <Square size={16} /> Stop
            </button>
          )}
        </div>

        {isPlaying && (
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)', animation: 'pulse 1.5s infinite' }}>
            • Precision listening activated
          </div>
        )}
      </div>

      {/* Main Falling Notes Visualization Area */}
      <div className="falling-notes-area" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.1)', borderRadius: 8 }}>
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
  );
}
