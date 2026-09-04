import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion } from 'framer-motion';

const questions = [
  // Demo: 3 Qs — one per state (critical)
  {
    state: 'Arizona', stateCode: 'AZ', skillTag: 'state_knowledge', critical: true,
    videoLabel: 'AZ · School Bus Stop — Critical',
    videoFile: 'Q1.mp4',
    videoPrompt: 'School bus, red lights, stop arm out',
    question: 'A school bus ahead has stopped with red lights flashing and its stop arm extended. What should the driver do?',
    options: ['Stop only if you are behind the bus','Stop regardless of your direction of travel on an undivided roadway','Slow down to 15 mph and pass cautiously','Honk to alert the bus driver and proceed'],
    correctIndex: 1,
    explanation: 'In Arizona, you must stop for a school bus with flashing red lights and an extended stop arm on any undivided roadway, regardless of direction.',
  },
  {
    state: 'California', stateCode: 'CA', skillTag: 'occlusion', critical: true,
    videoLabel: 'CA · Double-Parked Van — Critical',
    videoFile: 'Q8.mp4',
    videoPrompt: 'Double-parked delivery van before crosswalk',
    question: 'A white delivery van double-parked before the crosswalk hides the near curb entirely. How should you proceed?',
    options: ['Hold speed and pass tightly','Swerve sharply without checking','Slow, creep left around the van while scanning the hidden crosswalk for pedestrians','Stop permanently and wait for the van to leave'],
    correctIndex: 2,
    explanation: 'Double-parked van creates full occlusion of the crosswalk entry. Slow, shift left to open sightlines, be ready to stop — critical pedestrian zone.',
  },
  {
    state: 'New York', stateCode: 'NY', skillTag: 'complex_decision', critical: true,
    videoLabel: 'NY · Aggressive Merge — Critical',
    videoFile: 'Q15.mp4',
    videoPrompt: 'Aggressive driver forcing into the lane',
    question: 'In heavy traffic a black SUV in the adjacent lane forces its nose into your lane with minimal gap and no signal. What is the safest response?',
    options: ['Accelerate to close the gap','Force the SUV out by holding speed','Lift off the accelerator, maintain gap and allow the incomplete maneuver to complete without contact','Swerve into oncoming traffic'],
    correctIndex: 2,
    explanation: 'Defensive yielding: lift off, preserve gap, allow the aggressive merge to complete without contact. Do not contest the gap.',
  },
].slice(0, 3);

export default function DrivingModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(60);
  
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [done, setDone] = useState(false);

  if (!candidateName) {
    return <Navigate to="/" replace />;
  }

  const q = questions[current]!;

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

  const handleSelect = (optionIndex: number) => {
    if (answered) return;
    setSelectedIndex(optionIndex);
  };

  const handleSubmit = () => {
    if (answered || selectedIndex === null) return;
    const isCorrect = selectedIndex === q.correctIndex;
    setAnswered(true);
    const newAnswers = [...answers, isCorrect];
    setAnswers(newAnswers);

    play(isCorrect ? 'correct' : 'wrong');
    recordAnswer(isCorrect);

    setTimeout(() => {
      if (current + 1 < questions.length) {
        setCurrent(current + 1);
        setAnswered(false);
        setSelectedIndex(null);
      } else {
        try {
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
          play('module-complete');
        } catch (e) {
          console.error(e);
        } finally {
          setDone(true);
        }
      }
    }, 1500);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  if (done) {
    const score = answers.filter(Boolean).length;
    return (
      <div className="anim-scale-in" style={{
        width: '100%', maxWidth: 1440, minHeight: '100dvh',
        margin: '0 auto', display: 'flex', flexDirection: 'column',
        background: 'var(--bg)', fontFamily: 'var(--font-display)',
      }}>
        <div style={{
          padding: '24px 48px',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          borderBottom: '1px solid var(--border)'
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, display: 'flex', gap: 16 }}>
            <span style={{ color: 'var(--accent)' }}>ZONE 01</span>
            <span style={{ color: 'var(--muted)' }}>//</span>
            <span>US Driving Behavior</span>
          </div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--pass)' }}>COMPLETE</div>
        </div>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
          <div className="bento-card" style={{ textAlign: 'center', maxWidth: 480, width: '100%' }}>
            <div className="kicker" style={{ marginBottom: 16 }}>Module Complete</div>
            <div style={{ fontSize: 72, fontWeight: 700, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16, color: 'var(--fg)' }}>
              {score}/{questions.length}
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 16, color: 'var(--muted)' }}>
              {Math.round((score / questions.length) * 100)}% Accuracy Achieved
            </div>
            <div style={{ marginTop: 40 }}>
              <button onClick={() => navigate('/')} className="btn btn-primary" style={{ width: '100%' }}>
                RETURN TO HUB
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        width: '100%', minHeight: '100dvh',
        background: 'var(--bg)', display: 'flex', flexDirection: 'column'
      }}
    >
      {/* Immersive Top Bar (Matching ZIP's header telemetry styling) */}
      <div style={{
        padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        background: 'var(--surface)', borderBottom: '1px solid var(--border)',
        position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, color: 'var(--accent)', letterSpacing: '0.1em' }}>
            SCENARIO-0{current + 1}
          </span>
          <span style={{ color: 'var(--muted)' }}>/</span>
          <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 600, color: 'var(--fg)' }}>
            {q.videoLabel}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 16px', background: 'var(--surface-subtle)', borderRadius: 999, border: '1px solid var(--border)' }}>
            <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--muted)', fontWeight: 700, letterSpacing: '0.05em' }}>{q.state}</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: timeLeft < 30 ? 'var(--fail)' : 'var(--accent)' }}>
              {formatTime(timeLeft)}
            </span>
          </div>
          <button onClick={() => navigate('/')} className="btn" style={{ padding: '8px 16px', fontSize: 12 }}>
            ABORT
          </button>
        </div>
      </div>

      {/* 65% / 35% Split Layout (Matching ZIP's lg:grid-cols-12 layout) */}
      <div style={{ 
        flex: 1, padding: '32px 48px', display: 'grid', 
        gridTemplateColumns: 'minmax(0, 8fr) minmax(0, 4fr)', gap: 32, 
        maxWidth: 1440, margin: '0 auto', width: '100%', alignItems: 'start'
      }}>
        
        {/* Left: 65% Simulated 16:9 AV Perception HUD */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="bento-card" style={{ 
            padding: 0, overflow: 'hidden', width: '100%', aspectRatio: '16/9', 
            background: 'var(--midnight)', position: 'relative'
          }}>
            <video
              key={q.videoFile}
              src={`${import.meta.env.BASE_URL}video/${q.videoFile}`}
              autoPlay muted loop playsInline
              style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }}
              onError={(e) => {
                (e.target as HTMLVideoElement).style.display = 'none';
                const fallback = document.createElement('div');
                fallback.style.cssText = "position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=1200') center/cover;filter:contrast(1.2) grayscale(0.2);";
                (e.target as HTMLVideoElement).parentNode?.appendChild(fallback);
              }}
            />
            {/* Top HUD Overlay (Live Perception Stream) */}
            <div style={{
              position: 'absolute', top: 16, left: 16, right: 16,
              display: 'flex', justifyContent: 'space-between', pointerEvents: 'none'
            }}>
              <div style={{
                padding: '6px 12px', background: 'rgba(7, 13, 30, 0.8)', backdropFilter: 'blur(8px)',
                borderRadius: 999, color: '#fff', fontSize: 11, fontWeight: 600, border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex', alignItems: 'center', gap: 8
              }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></span>
                LIVE PERCEPTION STREAM
              </div>
            </div>
            
            {/* Playback scrubbing bar bottom */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0, padding: 16,
              background: 'linear-gradient(to top, rgba(7, 13, 30, 0.9), transparent)'
            }}>
              <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ width: '60%', height: '100%', background: 'var(--accent)', boxShadow: '0 0 8px var(--accent)' }}></div>
              </div>
            </div>
          </div>
          
          {/* Metadata Bar */}
          <div className="bento-card" style={{ padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <div style={{ display: 'flex', gap: 16, color: 'var(--muted)', fontSize: 13, fontFamily: 'var(--font-mono)' }}>
               <span>Front HD Stereoscopic Array</span>
               <span>•</span>
               <span>Exposure: Auto HDR</span>
               <span>•</span>
               <span>Latency: 14ms</span>
             </div>
          </div>
        </section>

        {/* Right: 35% Gamified Decision Bento Card */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="bento-card" style={{ display: 'flex', flexDirection: 'column', minHeight: 600, padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 16, borderBottom: '1px solid var(--border)', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700 }}>Behavior Protocol</span>
              </div>
              <span style={{ padding: '4px 8px', background: 'var(--accent-bg)', color: 'var(--accent)', fontSize: 11, fontWeight: 700, borderRadius: 999 }}>AMRA-PASS</span>
            </div>

            <div style={{ padding: 16, background: 'var(--surface-subtle)', borderRadius: 16, border: '1px solid var(--border)', marginBottom: 24 }}>
              <span style={{ display: 'block', fontSize: 11, color: 'var(--muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: 8, fontFamily: 'var(--font-mono)' }}>Real-Time Event Prompt</span>
              <p style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.5, color: 'var(--fg)', margin: 0 }}>
                {q.question}
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, flex: 1 }}>
              {q.options.map((opt, i) => {
                let bg = 'var(--surface)';
                let borderColor = 'var(--border)';
                let letterBg = 'var(--surface-2)';
                let letterColor = 'var(--fg)';
                
                if (!answered && selectedIndex === i) {
                  borderColor = 'var(--accent)';
                  bg = 'var(--accent-bg)';
                  letterBg = 'var(--accent)';
                  letterColor = '#fff';
                } else if (answered && selectedIndex !== null) {
                  if (i === q.correctIndex) {
                    bg = 'var(--pass-bg)';
                    borderColor = 'var(--pass)';
                    letterBg = 'var(--pass)';
                    letterColor = '#fff';
                  } else if (i === selectedIndex && i !== q.correctIndex) {
                    bg = 'var(--fail-bg)';
                    borderColor = 'var(--fail)';
                    letterBg = 'var(--fail)';
                    letterColor = '#fff';
                  }
                }
                
                return (
                  <motion.button
                    key={i}
                    onClick={() => handleSelect(i)}
                    disabled={answered}
                    className="option"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    style={{
                      borderColor,
                      background: bg,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: 16,
                      textAlign: 'left'
                    }}
                  >
                    <span style={{
                      width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 12, fontWeight: 700, background: letterBg, color: letterColor, flexShrink: 0, transition: 'all 0.2s'
                    }}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span style={{ fontSize: 15, fontWeight: 500, color: 'var(--fg)' }}>
                      {opt}
                    </span>
                  </motion.button>
                );
              })}
            </div>

            <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
              <button
                disabled={answered || selectedIndex === null}
                onClick={handleSubmit}
                className="btn btn-primary"
                style={{
                  width: '100%', padding: '16px', fontSize: 15,
                  opacity: (answered || selectedIndex === null) ? 0.5 : 1,
                  boxShadow: (answered || selectedIndex === null) ? 'none' : '0 8px 24px rgba(0, 163, 255, 0.3)'
                }}
              >
                {answered ? (current + 1 === questions.length ? "FINISHING..." : "SUBMITTED") : "SUBMIT TRAJECTORY DECISION"}
              </button>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
