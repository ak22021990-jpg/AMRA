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
      background: 'var(--surface)', borderRadius: 12, padding: '24px',
      border: '1px solid var(--border)',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.5)',
      color: 'var(--fg)', display: 'flex', flexDirection: 'column', gap: 16,
      marginBottom: 24,
    }}>
      <audio ref={audioRef} src={src} preload="metadata" aria-label={label || 'Audio clip'} />

      {label && (
        <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 700, letterSpacing: '0.15em',
          textTransform: 'uppercase', color: 'var(--accent)' }}>
          {label}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <button
          onClick={togglePlay}
          aria-label={playing ? 'Pause audio' : 'Play audio'}
          style={{
            background: playing ? 'rgba(56, 189, 248, 0.2)' : 'var(--surface-subtle)', 
            color: playing ? 'var(--accent)' : 'var(--muted)',
            border: `1px solid ${playing ? 'var(--accent)' : 'var(--border)'}`, 
            borderRadius: '50%', width: 48, height: 48,
            cursor: 'pointer', fontSize: 18, display: 'flex', alignItems: 'center',
            justifyContent: 'center', flexShrink: 0, fontWeight: 700,
            transition: 'all 0.2s',
            boxShadow: playing ? '0 0 15px rgba(56, 189, 248, 0.4)' : 'none',
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
              height: 4, borderRadius: 2, background: 'var(--border)',
              overflow: 'hidden', cursor: 'pointer',
            }}
          >
            <div style={{
              height: '100%', width: `${pct}%`,
              background: 'var(--accent)',
              boxShadow: '0 0 10px var(--accent)',
              transition: 'width 0.2s linear',
            }} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--muted)', marginTop: 8 }}>
            <span>{formatTime(progress)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>

      {!hasPlayed && (
        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--warn)', fontWeight: 600 }}>
          ⚠ Press play to listen before answering
        </div>
      )}
    </div>
  );
}
