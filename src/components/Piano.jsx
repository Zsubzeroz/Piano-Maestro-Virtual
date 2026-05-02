import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Music, Waves, Sparkles } from 'lucide-react';

// Frequencies and PC Keyboard mappings for 15 White Keys + Matching Black Keys
const WHITE_KEYS = [
  { note: 'C3', freq: 130.81, label: 'A', solfege: 'Dó' },
  { note: 'D3', freq: 146.83, label: 'S', solfege: 'Ré' },
  { note: 'E3', freq: 164.81, label: 'D', solfege: 'Mi' },
  { note: 'F3', freq: 174.61, label: 'F', solfege: 'Fá' },
  { note: 'G3', freq: 196.00, label: 'G', solfege: 'Sol' },
  { note: 'A3', freq: 220.00, label: 'H', solfege: 'Lá' },
  { note: 'B3', freq: 246.94, label: 'J', solfege: 'Si' },
  { note: 'C4', freq: 261.63, label: 'K', solfege: 'Dó' },
  { note: 'D4', freq: 293.66, label: 'L', solfege: 'Ré' },
  { note: 'E4', freq: 329.63, label: ';', solfege: 'Mi' },
  { note: 'F4', freq: 349.23, label: 'Z', solfege: 'Fá' },
  { note: 'G4', freq: 392.00, label: 'X', solfege: 'Sol' },
  { note: 'A4', freq: 440.00, label: 'C', solfege: 'Lá' },
  { note: 'B4', freq: 493.88, label: 'V', solfege: 'Si' },
  { note: 'C5', freq: 523.25, label: 'B', solfege: 'Dó' }
];

const BLACK_KEYS = [
  { note: 'C#3', freq: 138.59, label: 'W', leftOffset: 6.67, solfege: 'Dó#' },
  { note: 'D#3', freq: 155.56, label: 'E', leftOffset: 13.33, solfege: 'Ré#' },
  { note: 'F#3', freq: 185.00, label: 'T', leftOffset: 26.67, solfege: 'Fá#' },
  { note: 'G#3', freq: 207.65, label: 'Y', leftOffset: 33.33, solfege: 'Sol#' },
  { note: 'A#3', freq: 233.08, label: 'U', leftOffset: 40.00, solfege: 'Lá#' },
  { note: 'C#4', freq: 277.18, label: 'O', leftOffset: 53.33, solfege: 'Dó#' },
  { note: 'D#4', freq: 311.13, label: 'P', leftOffset: 60.00, solfege: 'Ré#' },
  { note: 'F#4', freq: 369.99, label: '[', leftOffset: 73.33, solfege: 'Fá#' },
  { note: 'G#4', freq: 415.30, label: ']', leftOffset: 80.00, solfege: 'Sol#' },
  { note: 'A#4', freq: 466.16, label: '\\', leftOffset: 86.67, solfege: 'Lá#' }
];

// Combine all keys for keyboard shortcuts mapping
const KEY_MAP = {};
[...WHITE_KEYS, ...BLACK_KEYS].forEach(k => {
  KEY_MAP[k.label.toLowerCase()] = k;
});

export default function Piano({ notePlayCallback }) {
  const [soundType, setSoundType] = useState('piano');
  const [volume, setVolume] = useState(0.5);
  const [attack, setAttack] = useState(0.01);
  const [release, setRelease] = useState(0.6);
  const [activeNotes, setActiveNotes] = useState({});

  // Using refs to preserve audio nodes between renders
  const audioContextRef = useRef(null);
  const gainNodeRef = useRef(null);
  const activeOscillators = useRef({});

  // Initialize Web Audio API context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = volume;
    }
  }, [volume]);

  // Keyboard Event Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.repeat) return;
      const keyData = KEY_MAP[e.key.toLowerCase()];
      if (keyData) {
        startNote(keyData.note, keyData.freq);
      }
    };

    const handleKeyUp = (e) => {
      const keyData = KEY_MAP[e.key.toLowerCase()];
      if (keyData) {
        stopNote(keyData.note);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [soundType, volume, attack, release]);

  const startNote = (note, freq) => {
    if (!audioContextRef.current) return;
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Mark as visually active
    setActiveNotes(prev => ({ ...prev, [note]: true }));

    // Execute callback for Learning/Maestro mode
    if (notePlayCallback) {
      notePlayCallback(note);
    }

    // Stop existing oscillators for this note
    if (activeOscillators.current[note]) {
      try {
        activeOscillators.current[note].oscillators.forEach(osc => osc.stop());
      } catch (err) {}
    }

    const oscillators = [];

    // Main envelope
    const noteGain = audioContextRef.current.createGain();
    noteGain.connect(gainNodeRef.current);

    // Advanced dynamic wave settings
    if (soundType === 'piano') {
      // Create body (triangle wave)
      const oscBody = audioContextRef.current.createOscillator();
      oscBody.type = 'triangle';
      oscBody.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
      oscBody.connect(noteGain);

      // Create overtones (richer sound profile like an acoustic piano)
      const oscOvertone = audioContextRef.current.createOscillator();
      const overtoneGain = audioContextRef.current.createGain();
      oscOvertone.type = 'sine';
      oscOvertone.frequency.setValueAtTime(freq * 2, audioContextRef.current.currentTime);
      oscOvertone.connect(overtoneGain);
      overtoneGain.connect(noteGain);

      // Amplitude decay (how string resonance falls off quickly when key strikes)
      noteGain.gain.setValueAtTime(0.001, audioContextRef.current.currentTime);
      noteGain.gain.linearRampToValueAtTime(1.0, audioContextRef.current.currentTime + attack);
      noteGain.gain.exponentialRampToValueAtTime(0.2, audioContextRef.current.currentTime + attack + 0.35);

      overtoneGain.gain.setValueAtTime(0.2, audioContextRef.current.currentTime);
      overtoneGain.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current.currentTime + attack + 0.25);

      oscBody.start();
      oscOvertone.start();
      oscillators.push(oscBody, oscOvertone);
    } else {
      const osc = audioContextRef.current.createOscillator();
      osc.connect(noteGain);
      osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);

      if (soundType === 'synth') {
        osc.type = 'square';
        noteGain.gain.setValueAtTime(0.01, audioContextRef.current.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.8, audioContextRef.current.currentTime + attack);
      } else if (soundType === 'organ') {
        osc.type = 'sawtooth';
        noteGain.gain.setValueAtTime(0.01, audioContextRef.current.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.7, audioContextRef.current.currentTime + attack);
      } else if (soundType === 'bell') {
        osc.type = 'sine';
        noteGain.gain.setValueAtTime(0.01, audioContextRef.current.currentTime);
        noteGain.gain.linearRampToValueAtTime(1.2, audioContextRef.current.currentTime + attack);
      }

      osc.start();
      oscillators.push(osc);
    }

    // Store references
    activeOscillators.current[note] = { oscillators, gainNode: noteGain };
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const copy = { ...prev };
      delete copy[note];
      return copy;
    });

    const nodeData = activeOscillators.current[note];
    if (nodeData) {
      const { oscillators, gainNode } = nodeData;
      try {
        const now = audioContextRef.current.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + release);
        oscillators.forEach(osc => osc.stop(now + release));
      } catch (err) {}
      delete activeOscillators.current[note];
    }
  };

  return (
    <div className="glass-panel piano-section">
      <div className="piano-controls">
        <div className="control-group">
          <Music className="text-gradient" size={18} />
          <span className="control-label">Timbre</span>
          <select 
            value={soundType} 
            onChange={(e) => setSoundType(e.target.value)}
            className="custom-select"
          >
            <option value="piano">Classical Piano</option>
            <option value="synth">Digital Synth</option>
            <option value="organ">Electric Organ</option>
            <option value="bell">Music Box</option>
          </select>
        </div>

        <div className="control-group">
          <Volume2 className="text-gradient" size={18} />
          <span className="control-label">Volume</span>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01" 
            value={volume}
            onChange={(e) => setVolume(parseFloat(e.target.value))}
            className="custom-slider"
          />
        </div>

        <div className="control-group">
          <Waves className="text-gradient" size={18} />
          <span className="control-label">Attack</span>
          <input 
            type="range" 
            min="0.01" 
            max="0.5" 
            step="0.01" 
            value={attack}
            onChange={(e) => setAttack(parseFloat(e.target.value))}
            className="custom-slider"
          />
        </div>

        <div className="control-group">
          <Sparkles className="text-gradient" size={18} />
          <span className="control-label">Release</span>
          <input 
            type="range" 
            min="0.01" 
            max="1.5" 
            step="0.05" 
            value={release}
            onChange={(e) => setRelease(parseFloat(e.target.value))}
            className="custom-slider"
          />
        </div>
      </div>

      <div className="piano-keyboard-wrapper">
        {WHITE_KEYS.map((k) => (
          <div
            key={k.note}
            className={`white-key ${activeNotes[k.note] ? 'active' : ''}`}
            onMouseDown={() => startNote(k.note, k.freq)}
            onMouseUp={() => stopNote(k.note)}
            onMouseLeave={() => stopNote(k.note)}
            onTouchStart={(e) => { e.preventDefault(); startNote(k.note, k.freq); }}
            onTouchEnd={(e) => { e.preventDefault(); stopNote(k.note); }}
            style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: 2 }}
          >
            <span style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{k.solfege}</span>
            <span style={{ fontSize: '0.75rem', opacity: 0.65 }}>{k.label}</span>
          </div>
        ))}

        {BLACK_KEYS.map((k) => (
          <div
            key={k.note}
            className={`black-key ${activeNotes[k.note] ? 'active' : ''}`}
            style={{ 
              left: `calc(${k.leftOffset}% + 1px)`,
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'flex-end', 
              alignItems: 'center', 
              gap: 1
            }}
            onMouseDown={(e) => { e.stopPropagation(); startNote(k.note, k.freq); }}
            onMouseUp={(e) => { e.stopPropagation(); stopNote(k.note); }}
            onMouseLeave={(e) => { e.stopPropagation(); stopNote(k.note); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); startNote(k.note, k.freq); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); stopNote(k.note); }}
          >
            <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#fff' }}>{k.solfege}</span>
            <span style={{ fontSize: '0.65rem', opacity: 0.75, color: '#ddd' }}>{k.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
