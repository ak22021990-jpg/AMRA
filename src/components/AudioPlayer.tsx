import { useRef, useState, useEffect } from 'react';

interface AudioPlayerProps {
  src: string;
  onPlay?: () => void;
  label?: string;
}

export default function AudioPlayer({ src, onPlay, label }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const onLoaded = () => setDuration(audio.duration);
    const onTimeUpdate = () => {
      setProgress(audio.currentTime);
    };
    const onEnded = () => setPlaying(false);
    audio.addEventListener('loadedmetadata', onLoaded);
    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('loadedmetadata', onLoaded);
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
      if (!hasPlayed) {
        setHasPlayed(true);
        onPlay?.();
      }
    }
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const pct = duration > 0 ? (progress / duration) * 100 : 0;

  return (
    <div style={{
      background: '#101828', borderRadius: 18, padding: '20px 24px',
      color: 'white', display: 'flex', flexDirection: 'column', gap: 14,
      marginBottom: 20,
    }}>
      <audio ref={audioRef} src={src} preload="metadata" aria-label={label || 'Audio clip'} />

      {label && (
        <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: '#65d1ff' }}>
          {label}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause audio' : 'Play audio'}
          style={{
            background: playing ? '#2563eb' : 'white', color: playing ? 'white' : '#101828',
            border: 'none', borderRadius: '50%', width: 44, height: 44,
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, fontWeight: 700,
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>

        <div style={{ flex: 1 }}>
          <div
            role="slider"
            aria-label="Audio progress"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pct)}
            style={{
              height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.15)',
              overflow: 'hidden', cursor: 'pointer',
            }}
          >
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'linear-gradient(90deg, #2563eb, #7c3aed)',
              transition: 'width 0.2s',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {!hasPlayed && (
        <div style={{ fontSize: 12, color: '#ffc65c', fontWeight: 700 }}>
          ⚠ Press play to listen before answering
        </div>
      )}
    </div>
  );
}
