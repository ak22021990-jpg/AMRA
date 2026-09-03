import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion } from 'framer-motion';

const questions = [
  {
    level: 1,
    levelLabel: 'Basic',
    levelColor: 'var(--pass)',
    skillTag: 'attention_to_detail',
    question: 'Which number is different from the others?',
    options: ['458721', '458721', '458271', '458721'],
    correctIndex: 2,
    explanation: '458271 has digits 2 and 7 transposed compared to the others (458721).',
  },
  {
    level: 2,
    levelLabel: 'Moderate',
    levelColor: 'var(--warn)',
    skillTag: 'situational_reasoning',
    question:
      'A customer claims a ride was unauthorized, but trip data shows the ride originated from their usual pickup location. What is the best action?',
    options: [
      'Immediately reject the claim',
      'Immediately issue a refund',
      'Investigate further and verify the available information',
      'Close the account',
    ],
    correctIndex: 2,
    explanation: 'Familiar origin does not eliminate the possibility of account compromise. Investigation before action is correct procedure.',
  },
  {
    level: 3,
    levelLabel: 'Hard',
    levelColor: 'var(--accent)',
    skillTag: 'fraud_pattern_recognition',
    question: 'Three accounts: A has one unfamiliar ride + password changed. B has five unfamiliar rides + payment method changed + phone number changed. C has one ride with an unexpectedly high fare. Which account shows the strongest compromise indicators?',
    options: ['Account A', 'Account B', 'Account C', 'All show equal risk'],
    correctIndex: 1,
    explanation: 'Account B has multiple independent compromise signals across ride history and account data changes — highest risk profile by fraud pattern analysis.',
  },
];

// Single shared reference document — all questions reference this
const REFERENCE_DOC = {
  label: 'REFERENCE DOCUMENT // OP-FRAUD-774',
  title: 'Fraud Investigation Protocol',
  paragraphs: [
    {
      text: 'When a transaction is flagged under condition ',
      highlight: 'Alpha-7',
      after: ', the reviewing associate must immediately cross-reference the user\'s last known IP address. If the distance between the IP\'s geolocation and the shipping address exceeds 500 miles, the associate must initiate protocol ',
      highlight2: 'Beta-Void',
      after2: '.',
    },
    {
      text: 'However, if the account holds "Trusted Tier" status (defined as having over 10 successful transactions in the past 6 months) AND the purchase total is under $250, ',
      highlight: 'Beta-Void',
      after: ' is superseded by ',
      highlight2: 'Gamma-Hold',
      after2: '.',
    },
    {
      text: 'Under no circumstances should the associate directly contact the user if ',
      highlight: 'Beta-Void',
      after: ' is active. Conversely, ',
      highlight2: 'Gamma-Hold',
      after2: ' requires a minimum of two outreach attempts within a 24-hour window before final block placement.',
    },
    {
      text: 'Account compromise is assessed across multiple vectors: ride history anomalies, payment method changes, and device fingerprint deviations. A single anomaly is insufficient for escalation; two or more independent signals trigger ',
      highlight: 'Tier-3 review',
      after: '.',
    },
  ],
};

const TOTAL_SECONDS = 300;

function formatTime(secs: number) {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = (secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

function renderParagraph(p: typeof REFERENCE_DOC.paragraphs[0]) {
  return (
    <p style={{ marginBottom: 16 }}>
      <span>{p.text}</span>
      <mark style={{ background: 'rgba(0,85,255,0.1)', color: 'var(--accent)', fontFamily: 'monospace', fontSize: 14, padding: '2px 4px' }}>{p.highlight}</mark>
      <span>{p.after}</span>
      {p.highlight2 && (
        <>
          <mark style={{ background: 'rgba(0,85,255,0.1)', color: 'var(--accent)', fontFamily: 'monospace', fontSize: 14, padding: '2px 4px' }}>{p.highlight2}</mark>
          <span>{p.after2}</span>
        </>
      )}
    </p>
  );
}

export default function CognitiveModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [answered, setAnswered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!started || done) return;
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          finishAssessment(answers);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current!);
  }, [started, done]);

  if (!candidateName) {
    return <Navigate to="/" replace />;
  }

  function finishAssessment(finalAnswers: boolean[]) {
    const score = finalAnswers.filter(Boolean).length;
    recordResult({
      moduleId: 'cognitive',
      score,
      total: questions.length,
      skillTags: questions.map(q => q.skillTag),
      completed: true,
    });
    setDone(true);
  }

  function handleOptionClick(optIndex: number) {
    if (answered) return;
    const isCorrect = optIndex === questions[current].correctIndex;
    setSelectedIndex(optIndex);
    setAnswered(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    // Sound + streak tracking
    play(isCorrect ? 'correct' : 'wrong');
    recordAnswer(isCorrect);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setAnswered(false);
        setSelectedIndex(null);
      } else {
        clearInterval(timerRef.current!);
        finishAssessment(newAnswers);
      }
    }, 900);
  }

  if (!started) {
    return (
      <div style={{ maxWidth: 640, margin: '0 auto', textAlign: 'center', padding: 48 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 16, letterSpacing: '0.08em' }}>
          Cognitive Assessment
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>Reasoning Challenge</h2>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: 'var(--muted)', marginBottom: 24 }}>
          Read the reference document on the left, then answer 3 logic queries on the right. Tests attention to detail, situational judgment, and fraud pattern recognition.
        </p>
        <button
          style={{ background: 'var(--accent)', color: 'var(--surface)', border: '1px solid var(--border)', padding: '12px 32px', fontWeight: 700, fontSize: 14, cursor: 'pointer', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          onClick={() => setStarted(true)}
        >
          Start Module
        </button>
      </div>
    );
  }

  if (done) {
    navigate('/');
    return null;
  }

  const q = questions[current];

  function getOptionStyle(i: number): React.CSSProperties {
    const base: React.CSSProperties = {
      padding: 16,
      border: '1px solid var(--border)',
      background: 'var(--surface)',
      cursor: answered ? 'default' : 'pointer',
      fontSize: 14,
      fontWeight: 600,
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      transition: 'all 0.1s',
      textAlign: 'left',
      width: '100%',
      fontFamily: 'inherit',
    };
    if (answered && selectedIndex !== null) {
      if (i === q.correctIndex) {
        return { ...base, border: '1px solid var(--pass)', background: 'var(--pass-bg)', color: 'var(--pass)' };
      }
      if (i === selectedIndex && i !== q.correctIndex) {
        return { ...base, border: '1px solid var(--fail)', background: 'var(--fail-bg)', color: 'var(--fail)' };
      }
    }
    return base;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 1200, height: 'calc(100vh - 3px)', margin: '3px auto 0',
        display: 'grid', gridTemplateColumns: '1fr 400px',
        background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}
    >
      {/* LEFT PANE — single shared reference document */}
      <div style={{ padding: 48, borderRight: '1px solid var(--border)', overflowY: 'auto', background: 'var(--surface)' }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', borderBottom: '1px solid var(--border)', paddingBottom: 16, marginBottom: 32, letterSpacing: '0.08em' }}>
          {REFERENCE_DOC.label}
        </div>
        <h1 style={{ fontSize: 32, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 24, lineHeight: 1.1 }}>
          {REFERENCE_DOC.title}
        </h1>
        <div style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--fg)' }}>
          {REFERENCE_DOC.paragraphs.map((p) => renderParagraph(p))}
        </div>
      </div>

      {/* RIGHT PANE — questions */}
      <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--bg)' }}>
        {/* Timer bar */}
        <div style={{ background: 'var(--border)', color: 'var(--surface)', fontFamily: 'monospace', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 24px', fontWeight: 700, fontSize: 13 }}>
          <span>COG-TEST // {String(current + 1).padStart(2, '0')}</span>
          <span>{formatTime(timeLeft)}</span>
        </div>

        {/* Question content */}
        <div style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
          <div style={{ fontFamily: 'monospace', fontSize: 12, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 12, letterSpacing: '0.06em' }}>
            Logic Query {current + 1} / {questions.length}
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.3, marginBottom: 24, color: 'var(--fg)' }}>
            {q.question}
          </h3>

          <div style={{ display: 'grid', gap: 12 }}>
            {q.options.map((opt, i) => (
              <motion.button
                key={i}
                onClick={() => handleOptionClick(i)}
                disabled={answered}
                style={getOptionStyle(i)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onMouseEnter={e => { if (!answered) { e.currentTarget.style.background = 'var(--surface-subtle)'; e.currentTarget.style.borderColor = 'var(--accent)'; } }}
                onMouseLeave={e => { if (!answered) { e.currentTarget.style.background = 'var(--surface)'; e.currentTarget.style.borderColor = 'var(--border)'; } }}
                onMouseDown={e => { if (!answered) { e.currentTarget.style.transform = 'translate(2px,2px)'; e.currentTarget.style.boxShadow = '2px 2px 0 rgba(0,0,0,0.5)'; } }}
                onMouseUp={e => { if (!answered) { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 rgba(0,0,0,0.5)'; } }}
              >
                {opt}
              </motion.button>
            ))}
          </div>

          {answered && (
            <div style={{ marginTop: 20, padding: 16, border: '1px solid var(--border)', background: 'var(--surface)', fontSize: 14, lineHeight: 1.6, color: 'var(--muted)' }}>
              {q.explanation}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
          <button onClick={() => navigate('/')} style={{ background: 'var(--surface)', color: 'var(--fg)', border: '1px solid var(--border)', padding: '10px 20px', fontWeight: 700, fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            ABORT
          </button>
          <button disabled={!answered} style={{ background: answered ? 'var(--accent)' : 'var(--muted)', color: 'var(--surface)', border: '1px solid var(--border)', padding: '10px 24px', fontWeight: 700, fontSize: 13, cursor: answered ? 'pointer' : 'not-allowed', fontFamily: 'inherit', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
            CONFIRM
          </button>
        </div>
      </div>
    </motion.div>
  );
}
