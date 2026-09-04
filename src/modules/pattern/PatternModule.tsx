import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';

const GRID_SIZE = 4;
const TOTAL_CELLS = GRID_SIZE * GRID_SIZE;

interface Level {
  label: string;
  color: string;
  bg: string;
  sequenceLength: number;
  flashMs: number;
}

const LEVELS: Level[] = [
  { label: 'Easy', color: 'var(--pass)', bg: 'rgba(34, 197, 94, 0.1)', sequenceLength: 4, flashMs: 750 },
  { label: 'Medium', color: 'var(--warn)', bg: 'rgba(234, 179, 8, 0.1)', sequenceLength: 6, flashMs: 550 },
  { label: 'Hard', color: 'var(--accent)', bg: 'rgba(56, 189, 248, 0.1)', sequenceLength: 8, flashMs: 380 },
];

type Phase = 'intro' | 'watch' | 'recall' | 'correct' | 'wrong' | 'done';

function generateSequence(length: number): number[] {
  return Array.from({ length }, () => Math.floor(Math.random() * TOTAL_CELLS));
}

export default function PatternModule() {
  const { recordResult, candidateName } = useAssessmentStore();
  const { play } = useSound();
  const navigate = useNavigate();

  const [levelIdx, setLevelIdx] = useState(0);
  const [phase, setPhase] = useState<Phase>('intro');
  const [sequence, setSequence] = useState<number[]>([]);
  const [flashIdx, setFlashIdx] = useState<number>(-1);
  const [selected, setSelected] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [countdown, setCountdown] = useState(0);

  if (!candidateName) return <Navigate to="/" />;

  const currentLevel = LEVELS[levelIdx];

  const advance = useCallback((s: number) => {
    if (levelIdx < LEVELS.length - 1) {
      setLevelIdx(prev => prev + 1);
      setScore(s);
      setPhase('intro');
    } else {
      recordResult({
        moduleId: 'pattern',
        score: s,
        total: LEVELS.length,
        skillTags: ['pattern_recognition', 'working_memory'],
        completed: true,
      });
      setPhase('done');
    }
  }, [levelIdx, recordResult]);

  const startLevel = useCallback(() => {
    const seq = generateSequence(currentLevel.sequenceLength);
    setSequence(seq);
    setPhase('watch');
    let i = 0;
    const interval = setInterval(() => {
      play(i === seq.length - 1 ? 'click' : 'click');
      setFlashIdx(seq[i]);
      i++;
      if (i >= seq.length) {
        clearInterval(interval);
        setTimeout(() => {
          setFlashIdx(-1);
          setPhase('recall');
          setSelected([]);
        }, currentLevel.flashMs);
      }
    }, currentLevel.flashMs + 200);
  }, [currentLevel, play]);

  const handleCellClick = (idx: number) => {
    if (phase !== 'recall') return;
    const nextSelected = [...selected, idx];
    setSelected(nextSelected);
    if (nextSelected[nextSelected.length - 1] !== sequence[nextSelected.length - 1]) {
      setPhase('wrong');
      setTimeout(() => advance(score), 1000);
    } else if (nextSelected.length === sequence.length) {
      setPhase('correct');
      setTimeout(() => advance(score + 1), 1000);
    }
  };

  return (
    <div style={{ padding: '2rem', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor: 'var(--surface)' }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <h3>Lv {levelIdx + 1} // Pattern</h3>
          <div style={{ color: currentLevel.color }}>{phase.toUpperCase()}</div>
        </div>

        <AnimatePresence mode="wait">
          {phase === 'intro' && (
            <motion.div key="intro" exit={{ opacity: 0 }} style={{ textAlign: 'center' }}>
              <h2>Challenge {levelIdx + 1}</h2>
              <button className="glow-btn" onClick={startLevel}>START</button>
            </motion.div>
          )}

          {(phase === 'watch' || phase === 'recall') && (
            <div style={{ display: 'grid', gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`, gap: '1rem' }}>
              {Array.from({ length: TOTAL_CELLS }).map((_, i) => (
                <motion.div
                  key={i}
                  onClick={() => handleCellClick(i)}
                  animate={{ 
                    scale: flashIdx === i ? 1.1 : 1,
                    boxShadow: flashIdx === i ? '0 0 20px amber' : 'none'
                  }}
                  style={{ height: '100px', background: 'var(--border)', cursor: 'pointer' }}
                />
              ))}
            </div>
          )}

          {phase === 'done' && (
            <div style={{ textAlign: 'center' }}>
              <h2>Complete</h2>
              <p>Score: {score}/{LEVELS.length}</p>
              <button onClick={() => navigate('/')}>Dashboard</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
