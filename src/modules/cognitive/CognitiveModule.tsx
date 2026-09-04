import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  // LEVEL 1 - BASIC
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'numerical_reasoning',
    question: 'A vehicle travels at 30 km/h for 2 hours. How far does it travel?',
    options: ['15 km', '30 km', '60 km', '90 km'],
    correctIndex: 2,
    explanation: 'Distance = speed × time. 30 km/h × 2 hours = 60 km.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'basic_calculation',
    question: 'A customer is charged $50 and receives a $10 refund. How much did they ultimately pay?',
    options: ['$30', '$40', '$50', '$60'],
    correctIndex: 1,
    explanation: '$50 − $10 refund = $40 net payment.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'number_pattern',
    question: 'What comes next?\n2, 4, 6, 8, ?',
    options: ['9', '10', '11', '12'],
    correctIndex: 1,
    explanation: 'Each number increases by 2. 8 + 2 = 10.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'attention_to_detail',
    question: 'Which number is different from the others?',
    options: ['458721', '458721', '458271', '458721'],
    correctIndex: 2,
    explanation: '458271 has digits 2 and 7 transposed compared to the others (458721).',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'percentage',
    question: 'A team handled 100 cases, of which 20 were fraud-related. What percentage were fraud-related?',
    options: ['10%', '15%', '20%', '25%'],
    correctIndex: 2,
    explanation: '20 out of 100 = 20%.',
  },
].slice(0, 5);

const LETTERS = ['A', 'B', 'C', 'D'];
const TIMER_TOTAL = 90;

export default function CognitiveModule() {
  const navigate = useNavigate();
  const { candidateName, recordAnswer, recordResult } = useAssessmentStore();
  const { play } = useSound();

  const [current, setCurrent] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [timeLeft, setTimeLeft] = useState(TIMER_TOTAL);
  const [score, setScore] = useState(0);

  const q = questions[current];
  const isLast = current === questions.length - 1;
  const pct = Math.round(((current + 1) / questions.length) * 100);

  useEffect(() => {
    setTimeLeft(TIMER_TOTAL);
  }, [current]);

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      recordAnswer(false);
      play('wrong');
      setAnswered(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, answered]);

  if (!candidateName) return <Navigate to="/" replace />;

  function handleSelect(i: number) {
    if (answered) return;
    setSelectedIndex(i);
    const isCorrect = i === q.correctIndex;
    recordAnswer(isCorrect);
    if (isCorrect) {
      play('correct');
      setScore(s => s + 1);
    } else {
      play('wrong');
    }
    setAnswered(true);
  }

  function handleNext() {
    if (isLast) {
      recordResult({
        moduleId: 'cognitive',
        score,
        total: questions.length,
        skillTags: [...new Set(questions.map(q => q.skillTag))],
        completed: true,
      });
      play('module-complete');
      navigate('/');
    } else {
      setAnswered(false);
      setSelectedIndex(null);
      setCurrent(c => c + 1);
    }
  }

  const mins = Math.floor(timeLeft / 60);
  const secs = timeLeft % 60;
  const timerStr = `${mins}:${secs.toString().padStart(2, '0')}`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        minHeight: '100vh',
        background: 'var(--bg)',
        fontFamily: 'var(--font-body)',
        maxWidth: 1600,
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header */}
      <div style={{
          padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 999,
            background: 'var(--accent-bg)', color: q.levelColor, border: `1px solid ${q.levelColor}`,
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {q.levelLabel}
          </span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
            Question {current + 1} of {questions.length}
          </span>
          <div style={{ height: 6, width: 100, background: 'var(--border)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.3s' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: timeLeft < 20 ? 'var(--fail)' : 'var(--accent)' }}>
            {timerStr}
          </span>
          <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, padding: '10px 18px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 4 }}>
            ABORT
          </button>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
        <div style={{ width: '100%', maxWidth: 1000 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700 }}>
            {q.skillTag.replace(/_/g, ' ')}
          </div>
          <h2 style={{ fontSize: 24, fontWeight: 600, color: 'var(--fg)', marginBottom: 32 }}>{q.question}</h2>

          <div style={{ display: 'grid', gap: 16 }}>
            {q.options.map((opt, i) => {
              let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--fg)', letterBg = 'var(--border)', letterColor = 'var(--fg)';
              if (answered && i === q.correctIndex) { bg = 'var(--pass-bg)'; border = 'var(--pass)'; color = 'var(--pass)'; letterBg = 'var(--pass)'; letterColor = '#FFF'; }
              else if (answered && i === selectedIndex) { bg = 'var(--fail-bg)'; border = 'var(--fail)'; color = 'var(--fail)'; letterBg = 'var(--fail)'; letterColor = '#FFF'; }
              else if (!answered && i === selectedIndex) { border = 'var(--accent)'; bg = 'var(--accent-bg)'; color = 'var(--accent)'; letterBg = 'var(--accent)'; letterColor = '#FFF'; }
              
              return (
                <motion.button key={i} onClick={() => handleSelect(i)} disabled={answered}
                  whileHover={!answered ? { scale: 1.01 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '20px 24px', borderRadius: 8,
                    border: `2px solid ${border}`, background: bg, color, textAlign: 'left', cursor: !answered ? 'pointer' : 'default'
                  }}
                >
                  <span style={{ fontSize: 13, fontWeight: 700, width: 36, height: 36, borderRadius: '50%', background: letterBg, color: letterColor, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {LETTERS[i]}
                  </span>
                  {opt}
                </motion.button>
              );
            })}
          </div>

          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 24, padding: 20, borderRadius: 8, background: 'var(--surface)', border: `1px solid var(--border)` }}>
                {q.explanation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '20px 48px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {questions.map((_, i) => <div key={i} style={{ width: 8, height: 8, borderRadius: 999, background: i === current ? 'var(--accent)' : 'var(--border)' }} />)}
        </div>
        {answered && (
           <button onClick={handleNext} style={{ background: 'var(--accent)', color: 'var(--surface)', padding: '12px 24px', fontWeight: 700, borderRadius: 4, border: 'none', cursor: 'pointer' }}>
             {isLast ? 'FINISH' : 'NEXT →'}
           </button>
        )}
      </div>
    </motion.div>
  );
}