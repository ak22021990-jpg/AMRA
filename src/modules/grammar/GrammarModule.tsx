import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';

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
    question: 'Choose the sentence with the correct SVO structure.',
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
    question: 'Choose the sentence that correctly follows the SVO pattern.',
    options: ['The account the support team restricted.', 'Restricted the support team the account.', 'The support team restricted the account.', 'The account restricted the support team.'],
    correctIndex: 2, explanation: 'The support team (S) restricted (V) the account (O).',
  },
  {
    id: 'A5', section: 'A', sectionName: 'Subject-Verb-Object', skillTag: 'grammar',
    question: 'Which sentence follows the correct SVO structure?',
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
];

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
        navigate('/');
      }
    }, 1100);
  };

  if (!started) {
    return (
      <div style={{ maxWidth: 800, height: 'calc(100vh - 3px)', margin: '3px auto 0', display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', gap: 24, padding: 40 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--muted)', border: '1px solid var(--border)', padding: '6px 12px' }}>Section Grammar • 25 Questions</div>
        <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em', textAlign: 'center' }}>Grammar & Written Communication</h2>
        <p style={{ fontSize: 14, color: 'var(--muted)', maxWidth: 520, textAlign: 'center', lineHeight: 1.6 }}>
          5 sections: SVO (5) • SVA (5) • Tenses (5) • Connecting Words (5) • Punctuation (5).<br />Exact rollback to Grammar Assessment.docx. ~8 min.
        </p>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['A: SVO', 'B: Agreement', 'C: Tenses', 'D: Connectors', 'E: Punctuation'].map(t => (
            <span key={t} style={{ fontFamily: 'monospace', fontSize: 11, padding: '6px 10px', border: '1px solid var(--border)', background: 'var(--bg)' }}>{t}</span>
          ))}
        </div>
        <button onClick={() => setStarted(true)} style={{ background: 'var(--accent)', color: 'var(--surface)', border: '1px solid var(--border)', fontFamily: 'monospace', fontWeight: 700, fontSize: 13, textTransform: 'uppercase', padding: '14px 36px', boxShadow: '4px 4px 0 rgba(0,0,0,0.5)', cursor: 'pointer' }}>Start Grammar Test →</button>
      </div>
    );
  }

  const sectionProgress = `${q.section} • ${q.sectionName}`;
  const pct = Math.round(((current + 1) / questions.length) * 100);

  return (
    <div style={{ maxWidth: 860, height: 'calc(100vh - 3px)', margin: '3px auto 0', display: 'flex', flexDirection: 'column', background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
      <div style={{ padding: '20px 28px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg)' }}>
        <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' }}>{sectionProgress}</span>
        <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--muted)' }}>{current + 1} / {questions.length} • {pct}%</span>
      </div>
      <div style={{ height: 4, background: 'var(--border)' }}><div style={{ height: '100%', width: `${pct}%`, background: 'var(--accent)', transition: 'width 0.3s' }} /></div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>{q.id} — {q.sectionName}</div>
        <h2 style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.35, marginBottom: 24 }}>{q.question}</h2>
        <div style={{ display: 'grid', gap: 10 }}>
          {q.options.map((opt, i) => {
            let bg = 'var(--surface)', border = 'var(--border)', color = 'var(--fg)';
            if (answered && selectedIndex !== null) {
              if (i === q.correctIndex) { bg = 'var(--pass-bg)'; border = 'var(--pass)'; color = 'var(--pass)'; }
              else if (i === selectedIndex) { bg = 'var(--fail-bg)'; border = 'var(--fail)'; color = 'var(--fail)'; }
            }
            return (
              <button key={i} onClick={() => handleSelect(i)} disabled={answered}
                style={{ display: 'flex', gap: 14, alignItems: 'center', padding: 16, border: `1px solid ${border}`, background: bg, color, cursor: answered ? 'default' : 'pointer', textAlign: 'left', fontSize: 14, fontWeight: 600, boxShadow: '0 8px 32px rgba(0,0,0,0.35)', transition: 'all 0.12s' }}>
                <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, minWidth: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid currentColor', borderRadius: '50%' }}>{String.fromCharCode(65 + i)}</span>
                <span>{opt}</span>
              </button>
            );
          })}
        </div>
        {answered && <div style={{ marginTop: 16, padding: 14, background: 'var(--bg)', border: '1px solid var(--border)', fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>{q.explanation}</div>}
      </div>
      <div style={{ padding: '16px 28px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', background: 'var(--surface)' }}>
        <button onClick={() => navigate('/')} style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, padding: '10px 18px', border: '1px solid var(--border)', background: 'var(--surface)', cursor: 'pointer' }}>ABORT</button>
        <span style={{ fontFamily: 'monospace', fontSize: 11, color: 'var(--muted)', alignSelf: 'center' }}>{answered ? 'Next in 1s…' : 'Select an answer'}</span>
      </div>
    </div>
  );
}
