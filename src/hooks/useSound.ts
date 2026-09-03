// src/hooks/useSound.ts
import { useRef, useCallback, useState, useEffect } from 'react';

type SoundType = 'click' | 'correct' | 'wrong' | 'level-up' | 'achievement' | 'navigate' | 'complete';

interface SoundConfig {
  type: OscillatorType;
  frequencies: number[];
  duration: number;
  volume: number;
}

const SOUND_CONFIGS: Record<SoundType, SoundConfig> = {
  click:      { type: 'sine',     frequencies: [800],              duration: 0.08, volume: 0.3 },
  correct:    { type: 'sine',     frequencies: [523, 659],         duration: 0.2,  volume: 0.3 },
  wrong:      { type: 'square',   frequencies: [400, 200],         duration: 0.25, volume: 0.2 },
  'level-up': { type: 'sine',     frequencies: [523, 659, 784],    duration: 0.4,  volume: 0.3 },
  achievement:{ type: 'sine',     frequencies: [1047, 1319, 1568, 2093], duration: 0.5, volume: 0.25 },
  navigate:   { type: 'sine',     frequencies: [400, 600],         duration: 0.15, volume: 0.15 },
  complete:   { type: 'sine',     frequencies: [523, 659, 784, 1047], duration: 0.6, volume: 0.3 },
};

function getStoredVolume(): number {
  try {
    const v = localStorage.getItem('amra-sound-volume');
    return v ? parseFloat(v) : 0.3;
  } catch { return 0.3; }
}

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const [volume, setVolumeState] = useState(getStoredVolume);
  const [muted, setMuted] = useState(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  const setVolume = useCallback((v: number) => {
    setVolumeState(v);
    try { localStorage.setItem('amra-sound-volume', String(v)); } catch {}
  }, []);

  const play = useCallback((type: SoundType) => {
    if (muted) return;
    const config = SOUND_CONFIGS[type];
    const audio = getCtx();
    const now = audio.currentTime;
    const vol = volume * config.volume;

    config.frequencies.forEach((freq, i) => {
      const osc = audio.createOscillator();
      const gain = audio.createGain();

      osc.type = config.type;
      osc.frequency.setValueAtTime(freq, now);

      const noteDelay = i * (config.duration / config.frequencies.length);
      const noteDur = config.duration / config.frequencies.length;

      gain.gain.setValueAtTime(0, now + noteDelay);
      gain.gain.linearRampToValueAtTime(vol, now + noteDelay + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + noteDur);

      osc.connect(gain);
      gain.connect(audio.destination);

      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + noteDur + 0.05);
    });
  }, [muted, volume, getCtx]);

  useEffect(() => {
    return () => {
      if (ctxRef.current) {
        ctxRef.current.close();
      }
    };
  }, []);

  return { play, volume, setVolume, muted, setMuted };
}
