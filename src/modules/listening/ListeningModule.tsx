import { useState, useRef, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';

const questions = [
  {
    sectionName: 'Customer Complaint — Disputed Charge',
    audioFile: '/audio/Customer Complaint - Audio 2 (2).mp3',
    instruction: 'Listen to the customer call, then answer the question.',
    question: 'How much was the disputed charge?',
    options: ['$24.80', '$26.40', '$28.40', '$38.40'],
    correctIndex: 2,
    skillTag: 'listening_comprehension',
    explanation: 'The customer clearly states the disputed amount was $28.40 during the call.',
    transcript: 'Customer: I was charged $28.40 for a ride I never took. That is not right. I need this fixed immediately. Agent: I understand your frustration. Let me look into this disputed charge for you.',
  },
  {
    sectionName: 'Fraud Conversation — Account Compromise',
    audioFile: '/audio/Fraud Related Conversation - Audio 3.mp3',
    instruction: 'Listen to the fraud conversation, then answer the question.',
    question: "What were the last four digits of the customer's original phone number?",
    options: ['2241', '4421', '4412', '4221'],
    correctIndex: 3,
    skillTag: 'detail_retention',
    explanation: 'The customer mentions the last four digits 4221 when verifying their original phone number.',
    transcript: 'Customer: Someone accessed my account and changed my phone number. My old number ended in 4221. Agent: I see the unauthorized changes. We will secure your account right away.',
  },
  {
    sectionName: 'Multiple Instructions — Agent Procedure',
    audioFile: '/audio/Instructions With Multiple Details - Audio 5.mp3',
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
    explanation: 'Agent procedure prohibits making account changes during the review phase — changes require supervisor approval.',
    transcript: "Supervisor: When reviewing a case, first review the trip details, then categorize the case. Do not make changes to the customer's account during review. Changes require supervisor approval. Finally, review the transaction.",
  },
];

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

function WaveformPanel({
  audioSrc,
  onPlay,
}: {
  audioSrc: string;
  onPlay: () => void;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(
    Array.from({ length: 24 }, (_, i) => {
      if (i % 2 === 1) return 60;
      if (i % 3 === 0) return 90;
      if (i % 5 === 0) return 30;
      return 10;
    })
  );
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (playing) {
      animRef.current = setInterval(() => {
        setBarHeights(
          Array.from({ length: 24 }, () => Math.floor(Math.random() * 80) + 10)
        );
      }, 120);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      setBarHeights(
        Array.from({ length: 24 }, (_, i) => {
          if (i % 2 === 1) return 60;
          if (i % 3 === 0) return 90;
          if (i % 5 === 0) return 30;
          return 10;
        })
      );
    }
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [playing]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      audio.play();
      setPlaying(true);
      onPlay();
    }
  };

  const replay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play();
    setPlaying(true);
    onPlay();
  };

  return (
    <div
      style={{
        background: '#f9f9f9',
        borderBottom: '2px solid #111',
        padding: '40px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={() => setPlaying(false)}
      />
      {/* Waveform bars */}
      <div
        style={{
          width: '100%',
          height: 80,
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          overflow: 'hidden',
          marginBottom: 24,
        }}
      >
        {barHeights.map((h, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: `${h}%`,
              background: i % 2 === 1 ? '#0055ff' : '#111',
              borderRadius: 2,
              transition: playing ? 'height 0.1s ease' : 'height 0.3s ease',
            }}
          />
        ))}
      </div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 16 }}>
        <button
          onClick={replay}
          style={{
            width: 48,
            height: 48,
            border: '2px solid #111',
            background: '#fff',
            fontSize: 20,
            boxShadow: '4px 4px 0 rgba(0,0,0,1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          ↺
        </button>
        <button
          onClick={togglePlay}
          style={{
            width: 48,
            height: 48,
            border: '2px solid #111',
            background: '#111',
            color: '#fff',
            fontSize: 20,
            boxShadow: '4px 4px 0 rgba(0,0,0,1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {playing ? '■' : '▶'}
        </button>
      </div>
    </div>
  );
}

export default function ListeningModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult } = useAssessmentStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Timer
  useEffect(() => {
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, []);

  if (!candidateName) return <Navigate to="/" replace />;

  const q = questions[current];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60).toString().padStart(2, '0');
    const sec = (s % 60).toString().padStart(2, '0');
    return `${m}:${sec}`;
  };

  const handleSelect = (idx: number) => {
    if (answered || !hasPlayed) return;
    const isCorrect = idx === q.correctIndex;
    setSelectedIndex(idx);
    setAnswered(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setAnswered(false);
        setSelectedIndex(null);
        setHasPlayed(false);
      } else {
        const score = newAnswers.filter(Boolean).length;
        recordResult({
          moduleId: 'listening',
          score,
          total: questions.length,
          skillTags: questions.map((q) => q.skillTag),
          completed: true,
        });
        navigate('/');
      }
    }, 1800);
  };

  const optionStyle = (idx: number): React.CSSProperties => {
    const base: React.CSSProperties = {
      padding: 16,
      border: '2px solid #111',
      background: '#fff',
      cursor: answered || !hasPlayed ? 'default' : 'pointer',
      fontSize: 15,
      fontWeight: 600,
      display: 'flex',
      gap: 16,
      boxShadow: '4px 4px 0 rgba(0,0,0,1)',
      alignItems: 'center',
      transition: 'background 0.1s, border-color 0.1s',
    };
    if (answered && selectedIndex === idx) {
      const correct = idx === q.correctIndex;
      return {
        ...base,
        border: `2px solid ${correct ? '#008833' : '#d92211'}`,
        background: correct ? '#e6f6ec' : '#fae8e6',
        color: correct ? '#008833' : '#d92211',
        boxShadow: '2px 2px 0 rgba(0,0,0,1)',
      };
    }
    if (answered && idx === q.correctIndex) {
      return {
        ...base,
        border: '2px solid #008833',
        background: '#e6f6ec',
        color: '#008833',
        boxShadow: '2px 2px 0 rgba(0,0,0,1)',
      };
    }
    return base;
  };

  return (
    <div
      style={{
        maxWidth: 1000,
        height: 'calc(100vh - 3px)',
        margin: '3px auto 0',
        background: '#fff',
        border: '2px solid #111',
        boxShadow: '12px 12px 0 rgba(0,0,0,1)',
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr auto',
        overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '24px 32px',
          borderBottom: '2px solid #111',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
            }}
          >
            ZONE 02
          </span>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 14,
              fontWeight: 700,
              textTransform: 'uppercase',
              color: '#555',
            }}
          >
            // Listening Skills
          </span>
        </div>
        <span
          style={{
            fontFamily: 'monospace',
            fontSize: 24,
            fontWeight: 700,
            color: '#111',
          }}
        >
          {formatTime(elapsed)}
        </span>
      </div>

      {/* Waveform panel */}
      <WaveformPanel
        key={current}
        audioSrc={q.audioFile}
        onPlay={() => setHasPlayed(true)}
      />

      {/* Question area */}
      <div style={{ padding: 40, overflowY: 'auto' }}>
        <div
          style={{
            fontFamily: 'monospace',
            fontSize: 12,
            textTransform: 'uppercase',
            color: '#888',
            marginBottom: 12,
          }}
        >
          Audio Case {current + 1} / {questions.length}
        </div>
        <h2
          style={{
            fontSize: 24,
            fontWeight: 700,
            marginBottom: 24,
            marginTop: 0,
            letterSpacing: '-0.02em',
          }}
        >
          {q.question}
        </h2>

        {!hasPlayed && (
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: '#fff8e6',
              border: '1px solid #ffc65c',
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 700,
              color: '#92400e',
              marginBottom: 16,
            }}
          >
            ▶ Play audio above to unlock question
          </div>
        )}

        <div
          style={{
            display: 'grid',
            gap: 12,
            pointerEvents: !hasPlayed ? 'none' : 'auto',
            opacity: !hasPlayed ? 0.5 : 1,
          }}
        >
          {q.options.map((opt, idx) => (
            <div
              key={idx}
              onClick={() => handleSelect(idx)}
              style={optionStyle(idx)}
            >
              <span
                style={{
                  fontFamily: 'monospace',
                  fontWeight: 700,
                  fontSize: 13,
                  minWidth: 20,
                }}
              >
                {OPTION_LETTERS[idx]}
              </span>
              <span>{opt}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '24px 40px',
          borderTop: '2px solid #111',
          display: 'flex',
          justifyContent: 'space-between',
          background: '#f9f9f9',
        }}
      >
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '10px 20px',
            border: '2px solid #111',
            background: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: 'pointer',
            boxShadow: '4px 4px 0 rgba(0,0,0,1)',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
          }}
        >
          ABORT
        </button>
        <button
          onClick={() => {
            if (!answered && hasPlayed) {
              // allow skip — treated as wrong
              handleSelect(-1);
            }
          }}
          disabled={!hasPlayed || answered}
          style={{
            padding: '10px 20px',
            border: '2px solid #111',
            background: '#0055ff',
            color: '#fff',
            fontWeight: 700,
            fontSize: 13,
            cursor: !hasPlayed || answered ? 'default' : 'pointer',
            boxShadow: '4px 4px 0 rgba(0,0,0,1)',
            fontFamily: 'monospace',
            textTransform: 'uppercase',
            opacity: !hasPlayed || answered ? 0.5 : 1,
          }}
        >
          SUBMIT
        </button>
      </div>
    </div>
  );
}
