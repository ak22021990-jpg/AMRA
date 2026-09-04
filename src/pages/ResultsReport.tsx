import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { ShieldCheck, Ear, Brain, Target, Keyboard, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';
import { useConfetti } from '../hooks/useConfetti';
import { useSound } from '../hooks/useSound';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { pageTransition, staggerContainer, staggerItem } from '../lib/animations';

const MODULE_ORDER = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'] as const;
type ModuleId = typeof MODULE_ORDER[number];

const ICONS: Record<ModuleId, React.ReactNode> = {
  driving: <ShieldCheck size={18} />,
  listening: <Ear size={18} />,
  cognitive: <Brain size={18} />,
  pattern: <Target size={18} />,
  grammar: <Keyboard size={18} />
};

const MODULE_META: Record<ModuleId, { label: string; threshold: number; weight: number; tip: string }> = {
  driving: { label: 'US Driving Behavior', threshold: 80, weight: 0.35, tip: 'Drill 3D spatial reasoning and intent prediction.' },
  listening: { label: 'Listening Skills', threshold: 75, weight: 0.20, tip: 'Practice procedure adherence and audio retention.' },
  cognitive: { label: 'Cognitive Assessment', threshold: 85, weight: 0.20, tip: 'Train rapid logic sequencing under time pressure.' },
  pattern: { label: 'Pattern Recognition', threshold: 90, weight: 0.15, tip: 'Focus on visual sequence memory and tracking.' },
  grammar: { label: 'English & Grammar', threshold: 75, weight: 0.10, tip: 'Refine syntax, tone precision, and active voice.' },
};

const CircularProgress = ({ pct, pass, size = 64 }: { pct: number, pass: boolean, size?: number }) => {
  const strokeW = Math.max(4, size * 0.08); 
  const radius = (size - strokeW) / 2;
  const circ = radius * 2 * Math.PI;
  const offset = circ - (pct / 100) * circ;
  const color = pass ? 'var(--pass)' : 'var(--fail)';
  
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="var(--border)" strokeWidth={strokeW} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeW} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
      </svg>
      <span style={{ position: 'absolute', fontFamily: 'var(--font-display)', fontSize: size * 0.28, fontWeight: 800, color: 'var(--fg)', marginTop: 2 }}>
        {pct}
      </span>
    </div>
  );
};

export default function ResultsReport() {
  const navigate = useNavigate();
  const { candidateName, results, allModulesComplete, xp } = useAssessmentStore();
  const { achievements } = useAchievements();
  const unlockedAchievements = useAssessmentStore(s => s.unlockedAchievements);
  const unlocked = achievements.filter(a => unlockedAchievements.includes(a.id));
  const fireConfetti = useConfetti();
  const { play } = useSound();

  if (!candidateName || !allModulesComplete()) {
    return <Navigate to="/" replace />;
  }

  const modulePcts = MODULE_ORDER.map((id) => {
    const r = results[id];
    return r && r.total > 0 ? (r.score / r.total) * 100 : 0;
  });

  const compositeRaw = MODULE_ORDER.reduce((acc, id, i) => {
    return acc + (modulePcts[i] * MODULE_META[id].weight);
  }, 0);
  const composite = Math.round(compositeRaw);

  useEffect(() => {
    play('finale');
    if (composite >= 80) {
      fireConfetti();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const allPass = MODULE_ORDER.every((id, i) => Math.round(modulePcts[i]) >= MODULE_META[id].threshold);
  const testId = `TRK-${candidateName.slice(0, 3).toUpperCase()}-001`;
  const rank = allPass ? 'ELITE' : composite >= 60 ? 'TRIAGE' : 'NOVICE';

  return (
    <motion.div className="dashboard-layout" {...pageTransition}>
      {/* LEFT SIDEBAR */}
      <aside className="dashboard-sidebar hidden-mobile" style={{ overflow: "hidden", display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '40px 32px', borderBottom: '1px solid var(--border)' }}>
          <motion.span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 16, letterSpacing: '0.1em' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            Mission Brief // Complete
          </motion.span>
          <motion.h1 style={{ fontFamily: 'var(--font-display)', fontSize: 40, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1, margin: 0, color: 'var(--midnight)' }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            Final<br />Telemetry
          </motion.h1>
        </div>

        <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          <motion.div variants={staggerContainer} initial="initial" animate="animate">
            {[
              { label: 'Operative', value: candidateName },
              { label: 'Clearance ID', value: testId },
              { label: 'Total XP', value: `${xp} XP` },
              { label: 'Sim Rank', value: rank },
            ].map(({ label, value }) => (
              <motion.div key={label} variants={staggerItem} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid var(--border)' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--fg)' }}>{value}</span>
              </motion.div>
            ))}
          </motion.div>

          <motion.div style={{ margin: '40px 0', textAlign: 'center' }} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.5, duration: 0.6, type: 'spring', stiffness: 200 }}>
            <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
               <CircularProgress pct={composite} pass={allPass} size={150} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 16, letterSpacing: '0.1em' }}>
              Overall Composite Rating
            </div>
            
            <motion.div style={{ 
              fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700,
              padding: '12px 24px', border: '1px solid', borderColor: allPass ? 'var(--pass-border)' : 'var(--fail-border)',
              borderRadius: 999, backgroundColor: allPass ? 'var(--pass-bg)' : 'var(--fail-bg)',
              boxShadow: allPass ? '0 8px 24px rgba(16, 185, 129, 0.2)' : '0 8px 24px rgba(239, 68, 68, 0.2)',
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, color: allPass ? 'var(--pass)' : 'var(--fail)'
            }} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.8, type: 'spring', stiffness: 300 }}>
              {allPass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {allPass ? 'DEPLOYMENT APPROVED' : 'MORE TRAINING REQUIRED'}
            </motion.div>
          </motion.div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => window.print()} className="btn btn-primary" style={{ width: '100%' }}>
              Export Full Matrix
            </button>
            <button onClick={() => navigate('/')} className="btn" style={{ width: '100%' }}>
              Return to Hub
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT MAIN CONTENT */}
      <main style={{ overflowY: 'auto', background: 'var(--bg)', padding: '48px' }}>
        <div style={{ marginBottom: 40, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between' }}>
           <div>
             <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: 'var(--midnight)' }}>Performance Breakdown</h2>
             <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 15 }}>Weighted sector analysis and skill acquisition matrix.</p>
           </div>
           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right', padding: '8px 16px', background: 'var(--accent-bg)', borderRadius: 999 }}>
             Telemetry Active
           </div>
        </div>

        <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }} variants={staggerContainer} initial="initial" animate="animate">
          {MODULE_ORDER.map((id) => {
            const meta = MODULE_META[id];
            const r = results[id];
            const pct = r && r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
            const pass = pct >= meta.threshold;
            
            const tags = r?.skillTags?.length ? r.skillTags : ['Accuracy', 'Focus', 'Logic'];

            return (
              <motion.div key={id} variants={staggerItem} whileHover={{ y: -4, transition: { duration: 0.2 } }} className="bento-card" style={{ display: 'flex', flexDirection: 'column', padding: 0, overflow: 'hidden' }}>
                {/* Header Section */}
                <div style={{ padding: '24px', borderBottom: '1px solid var(--border)', background: 'var(--surface-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                     <div style={{ color: pass ? 'var(--pass)' : 'var(--warn)', padding: 10, background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        {ICONS[id]}
                     </div>
                     <div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: pass ? 'var(--pass)' : 'var(--warn)', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 4 }}>
                          Weight: {meta.weight * 100}%
                        </div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 700, color: 'var(--midnight)' }}>
                          {meta.label}
                        </div>
                     </div>
                   </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Score & Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                     <CircularProgress pct={pct} pass={pass} size={64} />
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', fontWeight: 600 }}>
                           <span>Req: {meta.threshold}%</span>
                           <span>{r ? r.score : 0} / {r ? r.total : 0} pts</span>
                        </div>
                        <div className="bar">
                           <div style={{ width: `${pct}%`, background: pass ? 'var(--pass)' : 'var(--fail)', boxShadow: pass ? '0 0 12px rgba(16,185,129,0.4)' : 'none' }} />
                           <div style={{ position: 'absolute', left: `${meta.threshold}%`, top: -4, bottom: -4, width: 2, background: 'var(--midnight)', zIndex: 2, borderRadius: 2 }} />
                        </div>
                     </div>
                  </div>

                  {/* Badges / Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((tag, i) => (
                      <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 10px', borderRadius: 999, border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--surface-subtle)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={10} style={{ color: 'var(--accent)' }}/>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Judgement / Tip */}
                  <div style={{ marginTop: 'auto', padding: '16px', borderRadius: 16, background: pass ? 'var(--pass-bg)' : 'var(--fail-bg)', border: `1px solid ${pass ? 'var(--pass-border)' : 'var(--fail-border)'}` }}>
                    <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, color: pass ? 'var(--pass)' : 'var(--fail)', fontWeight: 800, textTransform: 'uppercase', marginBottom: 6 }}>
                      {pass ? 'Strength Detected' : 'Coaching Required'}
                    </div>
                    <div style={{ fontSize: 14, color: 'var(--midnight)', fontWeight: 500, lineHeight: 1.5 }}>
                      {pass ? 'Excellent operational read. Metric bounds satisfied.' : meta.tip}
                    </div>
                  </div>

                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {unlocked.length > 0 && (
          <motion.div style={{ marginTop: 48 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, marginBottom: 24, color: 'var(--midnight)' }}>
              Achievements Unlocked
            </h3>
            <motion.div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }} variants={staggerContainer} initial="initial" animate="animate">
              {unlocked.map((ach) => (
                <motion.div key={ach.id} variants={staggerItem} whileHover={{ scale: 1.03, transition: { duration: 0.2 } }} className="bento-card" style={{
                  padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 16,
                  border: '1px solid var(--warn-border)', background: '#FFFAF0',
                  boxShadow: '0 12px 24px rgba(245, 158, 11, 0.1)',
                }}>
                  <div style={{ fontSize: 32, background: '#fff', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 16, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    {ach.icon}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 16, color: '#B45309' }}>{ach.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--warn)', fontWeight: 500, marginTop: 4 }}>{ach.description}</div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        )}
      </main>
    </motion.div>
  );
}
