import React, { useState, useEffect, useRef } from 'react';
import { Play, Square, Award } from 'lucide-react';

const WHITE_KEYS_NOTES = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];

export default function MaestroMode({ pianoNotePlayed, selectedSong }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [hits, setHits] = useState(0);
  const [totalPossibleHits, setTotalPossibleHits] = useState(0);
  const [visibleNotes, setVisibleNotes] = useState([]);
  const [hitNotes, setHitNotes] = useState(new Set());
  
  const timerRef = useRef(null);
  const songStartTimeRef = useRef(0);
  
  // Columns matching exactly 15 white keys for perfect alignment!
  const getNoteLeftPosition = (note) => {
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
        const updatedVisible = selectedSong.notes.map((noteItem, index) => {
          if (hitNotes.has(index)) return null;

          const fallTime = noteItem.time - elapsed;
          let topPercentage = -50;
          
          // Notes come from top (0%) down to targets (85%)
          if (fallTime <= 2.5 && fallTime >= -0.7) {
            topPercentage = ((2.5 - fallTime) / 3.2) * 85;
          }

          return {
            ...noteItem,
            index,
            top: topPercentage,
            expired: fallTime < -0.7,
            hit: fallTime >= -0.7 && fallTime <= 0.7
          };
        }).filter(Boolean).filter(n => n.top >= -10 && !n.expired);

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
  }, [isPlaying, selectedSong, hitNotes]);

  // Handle note hitting feedback
  useEffect(() => {
    if (pianoNotePlayed && isPlaying) {
      const matchedNote = visibleNotes.find(n => n.note === pianoNotePlayed && n.hit);
      if (matchedNote) {
        setScore(prev => prev + 100);
        setHits(prev => prev + 1);
        setHitNotes(prev => new Set(prev).add(matchedNote.index));
        setVisibleNotes(prev => prev.filter(n => n !== matchedNote));
      }
    }
  }, [pianoNotePlayed, isPlaying, visibleNotes]);

  const startSong = () => {
    setScore(0);
    setHits(0);
    setHitNotes(new Set());
    setTotalPossibleHits(selectedSong ? selectedSong.notes.length : 0);
    setIsPlaying(true);
  };

  const stopSong = () => {
    setIsPlaying(false);
    setScore(0);
    setHits(0);
    setHitNotes(new Set());
  };

  return (
    <div className="glass-panel maestro-panel" style={{ height: '260px', padding: '12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
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
      <div className="falling-notes-area" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: 'rgba(0,0,0,0.1)', borderRadius: 8, borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
        {/* Guitar Hero Style Hit Receptacles / Circles */}
        <div className="guitar-hero-targets" style={{ position: 'absolute', bottom: '15px', left: 0, right: 0, height: '24px', display: 'flex', borderTop: '2px dashed rgba(255,255,255,0.15)', pointerEvents: 'none' }}>
          {WHITE_KEYS_NOTES.map((note) => {
            const leftOffset = getNoteLeftPosition(note);
            const isHitByPlayedNote = pianoNotePlayed === note;
            return (
              <div 
                key={note} 
                style={{
                  position: 'absolute',
                  left: `${leftOffset}%`,
                  bottom: '-5px',
                  width: '22px',
                  height: '22px',
                  border: isHitByPlayedNote ? '3px solid var(--accent-cyan)' : '2px solid rgba(255,255,255,0.25)',
                  background: isHitByPlayedNote ? 'rgba(0, 242, 254, 0.4)' : 'transparent',
                  borderRadius: '50%',
                  boxShadow: isHitByPlayedNote ? '0 0 15px var(--accent-cyan)' : 'none',
                  transition: 'all 0.05s ease'
                }}
              />
            );
          })}
        </div>

        {/* Falling Note Blocks */}
        {visibleNotes.map((noteItem) => {
          const leftOffset = getNoteLeftPosition(noteItem.note);
          return (
            <div
              key={noteItem.index}
              className={`falling-note ${noteItem.hit ? 'hit' : ''}`}
              style={{
                top: `${noteItem.top}%`,
                left: `${leftOffset}%`,
                width: '24px',
                height: `${(noteItem.duration || 1) * 35}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                borderRadius: '4px',
                background: 'linear-gradient(135deg, var(--accent-indigo) 0%, var(--accent-cyan) 100%)',
                boxShadow: noteItem.hit ? '0 0 12px var(--accent-cyan)' : 'none',
                position: 'absolute',
                zIndex: 5
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
