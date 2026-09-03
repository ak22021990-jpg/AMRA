import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion } from 'framer-motion';

const GRID_SIZE = 4; // 4x4
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

interface Level {
  label: string;
  color: string;
  bg: string;
  sequenceLength: number;
  flashMs: number;
  rounds: number;
}

const LEVELS: Level[] = [
  { label: 'Easy', color: 'var(--pass)', bg: 'var(--pass-bg)', sequenceLength: 4, flashMs: 800, rounds: 2 },
  { label: 'Medium', color: 'var(--warn)', bg: 'rgba(234, 179, 8, 0.1)', sequenceLength: 6, flashMs: 600, rounds: 2 },
  { label: 'Hard', color: 'var(--accent)', bg: 'rgba(56, 189, 248, 0.1)', sequenceLength: 8, flashMs: 400, rounds: 2 },
];

type Phase = 'intro' | 'watch' | 'recall' | 'correct' | 'wrong' | 'done';

function generateSequence(length: number): number[] {
  const seq: number[] = [];
  while (seq.length < length) {
    const n = Math.floor(Math.random() * TOTAL_CELLS);
    seq.push(n);
  }
  return seq;
}

export default function PatternModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();

  const [levelIdx, setLevelIdx] = useState(0);
  const [roundInLevel, setRoundInLevel] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [flashIdx, setFlashIdx] = useState<number>(-1);
  const [activeCell, setActiveCell] = useState<number>(-1);
  const [selected, setSelected] = useState<number[]>([]);
  const [results, setResults] = useState<boolean[]>([]);
  const [feedback, setFeedback] = useState<Record<number, 'correct' | 'wrong' | 'missed'>>({});
  const [countdownMs, setCountdownMs] = useState<number>(0);

  const totalRounds = LEVELS.reduce((s, l) => s + l.rounds, 0);
  const level = LEVELS[levelIdx];

  const startRound = useCallback(() => {
    const seq = generateSequence(level.sequenceLength);
    setSequence(seq);
    setSelected([]);
    setFeedback({});
    setFlashIdx(-1);
    setActiveCell(-1);
    const totalMs = level.sequenceLength * level.flashMs;
    setCountdownMs(totalMs);
    setPhase('watch');
  }, [level]);

  // Countdown timer during watch phase
  useEffect(() => {
    if (phase !== 'watch') return;
    const tick = 100;
    const interval = setInterval(() => {
      setCountdownMs(prev => Math.max(0, prev - tick));
    }, tick);
    return () => clearInterval(interval);
  }, [phase]);

  // Flash sequence effect
  useEffect(() => {
    if (phase !== 'watch') return;
    let step = -1;
    let cellTimeout: ReturnType<typeof setTimeout>;
    const interval = setInterval(() => {
      step++;
      if (step < sequence.length) {
        setFlashIdx(step);
        setActiveCell(sequence[step]);
        cellTimeout = setTimeout(() => setActiveCell(-1), level.flashMs * 0.6);
      } else {
        clearInterval(interval);
        setFlashIdx(-1);
        setActiveCell(-1);
        setPhase('recall');
      }
    }, level.flashMs);
    return () => {
      clearInterval(interval);
      clearTimeout(cellTimeout);
    };
  }, [phase, sequence, level.flashMs]);

  const handleCellClick = (cellIdx: number) => {
    if (phase !== 'recall') return;
    const newSelected = [...selected, cellIdx];
    setSelected(newSelected);

    const stepIdx = newSelected.length - 1;
    const expectedCell = sequence[stepIdx];

    if (cellIdx !== expectedCell) {
      const fb: Record<number, 'correct' | 'wrong' | 'missed'> = {};
      fb[cellIdx] = 'wrong';
      sequence.forEach(c => { if (!fb[c]) fb[c] = 'missed'; });
      setFeedback(fb);
      setPhase('wrong');
      const newResults = [...results, false];
      setResults(newResults);
      // Sound + streak tracking
      play('wrong');
      recordAnswer(false);
      setTimeout(() => advanceRound(newResults), 1600);
      return;
    }

    if (newSelected.length === sequence.length) {
      const fb: Record<number, 'correct' | 'wrong' | 'missed'> = {};
      sequence.forEach(c => { fb[c] = 'correct'; });
      setFeedback(fb);
      setPhase('correct');
      const newResults = [...results, true];
      setResults(newResults);
      // Sound + streak tracking
      play('correct');
      recordAnswer(true);
      setTimeout(() => advanceRound(newResults), 1200);
    }
  };

  const handleCellKeyDown = (cellIdx: number, e: React.KeyboardEvent) => {
    if (phase !== 'recall') return;
    let nextCell = cellIdx;
    switch (e.key) {
      case 'ArrowRight': nextCell = cellIdx + 1; break;
      case 'ArrowLeft': nextCell = cellIdx - 1; break;
      case 'ArrowDown': nextCell = cellIdx + 4; break;
      case 'ArrowUp': nextCell = cellIdx - 4; break;
      case 'Enter': case ' ':
        e.preventDefault();
        handleCellClick(cellIdx);
        return;
      default: return;
    }
    e.preventDefault();
    if (nextCell >= 0 && nextCell < TOTAL_CELLS) {
      const nextEl = document.querySelector(`[data-cell="${nextCell}"]`) as HTMLElement;
      nextEl?.focus();
    }
  };

  useEffect(() => {
    if (phase === 'recall') {
      const firstCell = document.querySelector('[data-cell="0"]') as HTMLElement;
      firstCell?.focus();
    }
  }, [phase]);

  const advanceRound = (currentResults: boolean[]) => {
    const nextRound = roundInLevel + 1;
    if (nextRound < level.rounds) {
      setRoundInLevel(nextRound);
      setPhase('intro');
    } else {
      const nextLevel = levelIdx + 1;
      if (nextLevel < LEVELS.length) {
        setLevelIdx(nextLevel);
        setRoundInLevel(0);
        setPhase('intro');
      } else {
        const score = currentResults.filter(Boolean).length;
        const hardRounds = currentResults.slice(4);
        const skillTags = ['spatial_memory'];
        if (hardRounds.every(Boolean)) skillTags.push('rapid_pattern_recall');
        recordResult({
          moduleId: 'pattern',
          score,
          total: totalRounds,
          skillTags,
          completed: true,
        });
        setPhase('done');
      }
    }
  };

  if (!candidateName) {
    return <Navigate to="/" replace />;
  }

  if (phase === 'done') {
    const score = results.filter(Boolean).length;
    return (
      <div className="anim-scale-in" style={{
        maxWidth: 700,
        height: 'calc(100vh - 3px)',
        margin: '3px auto 0',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
      }}>
        {/* Header */}
        <div style={{
          padding: 24,
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--bg)',
        }}>
          <span style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const }}>
            MEM-SEQ // COMPLETE
          </span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 40, textAlign: 'center' }}>
          <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>Assessment Complete</h2>
          <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 32 }}>Pattern Recognition finished.</p>

          <div style={{
            display: 'flex',
            gap: 40,
            marginBottom: 32,
            padding: '24px 40px',
            border: '1px solid var(--border)',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Score</div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em' }}>{score}/{totalRounds}</div>
            </div>
            <div>
              <div style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 700, textTransform: 'uppercase' as const, marginBottom: 4 }}>Accuracy</div>
              <div style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em' }}>{Math.round((score / totalRounds) * 100)}%</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
            {results.map((r, i) => (
              <span key={i} style={{
                width: 32, height: 32,
                background: r ? 'var(--pass)' : 'var(--fail)',
                border: '1px solid var(--border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--surface)', fontWeight: 700, fontSize: 14,
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              }}>{r ? '✓' : '✗'}</span>
            ))}
          </div>

          <button
            onClick={() => navigate('/')}
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              background: 'var(--accent)',
              color: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '12px 32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              cursor: 'pointer',
            }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Cell styling per proto
  const getCellStyle = (cellIdx: number): React.CSSProperties => {
    const isFlashing = activeCell === cellIdx;
    const fb = feedback[cellIdx];
    const isSelected = selected.includes(cellIdx);

    let bg = 'var(--surface)';
    let borderColor = 'var(--border)';
    let boxShadow = '4px 4px 0 rgba(0,0,0,0.5)';
    let transform = 'none';

    if (isFlashing) {
      // .cell.active
      bg = 'var(--border)';
      borderColor = 'var(--border)';
      boxShadow = '0 0 0';
      transform = 'translate(4px,4px)';
    } else if (fb === 'correct') {
      // .cell.correct-recall
      bg = 'var(--pass)';
      borderColor = 'var(--pass)';
      boxShadow = '0 0 0';
      transform = 'translate(4px,4px)';
    } else if (fb === 'wrong') {
      // .cell.wrong-recall
      bg = 'var(--fail)';
      borderColor = 'var(--fail)';
      boxShadow = '0 0 0';
      transform = 'translate(4px,4px)';
    } else if (fb === 'missed') {
      bg = 'var(--muted)';
      borderColor = 'var(--muted)';
      boxShadow = '0 0 0';
      transform = 'translate(4px,4px)';
    } else if (phase === 'recall' && isSelected) {
      bg = 'var(--accent)';
      borderColor = 'var(--accent)';
      boxShadow = '0 0 0';
      transform = 'translate(4px,4px)';
    }

    return {
      aspectRatio: '1',
      border: `2px solid ${borderColor}`,
      background: bg,
      cursor: phase === 'recall' ? 'pointer' : 'default',
      boxShadow,
      transition: 'all 0.1s',
      transform,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    };
  };

  const isShowPhase = phase === 'watch';
  const isRecallPhase = phase === 'recall';
  const countdownSec = (countdownMs / 1000).toFixed(1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        maxWidth: 700,
        height: 'calc(100vh - 3px)',
        margin: '3px auto 0',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        padding: 24,
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        background: 'var(--bg)',
        flexShrink: 0,
      }}>
        <span style={{
          fontFamily: 'monospace',
          fontSize: 12,
          fontWeight: 700,
          textTransform: 'uppercase',
        }}>
          MEM-SEQ // Lvl {levelIdx + 1}
        </span>
        {isShowPhase && (
          <span style={{
            fontFamily: 'monospace',
            fontSize: 16,
            fontWeight: 700,
            color: 'var(--fail)',
          }}>
            T - {countdownSec}s
          </span>
        )}
        {isRecallPhase && (
          <span style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 700,
            color: 'var(--fg)',
          }}>
            {selected.length} / {sequence.length} selected
          </span>
        )}
        {(phase === 'correct' || phase === 'wrong') && (
          <span style={{
            fontFamily: 'monospace',
            fontSize: 14,
            fontWeight: 700,
            color: phase === 'correct' ? 'var(--pass)' : 'var(--fail)',
          }}>
            {phase === 'correct' ? '✓ CORRECT' : '✗ WRONG'}
          </span>
        )}
      </div>

      {/* Instructions */}
      <div style={{
        padding: '40px',
        textAlign: 'center',
        borderBottom: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {phase === 'intro' && (
          <>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Ready for {level.label}?
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 20 }}>
              Memorize {level.sequenceLength} cells · Round {roundInLevel + 1} of {level.rounds}
            </p>
            <button
              onClick={startRound}
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                background: 'var(--accent)',
                color: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: '12px 32px',
                boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
                cursor: 'pointer',
              }}
            >
              Start Round ▶
            </button>
          </>
        )}
        {isShowPhase && (
          <>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Memorize the Pattern
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              Watch carefully — the pattern will disappear.
            </p>
          </>
        )}
        {isRecallPhase && (
          <>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8 }}>
              Reconstruct the Sequence
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>
              Select the tiles in the exact order they appeared.
            </p>
          </>
        )}
        {phase === 'correct' && (
          <>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--pass)' }}>
              ✓ Correct!
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>Moving to next round…</p>
          </>
        )}
        {phase === 'wrong' && (
          <>
            <h2 style={{ fontSize: 24, letterSpacing: '-0.02em', marginBottom: 8, color: 'var(--fail)' }}>
              ✗ Incorrect
            </h2>
            <p style={{ color: 'var(--muted)', fontSize: 15 }}>Correct cells shown — moving on…</p>
          </>
        )}
      </div>

      {/* Grid zone */}
      <div style={{
        flex: 1,
        padding: 64,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'var(--bg)',
      }}>
        <div
          role="grid"
          aria-label="Pattern memory grid"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
            gap: 12,
            maxWidth: 400,
            width: '100%',
          }}
        >
          {Array.from({ length: TOTAL_CELLS }, (_, i) => (
            <motion.div
              key={i}
              data-cell={i}
              role="gridcell"
              tabIndex={phase === 'recall' ? 0 : -1}
              aria-label={`Cell ${Math.floor(i / 4) + 1}, ${i % 4 + 1}`}
              onClick={() => handleCellClick(i)}
              onKeyDown={(e) => handleCellKeyDown(i, e)}
              style={getCellStyle(i)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {activeCell === i && flashIdx >= 0 && (
                <span style={{ color: 'var(--surface)', fontWeight: 800, fontSize: 18, fontFamily: 'monospace' }}>
                  {flashIdx + 1}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: 24,
        display: 'flex',
        justifyContent: 'center',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        flexShrink: 0,
      }}>
        {isRecallPhase && (
          <button
            onClick={() => {
              // Submit: if not enough selected, treat as wrong
              if (selected.length < sequence.length) {
                const fb: Record<number, 'correct' | 'wrong' | 'missed'> = {};
                selected.forEach(c => { fb[c] = 'wrong'; });
                sequence.forEach(c => { if (!fb[c]) fb[c] = 'missed'; });
                setFeedback(fb);
                setPhase('wrong');
                const newResults = [...results, false];
                setResults(newResults);
                setTimeout(() => advanceRound(newResults), 1600);
              }
            }}
            style={{
              fontFamily: 'monospace',
              fontSize: 13,
              fontWeight: 700,
              textTransform: 'uppercase' as const,
              background: 'var(--accent)',
              color: 'var(--surface)',
              border: '1px solid var(--border)',
              padding: '12px 32px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
              cursor: 'pointer',
            }}
          >
            Submit Pattern
          </button>
        )}
        {!isRecallPhase && (
          <div style={{ height: 46 }} /> // spacer to keep footer height consistent
        )}
      </div>
    </motion.div>
  );
}
