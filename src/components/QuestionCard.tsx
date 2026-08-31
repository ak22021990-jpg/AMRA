import { useState, useEffect } from 'react';

interface QuestionCardProps {
  questionNumber: number;
  totalQuestions: number;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  onAnswer: (isCorrect: boolean, elapsedMs: number) => void;
  tag?: string;
  disabled?: boolean;
  showFeedback?: boolean;
}

export default function QuestionCard({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  tag,
  disabled = false,
  showFeedback = true,
}: QuestionCardProps) {
  const [selected, setSelected] = useState<number | null>(null);
  const [startTime] = useState(() => Date.now());
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    setSelected(null);
    setElapsed(0);
  }, [question]);

  useEffect(() => {
    if (selected !== null) return;
    const id = setInterval(() => setElapsed(Date.now() - startTime), 1000);
    return () => clearInterval(id);
  }, [startTime, selected]);

  const handleSelect = (index: number) => {
    if (selected !== null || disabled) return;
    setSelected(index);
    setElapsed(Date.now() - startTime);
    onAnswer(index === correctIndex, Date.now() - startTime);
  };

  const getOptionClass = (index: number): string => {
    if (selected === null) return 'option';
    if (!showFeedback) return 'option';
    if (index === correctIndex) return 'option correct';
    if (index === selected) return 'option wrong';
    return 'option';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{
          fontSize: 12, fontWeight: 800, color: 'var(--muted)',
          textTransform: 'uppercase', letterSpacing: '0.06em'
        }}>
          Question {questionNumber} of {totalQuestions}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{
            fontSize: 12, fontWeight: 700, color: 'var(--muted)',
            fontVariantNumeric: 'tabular-nums',
          }}>
            {Math.floor(elapsed / 60000)}:{String(Math.floor((elapsed % 60000) / 1000)).padStart(2, '0')}
          </span>
          {tag && (
            <span style={{
              padding: '5px 10px', borderRadius: 999,
              background: 'var(--surface-subtle)', color: 'var(--ink)',
              fontSize: 11, fontWeight: 700, letterSpacing: '0.05em'
            }}>
              {tag}
            </span>
          )}
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        {/* Progress bar */}
        <div className="bar">
          <div style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <p style={{
        fontSize: 22, lineHeight: 1.3, letterSpacing: '-0.02em',
        margin: '8px 0 16px', fontWeight: 700
      }}>
        {question}
      </p>

      <div style={{ display: 'grid', gap: 10 }}>
        {options.map((opt, i) => (
          <button
            key={i}
            className={getOptionClass(i)}
            onClick={() => handleSelect(i)}
            disabled={selected !== null || disabled}
            style={{
              textAlign: 'left', width: '100%',
              padding: '14px 15px',
              border: `1px solid ${
                selected === null ? 'var(--line)'
                : !showFeedback
                  ? i === selected ? 'var(--accent)' : 'var(--line)'
                : i === correctIndex ? 'var(--good-border)'
                : i === selected ? 'var(--bad-border)'
                : 'var(--line)'
              }`,
              borderRadius: 13,
              background: selected === null ? 'var(--panel)'
                : !showFeedback ? 'var(--panel)'
                : i === correctIndex ? 'var(--good-bg)'
                : i === selected ? 'var(--bad-bg)'
                : 'var(--panel)',
              color: 'var(--ink)',
              cursor: selected !== null ? 'default' : 'pointer',
              fontWeight: 650, lineHeight: 1.35,
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <span style={{
              display: 'inline-block', width: 26, height: 26,
              borderRadius: '50%', background: 'var(--surface-subtle)',
              textAlign: 'center', lineHeight: '26px',
              fontSize: 12, fontWeight: 800, marginRight: 10,
              color: 'var(--ink)'
            }}>
              {!showFeedback && selected === i ? '✓' : String.fromCharCode(65 + i)}
            </span>
            {opt}
          </button>
        ))}
      </div>

      {selected !== null && showFeedback && (
        <div style={{
          marginTop: 4, borderRadius: 15, padding: '15px 16px',
          fontSize: 14, lineHeight: 1.5,
          background: selected === correctIndex ? 'var(--good-bg)' : 'var(--bad-bg)',
          color: selected === correctIndex ? 'var(--good)' : 'var(--bad)',
          border: `1px solid ${selected === correctIndex ? 'var(--good-border)' : 'var(--bad-border)'}`,
        }}>
          <strong>{selected === correctIndex ? 'Correct' : 'Incorrect'}</strong>
          <br />
          {explanation}
        </div>
      )}
    </div>
  );
}
