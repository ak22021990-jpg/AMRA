import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';

interface ErrorItem {
  id: number;
  section: string;
  sectionName: string;
  skillTag: string;
  errorText: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

// 5 errors covering all 5 sections from the docx assessment
const errors: ErrorItem[] = [
  {
    id: 0,
    section: 'A',
    sectionName: 'Subject-Verb-Object Structure',
    skillTag: 'grammar',
    errorText: 'The transaction reviewed the agent',
    options: [
      'The transaction reviewed the agent.',
      'The agent reviewed the transaction.',
      'Reviewed the agent the transaction.',
      'The transaction the agent reviewed.',
    ],
    correctIndex: 1,
    explanation: 'Subject (The agent) → Verb (reviewed) → Object (the transaction). Option A reverses subject and object.',
  },
  {
    id: 1,
    section: 'B',
    sectionName: 'Subject-Verb Agreement',
    skillTag: 'grammar',
    errorText: 'was incomplete',
    options: [
      'is incomplete',
      'was incomplete',
      'are incomplete',
      'has incomplete',
    ],
    correctIndex: 2,
    explanation: "'Documents' is plural → 'are' is the correct verb.",
  },
  {
    id: 2,
    section: 'C',
    sectionName: 'Tenses',
    skillTag: 'grammar',
    errorText: 'submit',
    options: [
      'submit',
      'submitted',
      'has submitted',
      'will submit',
    ],
    correctIndex: 2,
    explanation: "Present perfect 'has submitted' is correct — action completed with present relevance ('the team is now reviewing them').",
  },
  {
    id: 3,
    section: 'D',
    sectionName: 'Connecting Words',
    skillTag: 'written_communication',
    errorText: 'however the information',
    options: [
      'however the information',
      '; however, the information',
      ', however the information',
      'however; the information',
    ],
    correctIndex: 1,
    explanation: "A semicolon before 'however' and a comma after it are required when using a conjunctive adverb to join two independent clauses.",
  },
  {
    id: 4,
    section: 'E',
    sectionName: 'Punctuation',
    skillTag: 'written_communication',
    errorText: 'Before we proceed could you please confirm the details',
    options: [
      'Before we proceed could you please confirm the details',
      'Before we proceed, could you please confirm the details.',
      'Before we proceed, could you please confirm the details?',
      'Before we proceed could you please confirm the details.',
    ],
    correctIndex: 2,
    explanation: "A comma after the introductory phrase 'Before we proceed' and a question mark at the end are required.",
  },
];

// Full passage with 5 embedded errors
type Segment = { text: string; errorId?: number };

const passageSegments: Segment[] = [
  { text: 'During the audit of customer interactions, the team identified several areas requiring correction. First, ' },
  { text: 'The transaction reviewed the agent', errorId: 0 },
  { text: '. The case file was examined thoroughly, and the following issues were noted in the documentation submitted by the customer.' },
  { text: ' The documents submitted by the customer ' },
  { text: 'was incomplete', errorId: 1 },
  { text: ', and additional follow-up was required. The customer ' },
  { text: 'submit', errorId: 2 },
  { text: ' the required forms, and the team is now reviewing them.' },
  { text: ' The review process confirmed that the original transaction was legitimate; ' },
  { text: 'however the information', errorId: 3 },
  { text: ' provided initially contained inconsistencies that needed clarification.' },
  { text: ' In closing, ' },
  { text: 'Before we proceed could you please confirm the details', errorId: 4 },
  { text: ' so that the case may be resolved promptly.' },
];

type ErrorState = { chosen: number | null };

export default function GrammarModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult } = useAssessmentStore();
  const [errorStates, setErrorStates] = useState<ErrorState[]>(
    errors.map(() => ({ chosen: null }))
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [started, setStarted] = useState(false);

  if (!candidateName) {
    return <Navigate to="/" replace />;
  }

  const attemptedCount = errorStates.filter(s => s.chosen !== null).length;
  const remaining = errors.length - attemptedCount;
  const allAttempted = remaining === 0;

  const handleChoose = (errorId: number, optionIdx: number) => {
    setErrorStates(prev =>
      prev.map((s, i) => (i === errorId ? { chosen: optionIdx } : s))
    );
  };

  const handleFinalize = () => {
    const score = errorStates.filter(
      (s, i) => s.chosen === errors[i].correctIndex
    ).length;
    recordResult({
      moduleId: 'grammar',
      score,
      total: errors.length,
      skillTags: [...new Set(errors.map(e => e.skillTag))],
      completed: true,
    });
    navigate('/');
  };

  if (!started) {
    return (
      <div style={{
        maxWidth: 1000, height: 'calc(100vh - 3px)', margin: '3px auto 0',
        display: 'flex', flexDirection: 'column',
        background: '#fff', border: '2px solid #111', boxShadow: '12px 12px 0 rgba(0,0,0,1)',
        justifyContent: 'center', alignItems: 'center', gap: 24,
      }}>
        <div style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Document Correction
        </div>
        <p style={{ fontFamily: 'Georgia, serif', fontSize: 18, color: '#444', maxWidth: 480, textAlign: 'center', lineHeight: 1.7 }}>
          Read the passage below. Click highlighted errors and select the correct fix.
          5 errors · ~4 min
        </p>
        <button
          onClick={() => setStarted(true)}
          style={{
            background: '#0055ff', color: '#fff', border: '2px solid #111',
            fontFamily: 'monospace', fontWeight: 700, fontSize: 14,
            textTransform: 'uppercase', padding: '14px 32px',
            boxShadow: '4px 4px 0 rgba(0,0,0,1)', cursor: 'pointer', letterSpacing: '0.08em',
          }}
        >
          Start Module
        </button>
      </div>
    );
  }

  const selectedError = selectedId !== null ? errors[selectedId] : null;
  const selectedState = selectedId !== null ? errorStates[selectedId] : null;

  return (
    <div style={{
      maxWidth: 1000, height: 'calc(100vh - 3px)', margin: '3px auto 0',
      display: 'flex', flexDirection: 'column',
      background: '#fff', border: '2px solid #111', boxShadow: '12px 12px 0 rgba(0,0,0,1)',
    }}>
      {/* Header */}
      <div style={{
        padding: '24px 32px', borderBottom: '2px solid #111',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: '#fff',
      }}>
        <span style={{ fontFamily: 'monospace', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Document Correction
        </span>
        <span style={{ fontFamily: 'monospace', fontSize: 14, textTransform: 'uppercase', color: '#666', letterSpacing: '0.08em' }}>
          Remaining: {remaining}
        </span>
      </div>

      {/* Main body */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Editorial pane */}
        <div style={{
          flex: 1, padding: 64, overflowY: 'auto',
          fontFamily: 'Georgia, serif', fontSize: 20, lineHeight: 1.8, color: '#222',
        }}>
          <p>
            {passageSegments.map((seg, idx) => {
              if (seg.errorId === undefined) {
                return <span key={idx}>{seg.text}</span>;
              }
              const eId = seg.errorId;
              const state = errorStates[eId];
              const err = errors[eId];
              const isFixed = state.chosen === err.correctIndex;
              const isWrong = state.chosen !== null && !isFixed;
              const isSelected = selectedId === eId;

              let spanStyle: React.CSSProperties = {
                cursor: 'pointer',
                transition: 'background 0.15s',
              };

              if (isFixed) {
                spanStyle = {
                  ...spanStyle,
                  background: 'rgba(0,200,0,0.1)',
                  borderBottom: '2px solid #008833',
                  color: '#008833',
                };
              } else if (isWrong) {
                spanStyle = {
                  ...spanStyle,
                  background: 'rgba(217,48,37,0.15)',
                  borderBottom: '2px dotted #d93025',
                };
              } else {
                spanStyle = {
                  ...spanStyle,
                  background: isSelected ? 'rgba(217,48,37,0.2)' : 'rgba(217,48,37,0.1)',
                  borderBottom: '2px dotted #d93025',
                };
              }

              const displayText = isFixed
                ? err.options[err.correctIndex]
                : seg.text;

              return (
                <span
                  key={idx}
                  style={spanStyle}
                  onClick={() => setSelectedId(eId)}
                >
                  {displayText}
                </span>
              );
            })}
          </p>
        </div>

        {/* Sidebar */}
        <div style={{
          width: 320, background: '#f9f9f9', borderLeft: '2px solid #111',
          display: 'flex', flexDirection: 'column',
        }}>
          {/* Task meta */}
          <div style={{ padding: 24, borderBottom: '2px solid #111' }}>
            <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: '#666', letterSpacing: '0.1em', marginBottom: 8 }}>
              Selected Error
            </div>
            {selectedError ? (
              <>
                <div style={{ fontWeight: 600, fontSize: 18, fontFamily: 'Georgia, serif', marginBottom: 6 }}>
                  "{selectedError.errorText}"
                </div>
                <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: '#888', letterSpacing: '0.08em' }}>
                  {selectedError.sectionName}
                </div>
              </>
            ) : (
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 16, color: '#999', fontStyle: 'italic' }}>
                Click an underlined error in the passage
              </div>
            )}
          </div>

          {/* Action panel */}
          <div style={{ padding: 24, flex: 1, display: 'flex', flexDirection: 'column', gap: 12, overflowY: 'auto' }}>
            {selectedError ? (
              <>
                <div style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: '#666', letterSpacing: '0.1em', marginBottom: 4 }}>
                  Select Correction
                </div>
                {selectedError.options.map((opt, idx) => {
                  const chosen = selectedState!.chosen;
                  const isChosen = chosen === idx;
                  const isCorrect = idx === selectedError.correctIndex;
                  const showResult = chosen !== null;

                  let btnStyle: React.CSSProperties = {
                    border: '2px solid #111',
                    padding: 16,
                    background: '#fff',
                    cursor: 'pointer',
                    boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                    fontFamily: 'monospace',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    width: '100%',
                    transition: 'transform 0.1s, box-shadow 0.1s',
                  };

                  if (showResult && isChosen && isCorrect) {
                    btnStyle = { ...btnStyle, background: '#e6f6ec', borderColor: '#008833', color: '#008833', boxShadow: '2px 2px 0 rgba(0,0,0,1)' };
                  } else if (showResult && isChosen && !isCorrect) {
                    btnStyle = { ...btnStyle, background: '#fae8e6', borderColor: '#d92211', color: '#d92211', boxShadow: '2px 2px 0 rgba(0,0,0,1)' };
                  } else if (showResult && !isChosen && isCorrect) {
                    btnStyle = { ...btnStyle, background: '#e6f6ec', borderColor: '#008833', color: '#008833' };
                  }

                  return (
                    <button
                      key={idx}
                      style={btnStyle}
                      disabled={chosen !== null}
                      onClick={() => handleChoose(selectedError.id, idx)}
                    >
                      {opt}
                    </button>
                  );
                })}
                {selectedState!.chosen !== null && (
                  <div style={{ fontFamily: 'Georgia, serif', fontSize: 13, color: '#555', lineHeight: 1.5, marginTop: 4, fontStyle: 'italic' }}>
                    {selectedError.explanation}
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: '#bbb', fontFamily: 'monospace', fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                No error selected
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: 24, borderTop: '2px solid #111',
        display: 'flex', justifyContent: 'flex-end', background: '#fff',
      }}>
        <button
          onClick={handleFinalize}
          disabled={!allAttempted}
          style={{
            background: allAttempted ? '#0055ff' : '#ccc',
            color: '#fff',
            border: '2px solid #111',
            fontFamily: 'monospace',
            fontWeight: 700,
            fontSize: 14,
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            padding: '14px 32px',
            boxShadow: allAttempted ? '4px 4px 0 rgba(0,0,0,1)' : 'none',
            cursor: allAttempted ? 'pointer' : 'not-allowed',
          }}
        >
          Finalize Module
        </button>
      </div>
    </div>
  );
}
