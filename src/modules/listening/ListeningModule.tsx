import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  {
    sectionName: 'Customer Complaint — Disputed Charge',
    audioFile: `${import.meta.env.BASE_URL}audio/Customer Complaint - Audio 2 (2).mp3`,
    instruction: 'Listen to the customer call, then answer the question.',
    question: 'How much was the disputed charge?',
    options: ['$24.80', '$26.40', '$28.40', '$38.40'],
    correctIndex: 2,
    skillTag: 'listening_comprehension',
    explanation: 'The customer clearly states the disputed amount was $28.40 during the call.',
    transcript:
      'Customer: I was charged $28.40 for a ride I never took. That is not right. I need this fixed immediately. Agent: I understand your frustration. Let me look into this disputed charge for you.',
  },
  {
    sectionName: 'Fraud Conversation — Account Compromise',
    audioFile: `${import.meta.env.BASE_URL}audio/Fraud Related Conversation - Audio 3.mp3`,
    instruction: 'Listen to the fraud conversation, then answer the question.',
    question: "What were the last four digits of the customer's original phone number?",
    options: ['2241', '4421', '4412', '4221'],
    correctIndex: 3,
    skillTag: 'detail_retention',
    explanation: 'The customer mentions the last four digits 4221 when verifying their original phone number.',
    transcript:
      'Customer: Someone accessed my account and changed my phone number. My old number ended in 4221. Agent: I see the unauthorized changes. We will secure your account right away.',
  },
  {
    sectionName: 'Multiple Instructions — Agent Procedure',
    audioFile: `${import.meta.env.BASE_URL}audio/Instructions With Multiple Details - Audio 5.mp3`,
    instruction: 'Listen to the agent procedure recording, then answer the question.',
    question: 'What should the agent NOT do while reviewing the case?',
    options: [
      'Review the trip details',
      'Categorize the case',
      "Make changes to the customer's account",
      'Review the transaction',
    ],
    correctIndex: 2,
    skillTag: 'procedural_attention',
    explanation:
      'Agent procedure prohibits making account changes during the review phase — changes require supervisor approval.',
    transcript:
      "Supervisor: When reviewing a case, first review the trip details, then categorize the case. Do not make changes to the customer's account during review. Changes require supervisor approval. Finally, review the transaction.",
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];
const COUNTDOWN_SECONDS = 60;
const BAR_COUNT = 32;

// Fixed heights for idle waveform shape
function staticBarHeights(): number[] {
  return Array.from({ length: BAR_COUNT }, (_, i) => {
    if (i % 2 === 1) return 55;
    if (i % 3 === 0) return 85;
    if (i % 5 === 0) return 28;
    return 14;
  });
}

function WaveformPanel({
  audioSrc,
  onPlay,
  onPlayingChange,
}: {
  audioSrc: string;
  onPlay: () => void;
  onPlayingChange: (playing: boolean) => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [barHeights, setBarHeights] = useState<number[]>(staticBarHeights());
  const [isDragging, setIsDragging] = useState(false);
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Animate bars while playing
  useEffect(() => {
    if (playing) {
      animRef.current = setInterval(() => {
        setBarHeights(Array.from({ length: BAR_COUNT }, () => Math.floor(Math.random() * 80) + 12));
      }, 100);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      setBarHeights(staticBarHeights());
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [playing]);

  const setPlayState = (val: boolean) => {
    setPlaying(val);
    onPlayingChange(val);
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlayState(false);
    } else {
      audio.play();
      setPlayState(true);
      onPlay();
    }
  };

  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlayState(true);
    onPlay();
  };

  const formatAudioTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = Math.floor(s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;
  // Which bar index is the "playhead" (active bar)
  const playedBars = duration > 0 ? Math.floor((currentTime / duration) * BAR_COUNT) : 0;

  // Seek on scrubber interaction
  const seekToX = (clientX: number) => {
    const bar = progressBarRef.current;
    const audio = audioRef.current;
    if (!bar || !audio || duration === 0) return;
    const rect = bar.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    audio.currentTime = ratio * duration;
    setCurrentTime(audio.currentTime);
  };

  const handleTrackMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    seekToX(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;
    const onMouseMove = (e: MouseEvent) => seekToX(e.clientX);
    const onMouseUp = () => setIsDragging(false);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDragging, duration]);

  return (
    <div
      style={{
        background: 'var(--bg)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '36px 28px',
        height: '100%',
        gap: 24,
        boxSizing: 'border-box',
      }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={() => setPlayState(false)}
        onLoadedMetadata={() => setDuration(audioRef.current?.duration ?? 0)}
        onTimeUpdate={() => setCurrentTime(audioRef.current?.currentTime ?? 0)}
      />

      {/* ── Waveform bars: played = accent, unplayed = border ── */}
      <div
        style={{
          width: '100%',
          height: 100,
          display: 'flex',
          alignItems: 'center',
          gap: 3,
          cursor: 'pointer',
        }}
        onClick={(e) => {
          // clicking waveform also seeks
          const rect = e.currentTarget.getBoundingClientRect();
          const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
          const audio = audioRef.current;
          if (audio && duration > 0) {
            audio.currentTime = ratio * duration;
            setCurrentTime(audio.currentTime);
          }
        }}
      >
        {barHeights.map((h, i) => {
          const isPlayed = i < playedBars;
          const isActive = i === playedBars && playing;
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: `${h}%`,
                background: isPlayed || isActive ? 'var(--accent)' : 'var(--border)',
                borderRadius: 2,
                opacity: isPlayed ? 1 : isActive ? 1 : 0.5,
                transition: playing ? 'height 0.09s ease' : 'height 0.28s ease, background 0.15s',
                animation: isActive ? 'barPulse 0.4s ease-in-out infinite alternate' : 'none',
              }}
            />
          );
        })}
      </div>

      {/* ── Scrubber track with draggable thumb ── */}
      <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div
          ref={progressBarRef}
          onMouseDown={handleTrackMouseDown}
          style={{
            width: '100%',
            height: 5,
            background: 'var(--border)',
            position: 'relative',
            cursor: 'pointer',
            borderRadius: 2,
          }}
        >
          {/* Filled portion */}
          <div
            style={{
              width: `${progressPct}%`,
              height: '100%',
              background: 'var(--accent)',
              borderRadius: 2,
              pointerEvents: 'none',
            }}
          />
          {/* Thumb */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: `${progressPct}%`,
              transform: 'translate(-50%, -50%)',
              width: 12,
              height: 12,
              borderRadius: '50%',
              background: 'var(--accent)',
              border: '2px solid var(--bg)',
              boxShadow: '0 0 0 1px var(--accent)',
              cursor: 'grab',
              pointerEvents: 'none',
              transition: isDragging ? 'none' : 'left 0.1s linear',
            }}
          />
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: 'monospace',
            fontSize: 11,
            color: 'var(--muted)',
          }}
        >
          <span>{formatAudioTime(currentTime)}</span>
          <span>{duration > 0 ? formatAudioTime(duration) : '--:--'}</span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {/* Replay — circle ghost */}
        <button
          onClick={replay}
          title="Replay from start"
          style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            border: '1px solid var(--border)',
            background: 'transparent',
            color: 'var(--muted)',
            fontSize: 17,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'border-color 0.15s, color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--accent)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
            (e.currentTarget as HTMLButtonElement).style.color = 'var(--muted)';
          }}
        >
          ↺
        </button>

        {/* Play/pause — filled circle, Spotify-style */}
        <button
          onClick={togglePlay}
          title={playing ? 'Pause' : 'Play'}
          style={{
            width: 64,
            height: 64,
            borderRadius: '50%',
            border: 'none',
            background: 'var(--accent)',
            color: 'var(--bg)',
            fontSize: 22,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.1s, opacity 0.15s',
            fontWeight: 700,
            boxShadow: '0 4px 20px rgba(6,182,212,0.35)',
            paddingLeft: playing ? 0 : 3, // optical nudge for play triangle
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1.06)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'scale(1)';
          }}
        >
          {playing ? '⏸' : '▶'}
        </button>
      </div>
    </div>
  );
}

export default function ListeningModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(COUNTDOWN_SECONDS);

  const answeredRef = useRef(false);
  const hasPlayedRef = useRef(false);

  useEffect(() => {
    answeredRef.current = answered;
  }, [answered]);

  useEffect(() => {
    hasPlayedRef.current = hasPlayed;
  }, [hasPlayed]);

  // Reset countdown on question change
  useEffect(() => {
    setTimeLeft(COUNTDOWN_SECONDS);
  }, [current]);

  // Countdown: only ticks when hasPlayed && !audioPlaying && !answered
  useEffect(() => {
    if (!hasPlayed || audioPlaying || answered) return;
    if (timeLeft <= 0) return;

    const t = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(t);
          if (!answeredRef.current) {
            handleSelectRef.current(-1);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasPlayed, audioPlaying, answered, current]);

  const handleSelect = useCallback(
    (idx: number) => {
      if (answered || !hasPlayed) return;
      const q = questions[current];
      const isCorrect = idx === q.correctIndex;
      setSelectedIndex(idx);
      setAnswered(true);
      answeredRef.current = true;

      const newAnswers = [...answers, isCorrect];
      setAnswers(newAnswers);

      play(isCorrect ? 'correct' : 'wrong');
      recordAnswer(isCorrect);
      // No auto-advance — user clicks NEXT / FINISH
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [answered, hasPlayed, current, answers]
  );

  // Stable ref for timer callback
  const handleSelectRef = useRef(handleSelect);
  useEffect(() => {
    handleSelectRef.current = handleSelect;
  }, [handleSelect]);

  const answersRef = useRef(answers);
  useEffect(() => { answersRef.current = answers; }, [answers]);

  const handleAdvance = useCallback(() => {
    if (current + 1 < questions.length) {
      setCurrent((c) => c + 1);
      setAnswered(false);
      answeredRef.current = false;
      setSelectedIndex(null);
      setHasPlayed(false);
      hasPlayedRef.current = false;
      setAudioPlaying(false);
    } else {
      const score = answersRef.current.filter(Boolean).length;
      try {
        recordResult({
          moduleId: 'listening',
          score,
          total: questions.length,
          skillTags: questions.map((q) => q.skillTag),
          completed: true,
        });
        play('module-complete');
      } catch (_) { /* ignore */ }
      navigate('/');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current]);

  if (!candidateName) return <Navigate to="/" replace />;

  const q = questions[current];
  const isLast = current + 1 >= questions.length;

  const formatCountdown = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const timerUrgent = timeLeft < 15 && hasPlayed && !answered;

  const optionStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: '14px 20px',
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: answered || !hasPlayed ? 'default' : 'pointer',
      fontSize: 15,
      fontWeight: 600,
      display: 'flex',
      gap: 16,
      alignItems: 'center',
      transition: 'background 0.12s, border-color 0.12s',
      width: '100%',
      boxSizing: 'border-box' as const,
      userSelect: 'none' as const,
    };
    if (answered && selectedIndex === idx) {
      const correct = idx === q.correctIndex;
      return {
        ...base,
        border: `2px solid ${correct ? 'var(--pass)' : 'var(--fail)'}`,
        background: correct ? 'var(--pass-bg)' : 'var(--fail-bg)',
        color: correct ? 'var(--pass)' : 'var(--fail)',
      };
    }
    if (answered && idx === q.correctIndex) {
      return {
        ...base,
        border: '1px solid var(--pass)',
        background: 'var(--pass-bg)',
        color: 'var(--pass)',
      };
    }
    return base;
  };

  // Footer right-button config
  const rightBtn = (() => {
    if (!answered) {
      const enabled = hasPlayed;
      return {
        label: 'SUBMIT',
        enabled,
        onClick: () => { if (enabled) handleSelect(-1); },
      };
    }
    return {
      label: isLast ? 'FINISH' : 'NEXT →',
      enabled: true,
      onClick: handleAdvance,
    };
  })();

  return (
    <>
      <style>{`
        @keyframes timerPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.45; }
        }
        @keyframes barPulse {
          from { opacity: 0.7; }
          to { opacity: 1; }
        }
        @media (max-width: 767px) {
          .listening-layout {
            flex-direction: column !important;
          }
          .listening-left {
            width: 100% !important;
            height: 320px !important;
            border-right: none !important;
            border-bottom: 1px solid var(--border) !important;
          }
          .listening-right {
            width: 100% !important;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        style={{
          maxWidth: 1100,
          height: 'calc(100vh - 3px)',
          margin: '3px auto 0',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          className="listening-layout"
          style={{ display: 'flex', flexDirection: 'row', flex: 1, minHeight: 0 }}
        >
          {/* ── LEFT: Audio panel ── */}
          <div
            className="listening-left"
            style={{
              width: '42%',
              borderRight: '1px solid var(--border)',
              background: 'var(--bg)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Section badge */}
            <div
              style={{
                padding: '20px 24px',
                fontFamily: 'monospace',
                fontSize: 11,
                textTransform: 'uppercase',
                color: 'var(--accent)',
                letterSpacing: '0.08em',
                fontWeight: 700,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <span style={{ color: 'var(--muted)', marginRight: 6 }}>◈</span>
              {q.sectionName}
            </div>

            {/* Waveform + controls */}
            <div style={{ flex: 1 }}>
              <WaveformPanel
                key={current}
                audioSrc={q.audioFile}
                onPlay={() => setHasPlayed(true)}
                onPlayingChange={setAudioPlaying}
              />
            </div>

            {/* Must-listen hint */}
            <AnimatePresence>
              {!hasPlayed && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  style={{
                    margin: '0 24px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(234,179,8,0.08)',
                    border: '1px solid var(--warn)',
                    padding: '8px 14px',
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--warn)',
                    fontFamily: 'monospace',
                  }}
                >
                  ▶ Must listen before answering
                </motion.div>
              )}
            </AnimatePresence>

            {/* Counter */}
            <div
              style={{
                padding: '14px 24px',
                borderTop: '1px solid var(--border)',
                fontFamily: 'monospace',
                fontSize: 12,
                color: 'var(--muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              Audio Case {current + 1} / {questions.length}
            </div>
          </div>

          {/* ── RIGHT: Question panel ── */}
          <div
            className="listening-right"
            style={{
              width: '58%',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Right header */}
            <div
              style={{
                padding: '20px 32px',
                borderBottom: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexShrink: 0,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    color: 'var(--fg)',
                  }}
                >
                  ZONE 02
                </span>
                <span style={{ fontFamily: 'monospace', fontSize: 13, color: 'var(--muted)' }}>
                  // Listening Skills
                </span>
              </div>

              {/* Countdown */}
              <div
                style={{
                  fontFamily: 'monospace',
                  fontSize: 28,
                  fontWeight: 700,
                  color: timerUrgent ? 'var(--fail)' : hasPlayed && !answered ? 'var(--fg)' : 'var(--muted)',
                  animation: timerUrgent ? 'timerPulse 0.8s ease-in-out infinite' : 'none',
                  letterSpacing: '0.05em',
                  transition: 'color 0.3s',
                }}
              >
                {formatCountdown(timeLeft)}
              </div>
            </div>

            {/* Question + options */}
            <AnimatePresence mode="wait">
              <motion.div
                key={current}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
                style={{
                  flex: 1,
                  padding: '32px 32px 20px',
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 20,
                }}
              >
                <h2
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    margin: 0,
                    letterSpacing: '-0.02em',
                    lineHeight: 1.3,
                    color: 'var(--fg)',
                  }}
                >
                  {q.question}
                </h2>

                <div
                  style={{
                    display: 'grid',
                    gap: 10,
                    pointerEvents: !hasPlayed || answered ? 'none' : 'auto',
                    opacity: !hasPlayed ? 0.45 : 1,
                    transition: 'opacity 0.2s',
                  }}
                >
                  {q.options.map((opt, idx) => (
                    <motion.div
                      key={idx}
                      onClick={() => handleSelect(idx)}
                      style={optionStyle(idx)}
                      whileHover={!answered && hasPlayed ? { x: 4 } : {}}
                      whileTap={!answered && hasPlayed ? { scale: 0.98 } : {}}
                    >
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontWeight: 700,
                          fontSize: 12,
                          minWidth: 22,
                          color: 'var(--muted)',
                        }}
                      >
                        {OPTION_LETTERS[idx]}
                      </span>
                      <span>{opt}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Post-answer feedback */}
                <AnimatePresence>
                  {answered && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                      style={{
                        border: `1px solid ${selectedIndex === q.correctIndex ? 'var(--pass)' : 'var(--fail)'}`,
                        background: selectedIndex === q.correctIndex ? 'var(--pass-bg)' : 'var(--fail-bg)',
                        padding: '14px 18px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div
                        style={{
                          fontFamily: 'monospace',
                          fontSize: 12,
                          fontWeight: 700,
                          color: selectedIndex === q.correctIndex ? 'var(--pass)' : 'var(--fail)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.06em',
                        }}
                      >
                        {selectedIndex === q.correctIndex
                          ? '✓ CORRECT'
                          : selectedIndex === -1
                          ? '✗ TIME OUT'
                          : '✗ INCORRECT'}
                      </div>
                      <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.5 }}>
                        {q.explanation}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </AnimatePresence>

            {/* Footer */}
            <div
              style={{
                padding: '18px 32px',
                borderTop: '1px solid var(--border)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'var(--bg)',
                flexShrink: 0,
              }}
            >
              <button
                onClick={() => navigate('/')}
                style={{
                  padding: '10px 20px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--fail)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border)';
                }}
              >
                ABORT
              </button>

              {/* Progress dots */}
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                {questions.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: i === current ? 20 : 8,
                      height: 8,
                      background:
                        i < current ? 'var(--pass)' : i === current ? 'var(--accent)' : 'var(--border)',
                      transition: 'width 0.2s, background 0.2s',
                    }}
                  />
                ))}
              </div>

              {/* SUBMIT / NEXT → / FINISH */}
              <button
                onClick={rightBtn.onClick}
                disabled={!rightBtn.enabled}
                style={{
                  padding: '10px 20px',
                  border: `1px solid ${rightBtn.enabled ? 'var(--accent)' : 'var(--border)'}`,
                  background: rightBtn.enabled ? 'var(--accent)' : 'var(--surface)',
                  color: rightBtn.enabled ? 'var(--bg)' : 'var(--muted)',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: rightBtn.enabled ? 'pointer' : 'not-allowed',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  opacity: rightBtn.enabled ? 1 : 0.45,
                  transition: 'background 0.15s, color 0.15s, opacity 0.15s, border-color 0.15s',
                }}
              >
                {rightBtn.label}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
