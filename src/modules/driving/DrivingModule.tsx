import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';

const questions = [
  {
    state: 'Arizona',
    stateCode: 'AZ',
    skillTag: 'state_knowledge',
    critical: true,
    videoLabel: 'AZ \u00b7 School Bus Stop',
    videoFile: 'Q1.mp4',
    videoPrompt: 'School bus, red lights, stop arm out',
    question: 'A school bus ahead has stopped with red lights flashing and its stop arm extended. What should the driver do?',
    options: [
      'Pass slowly',
      'Stop as required and wait until it is safe and lawful to proceed',
      'Honk and pass on the left',
      'Continue if no child is visible',
    ],
    correctIndex: 1,
    explanation: 'A stopped school bus with active red warning signals is a safety-critical condition. Do not pass when a stop is required.',
  },
  {
    state: 'California',
    stateCode: 'CA',
    skillTag: 'state_knowledge',
    critical: false,
    videoLabel: 'CA \u00b7 Roundabout Entry',
    videoFile: 'Q6.mp4',
    videoPrompt: 'Roundabout entry',
    question: 'When entering a roundabout in California, a driver should:',
    options: [
      'Enter before circulating traffic',
      'Yield to traffic already in the roundabout',
      'Stop inside the roundabout',
      'Drive clockwise',
    ],
    correctIndex: 1,
    explanation: 'Slow, yield to circulating traffic, then enter when a safe gap is available.',
  },
  {
    state: 'New York',
    stateCode: 'NY',
    skillTag: 'state_knowledge',
    critical: false,
    videoLabel: 'NY \u00b7 White Cane Pedestrian',
    videoFile: 'Q11.mp4',
    videoPrompt: 'Pedestrian using a white cane',
    question: 'A driver approaching a pedestrian using a white cane should:',
    options: [
      'Assume the person can see the vehicle',
      'Exercise heightened caution and yield as required',
      'Honk continuously',
      'Pass quickly before they step out',
    ],
    correctIndex: 1,
    explanation: 'A white cane can indicate visual impairment; heightened caution and yielding are essential.',
  },
];

const TOTAL_SECONDS = 180;

export default function DrivingModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult } = useAssessmentStore();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);

  useEffect(() => {
    if (done) return;
    const id = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(id);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [done]);

  if (!candidateName) {
    return <Navigate to="/" replace />;
  }

  const q = questions[current]!;

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    const isCorrect = optionIndex === q.correctIndex;
    setSelectedIndex(optionIndex);
    setAnswered(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setAnswered(false);
        setSelectedIndex(null);
      } else {
        const score = newAnswers.filter(Boolean).length;
        const criticalErrors = questions
          .filter((q, i) => q!.critical && !newAnswers[i])
          .length;
        recordResult({
          moduleId: 'driving',
          score,
          total: questions.length,
          skillTags: questions.map(q => q!.skillTag),
          criticalErrors,
          completed: true,
        });
        setDone(true);
      }
    }, 1200);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (done) {
    const score = answers.filter(Boolean).length;
    return (
      <div style={{
        width: '100%', maxWidth: 1440, height: 'calc(100vh - 3px)',
        margin: '3px auto 0', display: 'grid', gridTemplateRows: 'auto 1fr',
        background: '#ffffff', border: '2px solid #111111',
        boxShadow: '12px 12px 0 rgba(0,0,0,1)', fontFamily: 'var(--font-mono)',
      }}>
        <div style={{
          padding: '24px 32px', borderBottom: '2px solid #111',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, textTransform: 'uppercase', fontWeight: 700, display: 'flex', gap: 16 }}>
            <span>ZONE 01</span><span style={{ color: '#666' }}>//</span><span>US Driving Behavior</span>
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#d93025' }}>COMPLETE</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#666', textTransform: 'uppercase', marginBottom: 16 }}>Module Complete</div>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1 }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, color: '#666', marginTop: 8 }}>
              {Math.round((score / questions.length) * 100)}% correct
            </div>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 32 }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                  padding: '12px 24px', textTransform: 'uppercase' as const,
                  border: '2px solid #111', cursor: 'pointer', background: '#fff',
                  boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                }}
              >
                BACK TO DASHBOARD
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%', maxWidth: 1440, height: 'calc(100vh - 3px)',
      margin: '3px auto 0', display: 'grid', gridTemplateRows: 'auto 1fr',
      background: '#ffffff', border: '2px solid #111111',
      boxShadow: '12px 12px 0 rgba(0,0,0,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px', borderBottom: '2px solid #111',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, textTransform: 'uppercase' as const, fontWeight: 700, display: 'flex', gap: 16 }}>
          <span>ZONE 01</span><span style={{ color: '#666' }}>//</span><span>US Driving Behavior</span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 24, fontWeight: 700, color: '#d93025' }}>
          {formatTime(timeLeft)}
        </div>
      </div>

      {/* Content area */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', overflow: 'hidden' }}>
        {/* Sim viewport */}
        <div style={{
          borderRight: '2px solid #111', background: '#000',
          position: 'relative', overflow: 'hidden',
          display: 'flex', flexDirection: 'column' as const,
        }}>
          <video
            key={q.videoFile}
            src={`/video/${q.videoFile}`}
            autoPlay
            muted
            loop
            playsInline
            style={{ width: '100%', height: '100%', objectFit: 'cover', flex: 1 }}
            onError={(e) => {
              // fallback to static image if video fails
              (e.target as HTMLVideoElement).style.display = 'none';
              const fallback = document.createElement('div');
              fallback.style.cssText = "position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200') center/cover;filter:contrast(1.2) grayscale(0.2);";
              (e.target as HTMLVideoElement).parentNode?.appendChild(fallback);
            }}
          />
          {/* Overlay grid */}
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            pointerEvents: 'none' as const,
          }} />
        </div>

        {/* Controls panel */}
        <div style={{
          padding: 32, display: 'flex', flexDirection: 'column' as const,
          background: '#f9f9f9', overflow: 'auto',
        }}>
          {/* Q label */}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: '#666', marginBottom: 12, textTransform: 'uppercase' as const }}>
            Scenario {current + 1} / {questions.length}
          </div>

          {/* Question */}
          <h2 style={{ fontSize: 24, fontWeight: 700, lineHeight: 1.2, marginBottom: 24, letterSpacing: '-0.02em', margin: '0 0 24px' }}>
            {q.question}
          </h2>

          {/* Options */}
          <div>
            {q.options.map((opt, i) => {
              let bg = '#fff';
              let borderColor = '#111111';
              if (answered && selectedIndex !== null) {
                if (i === q.correctIndex) {
                  bg = 'var(--pass-bg, #e6f9ed)';
                  borderColor = 'var(--pass, #008833)';
                } else if (i === selectedIndex && i !== q.correctIndex) {
                  bg = 'var(--fail-bg, #fde8e6)';
                  borderColor = 'var(--fail, #d92211)';
                }
              }
              return (
                <button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  style={{
                    display: 'block', width: '100%', padding: 16,
                    border: `2px solid ${borderColor}`, background: bg,
                    marginBottom: 12, cursor: answered ? 'default' : 'pointer',
                    fontSize: 15, fontWeight: 600, textAlign: 'left' as const,
                    boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                    transition: 'all 0.1s',
                    fontFamily: 'inherit',
                  }}
                  onMouseEnter={e => {
                    if (!answered) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fafafa';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#0055ff';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!answered) {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fff';
                      (e.currentTarget as HTMLButtonElement).style.borderColor = '#111111';
                    }
                  }}
                  onMouseDown={e => {
                    if (!answered) {
                      (e.currentTarget as HTMLButtonElement).style.transform = 'translate(2px,2px)';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '2px 2px 0 rgba(0,0,0,1)';
                    }
                  }}
                  onMouseUp={e => {
                    if (!answered) {
                      (e.currentTarget as HTMLButtonElement).style.transform = '';
                      (e.currentTarget as HTMLButtonElement).style.boxShadow = '4px 4px 0 rgba(0,0,0,1)';
                    }
                  }}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {/* Footer actions */}
          <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between', paddingTop: 24 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                padding: '12px 24px', textTransform: 'uppercase' as const,
                border: '2px solid #111', cursor: 'pointer', background: '#fff',
                boxShadow: '4px 4px 0 rgba(0,0,0,1)',
              }}
            >
              ABORT
            </button>
            <button
              disabled={!answered}
              onClick={() => {
                if (current + 1 < questions.length) {
                  setCurrent(current + 1);
                  setAnswered(false);
                  setSelectedIndex(null);
                } else {
                  navigate('/');
                }
              }}
              style={{
                fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                padding: '12px 24px', textTransform: 'uppercase' as const,
                border: '2px solid #111', cursor: answered ? 'pointer' : 'default',
                background: '#0055ff', color: 'white',
                boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                opacity: answered ? 1 : 0.4,
              }}
            >
              {current + 1 < questions.length ? 'NEXT' : 'SUBMIT'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
