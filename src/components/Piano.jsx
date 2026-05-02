import React, { useEffect, useState, useRef } from 'react';
import { Volume2, Music, Waves, Sparkles } from 'lucide-react';

// Frequencies and PC Keyboard mappings for 15 White Keys + Matching Black Keys
const WHITE_KEYS = [
  { note: 'C4', freq: 261.63, label: 'A' },
  { note: 'D4', freq: 293.66, label: 'S' },
  { note: 'E4', freq: 329.63, label: 'D' },
  { note: 'F4', freq: 349.23, label: 'F' },
  { note: 'G4', freq: 392.00, label: 'G' },
  { note: 'A4', freq: 440.00, label: 'H' },
  { note: 'B4', freq: 493.88, label: 'J' },
  { note: 'C5', freq: 523.25, label: 'K' },
  { note: 'D5', freq: 587.33, label: 'L' },
  { note: 'E5', freq: 659.25, label: ';' },
  { note: 'F5', freq: 698.46, label: 'Z' },
  { note: 'G5', freq: 783.99, label: 'X' },
  { note: 'A5', freq: 880.00, label: 'C' },
  { note: 'B5', freq: 987.77, label: 'V' },
  { note: 'C6', freq: 1046.50, label: 'B' }
];

const BLACK_KEYS = [
  { note: 'C#4', freq: 277.18, label: 'W', leftOffset: 6.67 },
  { note: 'D#4', freq: 311.13, label: 'E', leftOffset: 13.33 },
  { note: 'F#4', freq: 369.99, label: 'T', leftOffset: 26.67 },
  { note: 'G#4', freq: 415.30, label: 'Y', leftOffset: 33.33 },
  { note: 'A#4', freq: 466.16, label: 'U', leftOffset: 40.00 },
  { note: 'C#5', freq: 554.37, label: 'O', leftOffset: 53.33 },
  { note: 'D#5', freq: 622.25, label: 'P', leftOffset: 60.00 },
  { note: 'F#5', freq: 739.99, label: '[', leftOffset: 73.33 },
  { note: 'G#5', freq: 830.61, label: ']', leftOffset: 80.00 },
  { note: 'A#5', freq: 932.33, label: '\\', leftOffset: 86.67 }
];

// Combine all keys for keyboard shortcuts mapping
const KEY_MAP = {};
[...WHITE_KEYS, ...BLACK_KEYS].forEach(k => {
  KEY_MAP[k.label.toLowerCase()] = k;
});

export default function Piano({ notePlayCallback }) {
  const [soundType, setSoundType] = useState('piano');
  const [volume, setVolume] = useState(0.4);
  const [attack, setAttack] = useState(0.05);
  const [release, setRelease] = useState(0.3);
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
        activeOscillators.current[note].stop();
      } catch (err) {}
    }

    // Create a new oscillator
    const osc = audioContextRef.current.createOscillator();
    const noteGain = audioContextRef.current.createGain();

    osc.connect(noteGain);
    noteGain.connect(gainNodeRef.current);

    // Dynamic wave settings based on selected soundType
    if (soundType === 'piano') {
      osc.type = 'triangle';
      noteGain.gain.setValueAtTime(0.01, audioContextRef.current.currentTime);
      noteGain.gain.linearRampToValueAtTime(1.0, audioContextRef.current.currentTime + attack);
    } else if (soundType === 'synth') {
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

    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);
    osc.start();

    // Store references
    activeOscillators.current[note] = { oscillator: osc, gainNode: noteGain };
  };

  const stopNote = (note) => {
    setActiveNotes(prev => {
      const copy = { ...prev };
      delete copy[note];
      return copy;
    });

    const nodeData = activeOscillators.current[note];
    if (nodeData) {
      const { oscillator, gainNode } = nodeData;
      try {
        const now = audioContextRef.current.currentTime;
        gainNode.gain.setValueAtTime(gainNode.gain.value, now);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + release);
        oscillator.stop(now + release);
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
          >
            {k.label}
          </div>
        ))}

        {BLACK_KEYS.map((k) => (
          <div
            key={k.note}
            className={`black-key ${activeNotes[k.note] ? 'active' : ''}`}
            style={{ left: `calc(${k.leftOffset}% + 1px)` }}
            onMouseDown={(e) => { e.stopPropagation(); startNote(k.note, k.freq); }}
            onMouseUp={(e) => { e.stopPropagation(); stopNote(k.note); }}
            onMouseLeave={(e) => { e.stopPropagation(); stopNote(k.note); }}
            onTouchStart={(e) => { e.preventDefault(); e.stopPropagation(); startNote(k.note, k.freq); }}
            onTouchEnd={(e) => { e.preventDefault(); e.stopPropagation(); stopNote(k.note); }}
          >
            {k.label}
          </div>
        ))}
      </div>
    </div>
  );
}
