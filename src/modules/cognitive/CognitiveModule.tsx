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
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'logical_sequence',
    question: 'Which comes next?\nMonday → Wednesday → Friday → ?',
    options: ['Saturday', 'Sunday', 'Monday', 'Tuesday'],
    correctIndex: 1,
    explanation: 'Pattern skips one day each time. Friday → skip Saturday → Sunday.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'numerical_comparison',
    question: 'Which is the largest amount?',
    options: ['$18.50', '$15.80', '$20.05', '$19.95'],
    correctIndex: 2,
    explanation: '$20.05 is the largest of the four values.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'basic_reasoning',
    question: 'All unauthorized transactions require investigation.\nCase A is an unauthorized transaction.\nWhat should happen to Case A?',
    options: ['Ignore it', 'Investigate it', 'Delete it', 'Close it immediately'],
    correctIndex: 1,
    explanation: 'Basic deductive reasoning: all unauthorized transactions require investigation, so Case A must be investigated.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'rate_calculation',
    question: 'An agent reviews 5 cases in 25 minutes. At the same rate, how long would 10 cases take?',
    options: ['30 minutes', '40 minutes', '50 minutes', '60 minutes'],
    correctIndex: 2,
    explanation: '5 cases in 25 min = 5 min/case. 10 cases × 5 min = 50 minutes.',
  },
  {
    level: 1, levelLabel: 'Basic', levelColor: 'var(--pass)',
    skillTag: 'attention_to_detail',
    question: 'A case ID is WM784521. Which option matches exactly?',
    options: ['WM784251', 'WM784521', 'WM784512', 'WM748521'],
    correctIndex: 1,
    explanation: 'WM784521 matches option B exactly. The others have transposed digits.',
  },
  // LEVEL 2 - MODERATE
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'percentage_calculation',
    question: 'A transaction of $80 is reduced by 25%. What is the new amount?',
    options: ['$55', '$60', '$65', '$70'],
    correctIndex: 1,
    explanation: '25% of $80 = $20. $80 − $20 = $60.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'number_pattern',
    question: 'What comes next?\n3, 6, 12, 24, ?',
    options: ['36', '42', '48', '54'],
    correctIndex: 2,
    explanation: 'Each number doubles. 24 × 2 = 48.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'time_calculation',
    question: 'A case begins at 2:15 PM and takes 45 minutes. When will it finish?',
    options: ['2:45 PM', '3:00 PM', '3:15 PM', '3:30 PM'],
    correctIndex: 1,
    explanation: '2:15 PM + 45 minutes = 3:00 PM.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'data_interpretation',
    question: 'The table below shows case data:\n\nCase A: $25 — Valid\nCase B: $40 — Fraud\nCase C: $15 — Valid\nCase D: $60 — Fraud\n\nWhat is the total value of fraud cases?',
    options: ['$80', '$90', '$100', '$110'],
    correctIndex: 2,
    explanation: 'Fraud cases: Case B ($40) + Case D ($60) = $100.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'attention_to_detail',
    question: 'A customer reports a transaction at 8:45 PM on August 12. The system shows 8:45 PM on August 21. What is the discrepancy?',
    options: ['Amount', 'Time', 'Date', 'Transaction type'],
    correctIndex: 2,
    explanation: 'The time is the same (8:45 PM) but the date differs: August 12 vs August 21.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'logical_reasoning',
    question: 'All unauthorized rides require investigation.\nCase X is an unauthorized ride.\nWhat can you conclude?',
    options: ['Case X requires investigation', 'Case X is automatically fraudulent', 'Case X should be refunded', 'Case X should be closed'],
    correctIndex: 0,
    explanation: 'Direct deduction: all unauthorized rides require investigation → Case X requires investigation.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'work_prioritization',
    question: 'Which case should generally receive the highest priority?',
    options: ['Customer wants to update their profile', 'Customer asks about an old receipt', 'Customer reports an account takeover happening now', 'Customer asks about pricing'],
    correctIndex: 2,
    explanation: 'An active account takeover is a critical security incident requiring immediate action.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'number_pattern',
    question: 'What comes next?\n5, 10, 20, 40, ?',
    options: ['60', '70', '80', '100'],
    correctIndex: 2,
    explanation: 'Each number doubles. 40 × 2 = 80.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'ratio_calculation',
    question: 'An agent reviews 3 fraud cases for every 7 regular cases. If the agent reviews 30 cases, how many would be expected to be fraud cases?',
    options: ['6', '9', '12', '15'],
    correctIndex: 1,
    explanation: '3 + 7 = 10 parts. 30 ÷ 10 = 3. Fraud = 3 × 3 = 9.',
  },
  {
    level: 2, levelLabel: 'Moderate', levelColor: 'var(--warn)',
    skillTag: 'situational_reasoning',
    question: 'A customer claims a ride was unauthorized, but the trip information shows the ride originated from their usual location. What is the best action?',
    options: ['Immediately reject the claim', 'Immediately issue a refund', 'Investigate further and verify the available information', 'Close the account'],
    correctIndex: 2,
    explanation: 'Conflicting information requires further investigation before taking action.',
  },
  // LEVEL 3 - HARD
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'multi_step_calculation',
    question: 'A customer was charged $120. A 15% adjustment is applied, followed by a $10 service credit. What is the final amount?',
    options: ['$82', '$92', '$102', '$110'],
    correctIndex: 1,
    explanation: '15% of $120 = $18. $120 − $18 = $102. $102 − $10 = $92.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'complex_pattern',
    question: 'What comes next?\n2, 5, 11, 23, 47, ?',
    options: ['84', '91', '95', '97'],
    correctIndex: 2,
    explanation: 'Each term = previous × 2 + 1. 47 × 2 + 1 = 95.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'time_productivity',
    question: 'An agent has 12 cases:\n• First 4 cases take 8 minutes each\n• Next 4 cases take 6 minutes each\n• Final 4 cases take 5 minutes each\nHow long does the entire review take?',
    options: ['68 minutes', '72 minutes', '76 minutes', '80 minutes'],
    correctIndex: 2,
    explanation: '4×8 + 4×6 + 4×5 = 32 + 24 + 20 = 76 minutes.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'fraud_pattern_recognition',
    question: 'Three accounts show the following activity:\n• Account A: One unfamiliar ride; customer changed their password.\n• Account B: Five unfamiliar rides; payment method changed; phone number changed.\n• Account C: One ride with an unexpectedly high fare.\n\nWhich account shows the strongest combination of potential account-compromise indicators?',
    options: ['Account A', 'Account B', 'Account C', 'All are equal'],
    correctIndex: 1,
    explanation: 'Account B shows multiple simultaneous indicators: 5 unfamiliar rides + payment method change + phone number change = strongest compromise signal.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'data_analysis',
    question: 'Case data:\n• A: $20 — Account Change: No — Unknown Ride: Yes\n• B: $75 — Account Change: Yes — Unknown Ride: Yes\n• C: $45 — Account Change: No — Unknown Ride: No\n• D: $90 — Account Change: Yes — Unknown Ride: No\n\nWhich case contains two indicators requiring closer review?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 1,
    explanation: 'Case B has both Account Change (Yes) and Unknown Ride (Yes) — two indicators.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'deductive_reasoning',
    question: 'All cases involving an unauthorized payment method must be reviewed.\nSome reviewed cases are escalated.\nCase X involves an unauthorized payment method.\nWhich statement is definitely true?',
    options: ['Case X will be escalated', 'Case X will be refunded', 'Case X must be reviewed', 'Case X is confirmed fraud'],
    correctIndex: 2,
    explanation: 'The only definite conclusion: Case X has an unauthorized payment method → it must be reviewed. Escalation and refund are not guaranteed.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'complex_prioritization',
    question: 'You have four cases:\n• A: $15 disputed charge from two weeks ago\n• B: Customer cannot access their account and reports unauthorized activity occurring today\n• C: Customer wants a copy of a receipt\n• D: Customer disputes a $25 fare from yesterday\n\nWhich should be prioritized first?',
    options: ['A', 'B', 'C', 'D'],
    correctIndex: 1,
    explanation: 'Case B involves active unauthorized access — a live security incident takes priority over billing disputes and informational requests.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'error_detection',
    question: "An agent records:\n• Transaction: $64.80\n• Date: August 19\n• Time: 10:30 PM\n• Pickup: Market Street\n• Drop-off: Oakland\n\nThe customer's original report states:\n• Transaction: $64.80\n• Date: August 19\n• Time: 10:30 PM\n• Pickup: Oakland\n• Drop-off: Market Street\n\nWhat error did the agent make?",
    options: ['Incorrect amount', 'Incorrect date', 'Pickup and drop-off were reversed', 'Incorrect time'],
    correctIndex: 2,
    explanation: 'The amount, date, and time match. Only the pickup and drop-off locations are swapped.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'multi_step_logic',
    question: 'A fraud team receives 200 cases.\n• 30% involve payment disputes.\n• 20% involve unauthorized rides.\n• The remaining cases involve account-access issues.\n\nHow many cases involve account-access issues?',
    options: ['80', '90', '100', '120'],
    correctIndex: 2,
    explanation: '30% + 20% = 50%. Remaining = 50%. 50% of 200 = 100.',
  },
  {
    level: 3, levelLabel: 'Hard', levelColor: 'var(--fail)',
    skillTag: 'critical_thinking',
    question: "A customer reports an unauthorized ride. The account shows:\n• The ride occurred at 2:00 AM\n• The customer's normal rides occur between 7:00 AM and 9:00 PM\n• The pickup location is 20 km away from their usual location\n• The payment method was changed two hours before the ride\n• The customer says they did not make any of these changes\n\nWhat is the strongest conclusion?",
    options: [
      'The customer is definitely lying',
      'The ride was definitely taken by a stranger',
      'There are multiple indicators that warrant a fraud investigation',
      'The transaction should automatically be refunded',
    ],
    correctIndex: 2,
    explanation: 'Multiple anomalies (unusual time, location, payment change) together warrant investigation. Definitive conclusions about lying or stranger cannot be drawn without more evidence.',
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

  // Timer reset on question change
  useEffect(() => {
    setTimeLeft(TIMER_TOTAL);
  }, [current]);

  useEffect(() => {
    if (answered) return;
    if (timeLeft <= 0) {
      // Auto-submit wrong
      recordAnswer(false);
      play('wrong');
      setAnswered(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, answered]);

  if (!candidateName) return <Navigate to="/" replace />;

  function handleSubmit() {
    if (selectedIndex === null || answered) return;
    const isCorrect = selectedIndex === q.correctIndex;
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
  const timerCritical = timeLeft < 20;

  const levelEmoji = q.level === 1 ? '🟢' : q.level === 2 ? '🟡' : '🔴';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--fg)', display: 'flex', flexDirection: 'column' }}
    >
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '16px 32px', borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)', letterSpacing: 2 }}>
          ZONE 03 // Cognitive Assessment
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--muted)' }}>
            {current + 1} / {questions.length}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 15, fontWeight: 700,
              color: timerCritical ? 'var(--fail)' : 'var(--accent)',
              animation: timerCritical ? 'pulse 1s ease-in-out infinite' : 'none',
            }}
          >
            {timerStr}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '70% 30%', minHeight: 0 }}>

        {/* Left: Question panel */}
        <section style={{
          padding: 48, borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          overflow: 'auto',
        }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={current}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: 0.25 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 24 }}
            >
              {/* Level badge + skill tag — inline, smaller */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
                  padding: '4px 10px', borderRadius: 4,
                  border: `1px solid ${q.levelColor}`,
                  color: q.levelColor,
                  letterSpacing: 1,
                }}>
                  {levelEmoji} {q.levelLabel.toUpperCase()}
                </span>
                <span style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11,
                  color: 'var(--muted)', letterSpacing: 1,
                }}>
                  SKILL: {q.skillTag.replace(/_/g, ' ').toUpperCase()}
                </span>
              </div>

              {/* Question text — larger, wider */}
              <p style={{
                fontSize: 26, lineHeight: 1.7, color: 'var(--fg)',
                whiteSpace: 'pre-line', margin: 0, maxWidth: 950,
              }}>
                {q.question}
              </p>
            </motion.div>
          </AnimatePresence>
        </section>

        {/* Right: Options + submit */}
        <section style={{
          padding: 32, display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between', overflow: 'auto',
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {q.options.map((opt, i) => {
              let bg = 'var(--surface)';
              let border = 'var(--border)';
              let letterBg = 'var(--border)';
              let textColor = 'var(--fg)';

              if (answered) {
                if (i === q.correctIndex) {
                  bg = 'var(--pass-bg)';
                  border = 'var(--pass)';
                  letterBg = 'var(--pass)';
                  textColor = 'var(--pass)';
                } else if (i === selectedIndex && i !== q.correctIndex) {
                  bg = 'var(--fail-bg)';
                  border = 'var(--fail)';
                  letterBg = 'var(--fail)';
                  textColor = 'var(--fail)';
                }
              } else if (i === selectedIndex) {
                bg = 'rgba(255,200,0,0.08)';
                border = 'var(--warn)';
                letterBg = 'var(--warn)';
                textColor = 'var(--warn)';
              }

              return (
                <button
                  key={i}
                  onClick={() => !answered && setSelectedIndex(i)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 6,
                    background: bg, border: `1px solid ${border}`,
                    cursor: answered ? 'default' : 'pointer',
                    color: textColor, fontFamily: 'inherit',
                    textAlign: 'left', transition: 'all 0.15s',
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12,
                    minWidth: 26, height: 26, borderRadius: 4,
                    background: letterBg, color: 'var(--bg)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {LETTERS[i]}
                  </span>
                  <span style={{ fontSize: 13, lineHeight: 1.5 }}>{opt}</span>
                </button>
              );
            })}

            {/* Explanation */}
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  marginTop: 8, padding: 16,
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  fontSize: 13, lineHeight: 1.6, color: 'var(--muted)',
                  borderRadius: 6,
                }}
              >
                {q.explanation}
              </motion.div>
            )}
          </div>

          {/* Footer buttons */}
          <div style={{ paddingTop: 24, borderTop: '1px solid var(--border)', marginTop: 24, display: 'flex', justifyContent: 'space-between', gap: 12 }}>
            <button
              onClick={() => navigate('/')}
              style={{
                background: 'var(--surface)', color: 'var(--fg)',
                border: '1px solid var(--border)', padding: '10px 20px',
                fontWeight: 700, fontSize: 13, cursor: 'pointer',
                fontFamily: 'inherit', borderRadius: 4,
              }}
            >
              ABORT
            </button>

            {!answered ? (
              <button
                disabled={selectedIndex === null}
                onClick={handleSubmit}
                style={{
                  background: selectedIndex !== null ? 'var(--accent)' : 'var(--muted)',
                  color: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '10px 24px', fontWeight: 700, fontSize: 13,
                  cursor: selectedIndex !== null ? 'pointer' : 'not-allowed',
                  fontFamily: 'inherit', borderRadius: 4,
                  boxShadow: selectedIndex !== null ? '0 8px 24px rgba(0,163,255,0.3)' : 'none',
                  opacity: selectedIndex !== null ? 1 : 0.5,
                }}
              >
                SUBMIT
              </button>
            ) : (
              <button
                onClick={handleNext}
                style={{
                  background: 'var(--accent)', color: 'var(--surface)',
                  border: '1px solid var(--border)',
                  padding: '10px 24px', fontWeight: 700, fontSize: 13,
                  cursor: 'pointer', fontFamily: 'inherit', borderRadius: 4,
                  boxShadow: '0 8px 24px rgba(0,163,255,0.3)',
                }}
              >
                {isLast ? 'FINISH' : 'NEXT →'}
              </button>
            )}
          </div>
        </section>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
      `}</style>
    </motion.div>
  );
}
