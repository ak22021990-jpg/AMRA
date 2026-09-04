import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../../store/assessmentStore';
import { useSound } from '../../hooks/useSound';
import { motion } from 'framer-motion';

const questions = [
  // --- ARIZONA BLOCK (5) ---
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
    state: 'Arizona', stateCode: 'AZ', skillTag: 'intent_prediction', critical: false,
    videoLabel: 'AZ · Late Braking, Wheels Angled Left',
    videoFile: 'Q2.mp4',
    videoPrompt: 'Late braking with front wheels angled left',
    question: 'The silver sedan ahead brakes late and its front wheels are visibly turned left toward your path. What does this cue most likely predict?',
    options: ['The driver will park on the right','The driver intends to turn left across your path','The driver is experiencing brake fade','The driver will reverse'],
    correctIndex: 1,
    explanation: 'Late braking combined with wheels angled left strongly predicts an imminent left turn across the ego path — prepare to yield and increase spacing.',
  },
  {
    state: 'Arizona', stateCode: 'AZ', skillTag: 'occlusion', critical: true,
    videoLabel: 'AZ · Pickup Blocking Sidewalk — Critical',
    videoFile: 'Q3.mp4',
    videoPrompt: 'Pickup blocking sidewalk view at crosswalk',
    question: 'A large pickup in the adjacent lane completely blocks your view of the sidewalk and the near half of the crosswalk. What is the safest action?',
    options: ['Maintain speed — nothing is visible','Accelerate to clear the zone quickly','Slow, cover the brake and be prepared to stop for an unseen pedestrian','Sound the horn continuously'],
    correctIndex: 2,
    explanation: 'Occlusion is a critical cue — a child or pedestrian could be hidden behind the pickup. Slow and prepare to stop; do not assume clear.',
  },
  {
    state: 'Arizona', stateCode: 'AZ', skillTag: 'risk_recognition', critical: false,
    videoLabel: 'AZ · Erratic Lead Vehicle',
    videoFile: 'Q4.mp4',
    videoPrompt: 'Vehicle varying speed, drifting onto lane markings',
    question: 'The white sedan ahead repeatedly varies speed and drifts onto the lane markings, correcting each time. What risk does this indicate?',
    options: ['The driver is following navigation instructions','The driver may be impaired or distracted — increase following distance immediately','The lane markings are faded and hard to see','The driver is signaling an emergency'],
    correctIndex: 1,
    explanation: 'Repeated speed changes plus weaving onto markings indicates impairment/distraction. Increase gap, avoid overtaking alongside, be ready to respond.',
  },
  {
    state: 'Arizona', stateCode: 'AZ', skillTag: 'complex_decision', critical: true,
    videoLabel: 'AZ · Green Signal, Pedestrian Crossing — Critical',
    videoFile: 'Q5.mp4',
    videoPrompt: 'Green signal, pedestrian still in crosswalk',
    question: 'Your signal turns green while a pedestrian is still crossing the crosswalk ahead. What should you do?',
    options: ['Proceed — you have the green','Honk to make the pedestrian move faster','Wait until the pedestrian has fully cleared the crosswalk before proceeding','Edge forward to pressure the pedestrian'],
    correctIndex: 2,
    explanation: 'Green does not override the duty to yield to pedestrians already in the crosswalk. Remain stopped until fully clear.',
  },
  // --- CALIFORNIA BLOCK (5) ---
  {
    state: 'California', stateCode: 'CA', skillTag: 'state_knowledge', critical: false,
    videoLabel: 'CA · Roundabout Entry',
    videoFile: 'Q6.mp4',
    videoPrompt: 'Roundabout entry',
    question: 'You approach a single-lane roundabout at the yield line with two vehicles already circulating from the left. What is correct?',
    options: ['Enter immediately — you have right-of-way','Stop and wait for a full gap regardless of flow','Yield to circulating traffic and enter when safe','Honk to alert circulating drivers'],
    correctIndex: 2,
    explanation: 'At a roundabout, yield to traffic already circulating. Enter only when the circulating lane is clear — no stop required if gap is safe.',
  },
  {
    state: 'California', stateCode: 'CA', skillTag: 'intent_prediction', critical: false,
    videoLabel: 'CA · Pedestrian Weight-Shift at Curb',
    videoFile: 'Q7.mp4',
    videoPrompt: 'Pedestrian weight-shift at curb, SF corner',
    question: 'A pedestrian at the corner shifts weight forward, leans toward traffic and places a toe over the curb line without stepping out. What is the best prediction?',
    options: ['They are waiting for a bus','They intend to cross — prepare to yield before they enter the roadway','They lost their balance','They are posing for a photo'],
    correctIndex: 1,
    explanation: 'Forward weight-shift and toe over the curb are intent cues for imminent crossing. Cover brake, prepare to stop.',
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
    state: 'California', stateCode: 'CA', skillTag: 'risk_recognition', critical: false,
    videoLabel: 'CA · Dooring Risk',
    videoFile: 'Q9.mp4',
    videoPrompt: 'Door opening beside a bike lane',
    question: 'A parked sedan’s rear door begins to open into the green bike lane while a cyclist approaches from behind. What hazard must you anticipate?',
    options: ['The door will close immediately — ignore it','Dooring risk plus a cyclist swerving left into your lane — give space and be ready to brake','Only the cyclist matters','Only the parked car matters'],
    correctIndex: 1,
    explanation: 'An opening door into a bike lane forces a cyclist to swerve into traffic. Anticipate both hazards together and create lateral space.',
  },
  {
    state: 'California', stateCode: 'CA', skillTag: 'complex_decision', critical: true,
    videoLabel: 'CA · Cyclist Against Signal — Critical',
    videoFile: 'Q10.mp4',
    videoPrompt: 'Cyclist enters against signal while AV has green',
    question: 'Your signal is green and you begin to move when a cyclist crosses against their signal directly across your path. What is required?',
    options: ['Proceed — green means you have priority','Honk and hold speed','Yield to the cyclist despite having green and allow them to clear','Swerve into the opposite lane'],
    correctIndex: 2,
    explanation: 'Right-of-way must be yielded to avoid a collision even when you have green. Cyclist is vulnerable — stop and let them clear.',
  },
  // --- NEW YORK BLOCK (5) ---
  {
    state: 'New York', stateCode: 'NY', skillTag: 'state_knowledge', critical: false,
    videoLabel: 'NY · White Cane',
    videoFile: 'Q11.mp4',
    videoPrompt: 'Pedestrian using a white cane',
    question: 'A pedestrian sweeping a long white cane in the crosswalk ahead is entering the roadway. How should you respond?',
    options: ['Assume they can see you','Exercise heightened caution and yield as required','Honk continuously','Pass quickly before they step out'],
    correctIndex: 1,
    explanation: 'A pedestrian with a white cane is blind or visually impaired. NY requires heightened caution and yielding the right-of-way.',
  },
  {
    state: 'New York', stateCode: 'NY', skillTag: 'intent_prediction', critical: false,
    videoLabel: 'NY · Taxi Slowing at Curb',
    videoFile: 'Q12.mp4',
    videoPrompt: 'Taxi slowing abruptly at the curb',
    question: 'A yellow taxi ahead slows abruptly toward the curb without signals near pedestrians on the sidewalk. What should you predict?',
    options: ['The taxi will accelerate away','An imminent stop and possible door opening / passenger entry — avoid overtaking closely, prepare to stop','The taxi is turning left','The taxi has a mechanical failure'],
    correctIndex: 1,
    explanation: 'Abrupt curb-ward slowing predicts a stop for pickup/drop-off and sudden door opening. Hold position, do not pass closely.',
  },
  {
    state: 'New York', stateCode: 'NY', skillTag: 'occlusion', critical: false,
    videoLabel: 'NY · Knees-Down Pedestrian',
    videoFile: 'Q13.mp4',
    videoPrompt: 'Pedestrian visible only knees-down between parked cars',
    question: 'Between two tightly parked cars you can see only a pair of legs at knee height facing the road. What does this imply?',
    options: ['A child playing who will remain still','An adult hidden by parked cars about to emerge — expect a pedestrian to step out','A mannequin display','Nothing — legs cannot indicate intent'],
    correctIndex: 1,
    explanation: 'Knees-down visibility is a classic occlusion cue that a pedestrian’s upper body is hidden and emergence is imminent. Slow and prepare to stop.',
  },
  {
    state: 'New York', stateCode: 'NY', skillTag: 'risk_recognition', critical: false,
    videoLabel: 'NY · Bus Pulling to Curb',
    videoFile: 'Q14.mp4',
    videoPrompt: 'Cyclist to the right of a bus pulling to the curb',
    question: 'A city bus angles toward the curb to stop while a cyclist rides in the narrowing gap between the bus and curb. What is the safest decision?',
    options: ['Squeeze through alongside — the gap will hold','Accelerate past both','Hold back — the closing gap will trap the cyclist, do not enter the pinch','Honk at the cyclist'],
    correctIndex: 2,
    explanation: 'Bus-to-curb creates a closing pinch with the cyclist at risk of being squeezed. Hold position behind; never occupy the narrowing gap.',
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
].slice(0, 15);

export default function DrivingModule() {
  const navigate = useNavigate();
  const { candidateName, recordResult, recordAnswer } = useAssessmentStore();
  const { play } = useSound();

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(180);
  
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
