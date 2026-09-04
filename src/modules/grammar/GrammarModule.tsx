import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion, AnimatePresence } from 'framer-motion';

// Exact rollback to Grammar Assesment.docx — 25 Qs across 5 sections
interface GrammarQuestion {
  id: string;
  section: string;
  sectionName: string;
  skillTag: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

const questions: GrammarQuestion[] = [
  // Section A — Subject-Verb-Object (SVO) — 5 Qs
  {
    id: 'A1', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Which sentence follows the correct Subject-Verb-Object structure?',
    options: ['The transaction reviewed the agent.', 'The agent reviewed the transaction.', 'Reviewed the agent the transaction.', 'The transaction the agent reviewed.'],
    correctIndex: 1, explanation: 'Subject (The agent) → Verb (reviewed) → Object (the transaction).',
  },
  {
    id: 'A2', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Choose the sentence with the correct Subject-Verb-Object (SVO) structure.',
    options: ['The case the analyst escalated.', 'The analyst escalated the case.', 'Escalated the analyst the case.', 'The case was the analyst escalated.'],
    correctIndex: 1, explanation: 'The analyst (S) escalated (V) the case (O).',
  },
  {
    id: 'A3', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Which sentence has the correct word order?',
    options: ['The customer provided the requested information.', 'The requested information provided the customer.', 'Provided the customer the requested information.', 'The customer the requested information provided.'],
    correctIndex: 0, explanation: 'SVO: The customer provided the requested information.',
  },
  {
    id: 'A4', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Choose the sentence that correctly follows the Subject-Verb-Object (SVO) pattern.',
    options: ['The account the support team restricted.', 'Restricted the support team the account.', 'The support team restricted the account.', 'The account restricted the support team.'],
    correctIndex: 2, explanation: 'The support team (S) restricted (V) the account (O).',
  },
  {
    id: 'A5', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Which sentence follows the correct Subject-Verb-Object (SVO) structure?',
    options: ['The suspicious activity reported the customer.', 'Reported the customer the suspicious activity.', 'The customer the suspicious activity reported.', 'The customer reported the suspicious activity.'],
    correctIndex: 3, explanation: 'The customer (S) reported (V) the suspicious activity (O).',
  },
  // Section B — Subject-Verb Agreement — 5 Qs
  {
    id: 'B6', section: 'B', sectionName: 'Subject-Verb Agreement', skillTag: 'grammar',
    question: 'The customer ___ that the transaction was unauthorized.',
    options: ['confirm', 'confirmed', 'confirming', 'have confirmed'],
    correctIndex: 1, explanation: 'Past tense needed: confirmed.',
  },
  {
    id: 'B7', section: 'B', sectionName: 'Subject-Verb Agreement', skillTag: 'grammar',
    question: 'The documents submitted by the customer ___ incomplete.',
    options: ['is', 'was', 'are', 'has'],
    correctIndex: 2, explanation: "'Documents' is plural → 'are' is correct.",
  },
  {
    id: 'B8', section: 'B', sectionName: 'Subject-Verb Agreement', skillTag: 'grammar',
    question: 'The list of suspicious transactions ___ been shared with the investigation team.',
    options: ['have', 'are', 'has', 'were'],
    correctIndex: 2, explanation: "'The list' is singular → 'has' is correct.",
  },
  {
    id: 'B9', section: 'B', sectionName: 'Subject-Verb Agreement', skillTag: 'grammar',
    question: 'Neither the customer nor the support agents ___ available for the scheduled call.',
    options: ['was', 'is', 'were', 'has'],
    correctIndex: 2, explanation: "With 'nor', verb agrees with nearest subject (agents → were).",
  },
  {
    id: 'B10', section: 'B', sectionName: 'Subject-Verb Agreement', skillTag: 'grammar',
    question: 'The information provided by the customer ___ sufficient to complete the review.',
    options: ['are', 'were', 'have', 'is'],
    correctIndex: 3, explanation: "'Information' is uncountable singular → 'is'.",
  },
  // Section C — Tenses — 5 Qs
  {
    id: 'C11', section: 'C', sectionName: 'Tenses', skillTag: 'grammar',
    question: 'The customer ___ the required documents, and the team is now reviewing them.',
    options: ['submit', 'submitted', 'has submitted', 'will submit'],
    correctIndex: 2, explanation: "Present perfect 'has submitted' — completed with present relevance.",
  },
  {
    id: 'C12', section: 'C', sectionName: 'Tenses', skillTag: 'grammar',
    question: 'The customer ___ the transaction as unauthorized yesterday.',
    options: ['reports', 'reported', 'has reported', 'will report'],
    correctIndex: 1, explanation: "Time marker 'yesterday' → simple past 'reported'.",
  },
  {
    id: 'C13', section: 'C', sectionName: 'Tenses', skillTag: 'grammar',
    question: 'The support team ___ the customer once the investigation is complete.',
    options: ['contacted', 'contacts', 'will contact', 'has contacted'],
    correctIndex: 2, explanation: "Future action → 'will contact'.",
  },
  {
    id: 'C14', section: 'C', sectionName: 'Tenses', skillTag: 'grammar',
    question: 'The customer stated that they ___ already contacted their bank before contacting the support team.',
    options: ['have', 'had', 'will have', 'are'],
    correctIndex: 1, explanation: "Past perfect 'had' for earlier past action.",
  },
  {
    id: 'C15', section: 'C', sectionName: 'Tenses', skillTag: 'grammar',
    question: 'The support team ___ the customer once the review is completed.',
    options: ['contacted', 'contacts', 'will contact', 'has contacted'],
    correctIndex: 2, explanation: "Future → 'will contact'.",
  },
  // Section D — Connecting Words — 5 Qs
  {
    id: 'D16', section: 'D', sectionName: 'Connecting Words', skillTag: 'written_communication',
    question: 'The transaction was flagged for review ___ it showed unusual activity.',
    options: ['although', 'because', 'however', 'therefore'],
    correctIndex: 1, explanation: "Cause → 'because'.",
  },
  {
    id: 'D17', section: 'D', sectionName: 'Connecting Words', skillTag: 'written_communication',
    question: 'The customer provided all the requested documents; ___, the verification could not be completed.',
    options: ['because', 'therefore', 'however', 'so'],
    correctIndex: 2, explanation: "Contrast despite provision → 'however'.",
  },
  {
    id: 'D18', section: 'D', sectionName: 'Connecting Words', skillTag: 'written_communication',
    question: 'The customer did not provide the required information; ___, the case could not be completed.',
    options: ['although', 'therefore', 'while', 'however'],
    correctIndex: 1, explanation: "Result → 'therefore'.",
  },
  {
    id: 'D19', section: 'D', sectionName: 'Connecting Words', skillTag: 'written_communication',
    question: '___ the customer had provided the required documents, additional verification was necessary.',
    options: ['Because', 'Therefore', 'Although', 'So'],
    correctIndex: 2, explanation: "Concession → 'Although'.",
  },
  {
    id: 'D20', section: 'D', sectionName: 'Connecting Words', skillTag: 'written_communication',
    question: 'The support team was reviewing the case ___ the customer contacted the team for an update.',
    options: ['because', 'while', 'therefore', 'although'],
    correctIndex: 1, explanation: "Simultaneous actions → 'while'.",
  },
  // Section E — Punctuation — 5 Qs
  {
    id: 'E21', section: 'E', sectionName: 'Punctuation', skillTag: 'written_communication',
    question: 'Could you please confirm whether the transaction was authorized by you',
    options: [
      'Could you please confirm whether the transaction was authorized by you',
      'Could you please confirm whether the transaction was authorized by you.',
      'Could you please confirm whether the transaction was authorized by you?',
      'Could you please confirm whether the transaction was authorized by you!',
    ],
    correctIndex: 2, explanation: 'Yes/no question needs question mark.',
  },
  {
    id: 'E22', section: 'E', sectionName: 'Punctuation', skillTag: 'written_communication',
    question: 'The customer provided the documents however the information was incomplete',
    options: [
      'The customer provided the documents however the information was incomplete',
      'The customer provided the documents; however, the information was incomplete.',
      'The customer provided the documents, however the information was incomplete',
      'The customer provided the documents however, the information was incomplete.',
    ],
    correctIndex: 1, explanation: "Conjunctive adverb 'however' needs '; however,' between independent clauses.",
  },
  {
    id: 'E23', section: 'E', sectionName: 'Punctuation', skillTag: 'written_communication',
    question: 'Thank you for providing the documents We appreciate your cooperation',
    options: [
      'Thank you for providing the documents We appreciate your cooperation',
      'Thank you for providing the documents, We appreciate your cooperation.',
      'Thank you for providing the documents! We appreciate your cooperation.',
      'Thank you for providing the documents; We appreciate your cooperation.',
    ],
    correctIndex: 2, explanation: 'Two independent sentences — exclamation/period to separate.',
  },
  {
    id: 'E24', section: 'E', sectionName: 'Punctuation', skillTag: 'written_communication',
    question: 'Before we proceed could you please confirm the details',
    options: [
      'Before we proceed could you please confirm the details',
      'Before we proceed, could you please confirm the details.',
      'Before we proceed, could you please confirm the details?',
      'Before we proceed could you please confirm the details.',
    ],
    correctIndex: 2, explanation: "Comma after introductory clause + question mark.",
  },
  {
    id: 'E25', section: 'E', sectionName: 'Punctuation', skillTag: 'written_communication',
    question: 'The review is complete however we need one more document before closing the case',
    options: [
      'The review is complete however we need one more document before closing the case',
      'The review is complete; however, we need one more document before closing the case.',
      'The review is complete, however we need one more document before closing the case',
      'The review is complete however, we need one more document before closing the case.',
    ],
    correctIndex: 1, explanation: "'; however,' between independent clauses.",
  },
].slice(0, 5);

export default function GrammarModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [started, setStarted] = useState(false);

  if (!candidateName) return <Navigate to="/" replace />;

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (answered) return;
    const isCorrect = idx === q.correctIndex;
    setSelectedIndex(idx);
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
        const score = newAnswers.filter(Boolean).length;
        recordResult({
          moduleId: 'grammar',
          score,
          total: questions.length,
          skillTags: [...new Set(questions.map(x => x.skillTag))],
          completed: true,
        });
        play('module-complete');
        navigate('/');
      }
    }, 1100);
  };

  if (!started) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{
          width: '100%', maxWidth: 1600, minHeight: '100vh',
          margin: '0 auto', display: 'flex', flexDirection: 'column',
          background: 'var(--bg)', fontFamily: 'var(--font-body)'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          background: 'var(--surface)', borderBottom: '1px solid var(--border)',
          position: 'sticky', top: 0, zIndex: 100
        }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>
            GRAMMAR MODULE
          </span>
          <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, padding: '8px 16px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 4 }}>
            ABORT
          </button>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div style={{ textAlign: 'center', maxWidth: 800 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16, fontWeight: 700 }}>
              Section Grammar • 25 Questions
            </div>
            <h2 style={{ fontSize: 40, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.1, marginBottom: 16, color: 'var(--fg)' }}>
              Grammar & Written Communication
            </h2>
            <p style={{ fontSize: 16, color: 'var(--muted)', maxWidth: 600, margin: '0 auto 32px', lineHeight: 1.6 }}>
              5 sections: SVO (5) • SVA (5) • Tenses (5) • Connecting Words (5) • Punctuation (5).<br />Exact rollback to Grammar Assessment.docx. ~8 min.
            </p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
              {['A: SVO', 'B: Agreement', 'C: Tenses', 'D: Connectors', 'E: Punctuation'].map(t => (
                <span key={t} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, padding: '6px 12px', border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--muted)', borderRadius: 4 }}>{t}</span>
              ))}
            </div>
            <button onClick={() => setStarted(true)} style={{ background: 'var(--accent)', color: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14, textTransform: 'uppercase', padding: '16px 40px', boxShadow: '4px 4px 0 rgba(0,0,0,0.3)', cursor: 'pointer', borderRadius: 4 }}>
              Begin Assessment →
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  const sectionProgress = q.sectionName; // Only section name, no q.id
  const pct = Math.round(((current + 1) / questions.length) * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ width: '100%', maxWidth: 1600, minHeight: '100vh', margin: '0 auto', display: 'flex', flexDirection: 'column', background: 'var(--bg)', fontFamily: 'var(--font-body)' }}
    >
      {/* Sticky Header */}
      <div style={{
        padding: '20px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100, flexWrap: 'wrap', gap: 16
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={{
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700,
            padding: '4px 12px', borderRadius: 999,
            background: 'var(--accent-bg)', color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
            textTransform: 'uppercase', letterSpacing: '0.05em'
          }}>
            {sectionProgress}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--fg)' }}>
              Question {current + 1} of {questions.length}
            </span>
            <span style={{ color: 'var(--muted)' }}>/</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
              {pct}%
            </span>
          </div>
          <div style={{ height: 6, width: 200, background: 'var(--border)', borderRadius: 999, overflow: 'hidden', minWidth: 120 }}>
            <div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.3s ease' }} />
          </div>
        </div>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, padding: '10px 18px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 4 }}>
          ABORT
        </button>
      </div>

      {/* Question Panel */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: 1000 }}>
          {/* Question */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 12, fontWeight: 700, letterSpacing: '0.05em' }}>
              {q.sectionName}
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 600, lineHeight: 1.5, marginBottom: 24, color: 'var(--fg)' }}>
              {q.question}
            </h2>
          </div>

          {/* Options Grid */}
          <div style={{ display: 'grid', gap: 16 }}>
            {q.options.map((opt, i) => {
              let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--fg)', letterBg = 'var(--border)', letterColor = 'var(--fg)';
              
              if (answered && selectedIndex !== null) {
                if (i === q.correctIndex) { bg = 'var(--pass-bg)'; border = 'var(--pass)'; color = 'var(--pass)'; letterBg = 'var(--pass)'; letterColor = 'var(--surface)'; }
                else if (i === selectedIndex) { bg = 'var(--fail-bg)'; border = 'var(--fail)'; color = 'var(--fail)'; letterBg = 'var(--fail)'; letterColor = 'var(--surface)'; }
              } else if (!answered && selectedIndex === i) {
                border = 'var(--accent)'; bg = 'var(--accent-bg)'; color = 'var(--accent)'; letterBg = 'var(--accent)'; letterColor = 'var(--surface)';
              }

              return (
                <motion.button
                  key={i}
                  onClick={() => handleSelect(i)}
                  disabled={answered}
                  whileHover={!answered ? { scale: 1.01 } : {}}
                  whileTap={!answered ? { scale: 0.99 } : {}}
                  style={{
                    display: 'flex', gap: 16, alignItems: 'center', padding: '20px 24px',
                    border: `2px solid ${border}`, background: bg, color,
                    cursor: answered ? 'default' : 'pointer', textAlign: 'left',
                    fontSize: 16, fontWeight: 500, fontFamily: 'var(--font-body)',
                    borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.12s ease'
                  }}
                >
                  <span style={{
                    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
                    minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: '50%', background: letterBg, color: letterColor, flexShrink: 0
                  }}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span style={{ lineHeight: 1.5 }}>{opt}</span>
                </motion.button>
              );
            })}
          </div>

          {/* Explanation — slides in after answer */}
          <AnimatePresence>
            {answered && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
                style={{
                  marginTop: 24, padding: '20px 24px',
                  background: selectedIndex === q.correctIndex ? 'var(--pass-bg)' : 'var(--fail-bg)',
                  border: `1px solid ${selectedIndex === q.correctIndex ? 'var(--pass)' : 'var(--fail)'}`,
                  borderRadius: 8, fontSize: 14, lineHeight: 1.6,
                  color: selectedIndex === q.correctIndex ? 'var(--pass)' : 'var(--fail)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontWeight: 700 }}>
                  {selectedIndex === q.correctIndex ? (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M6 10l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      Correct
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/><path d="M6 14l8-8M6 6l8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
                      {selectedIndex === null ? 'Time Out' : 'Incorrect'}
                    </span>
                  )}
                </div>
                <div style={{ color: 'var(--fg)', fontSize: 14, lineHeight: 1.6 }}>
                  {q.explanation}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sticky Footer */}
      <div style={{
        padding: '20px 48px', borderTop: '1px solid var(--border)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface)', position: 'sticky', bottom: 0, zIndex: 100
      }}>
        {/* Progress dots */}
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {questions.map((_, i) => (
            <div
              key={i}
              style={{
                width: i === current ? 24 : 8, height: 8, borderRadius: 999,
                background: i < current ? 'var(--pass)' : i === current ? 'var(--accent)' : 'var(--border)',
                transition: 'width 0.3s, background 0.3s'
              }}
            />
          ))}
        </div>
        
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, padding: '12px 20px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer', borderRadius: 4 }}>
            ABORT
          </button>
          <button
            disabled={answered || selectedIndex === null}
            onClick={() => { if (!answered && selectedIndex !== null) handleSelect(selectedIndex); }}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase',
              padding: '14px 32px', borderRadius: 4,
              background: answered || selectedIndex === null ? 'var(--muted)' : 'var(--accent)',
              color: answered || selectedIndex === null ? 'var(--surface)' : 'var(--surface)',
              border: '1px solid var(--border)', cursor: answered || selectedIndex === null ? 'not-allowed' : 'pointer',
              boxShadow: answered || selectedIndex === null ? 'none' : '0 8px 24px rgba(0,163,255,0.3)',
              opacity: answered || selectedIndex === null ? 0.6 : 1,
              transition: 'all 0.15s'
            }}
          >
            {answered ? (current + 1 === questions.length ? 'FINISH' : 'NEXT →') : 'SUBMIT'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}