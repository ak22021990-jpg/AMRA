import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import ZoneVisual from '../components/ZoneVisual';
import { ShieldCheck, Ear, Brain, Target, Keyboard, AlertTriangle, Zap, CheckCircle2 } from 'lucide-react';
import { useAchievements } from '../hooks/useAchievements';

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
  const color = pass ? 'var(--good)' : 'var(--fail)';
  
  return (
    <div style={{ position: 'relative', width: size, height: size, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size/2} cy={size/2} r={radius} stroke="var(--border)" strokeWidth={strokeW} fill="none" />
        <circle cx={size/2} cy={size/2} r={radius} stroke={color} strokeWidth={strokeW} fill="none" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1.5s ease-out' }} />
      </svg>
      <span style={{ position: 'absolute', fontFamily: 'var(--font-mono)', fontSize: size * 0.28, fontWeight: 700, color: 'var(--fg)', marginTop: 2 }}>
        {pct}
      </span>
    </div>
  );
};

export default function ResultsReport() {
  const navigate = useNavigate();
  const { candidateName, results, allModulesComplete } = useAssessmentStore();
  const { achievements } = useAchievements();
  const unlockedAchievements = useAssessmentStore(s => s.unlockedAchievements);
  const unlocked = achievements.filter(a => unlockedAchievements.includes(a.id));

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

  const allPass = MODULE_ORDER.every((id, i) => Math.round(modulePcts[i]) >= MODULE_META[id].threshold);
  const testId = `TRK-${candidateName.slice(0, 3).toUpperCase()}-001`;
  const rank = allPass ? 'ELITE' : composite >= 60 ? 'TRIAGE' : 'NOVICE';

  return (
    <div className="dashboard-layout" style={{ overflow: "hidden" }}>
      {/* LEFT SIDEBAR (Gamified) */}
      <aside className="dashboard-sidebar" style={{ overflow: "hidden", display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '40px 32px', borderBottom: '1px solid var(--border)' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--accent)', display: 'block', marginBottom: 24, letterSpacing: '0.1em' }}>
            Mission Brief // Complete
          </span>
          <h1 style={{ fontFamily: 'var(--font-body)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, textTransform: 'uppercase', margin: 0, background: 'linear-gradient(180deg, var(--fg), var(--muted))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            OPERATIVE<br />REPORT
          </h1>
        </div>

        <div style={{ padding: '32px', flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
          {[
            { label: 'Operative', value: candidateName },
            { label: 'Clearance ID', value: testId },
            { label: 'Simulation Rank', value: rank },
          ].map(({ label, value }) => (
            <div key={label} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)' }}>{label}</span>
              <span style={{ fontWeight: 500, fontSize: 13, color: 'var(--fg)', textTransform: 'uppercase' }}>{value}</span>
            </div>
          ))}

          <div className="anim-fade-in-up" style={{ margin: '40px 0', textAlign: 'center' }}>
            <div style={{ position: 'relative', display: 'inline-flex', justifyContent: 'center', alignItems: 'center' }}>
               <CircularProgress pct={composite} pass={allPass} size={150} />
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 16, letterSpacing: '0.1em' }}>
              Weighted XP Rating
            </div>
            
            <div className="anim-scale-in" style={{ 
              fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase',
              padding: '12px 18px', border: '1px solid', borderColor: allPass ? 'var(--good-border)' : 'var(--bad-border)',
              borderRadius: 6, backgroundColor: allPass ? 'var(--good-bg)' : 'var(--bad-bg)',
              boxShadow: allPass ? '0 0 15px rgba(16, 185, 129, 0.2)' : '0 0 15px rgba(239, 68, 68, 0.2)',
              marginTop: 24, display: 'inline-flex', alignItems: 'center', gap: 8, color: allPass ? 'var(--good)' : 'var(--bad)'
            }}>
              {allPass ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              {allPass ? 'DEPLOYMENT APPROVED' : 'MORE TRAINING REQUIRED'}
            </div>
          </div>

          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button onClick={() => window.print()} style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', background: 'var(--accent)', color: '#000', border: '1px solid var(--accent)', borderRadius: 6, padding: '16px 24px', width: '100%', boxShadow: '0 0 20px rgba(56, 189, 248, 0.3)', cursor: 'pointer', transition: 'transform 0.2s' }}>
              Export Matrix Dossier
            </button>
            <button onClick={() => navigate('/')} style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, textTransform: 'uppercase', background: 'transparent', color: 'var(--fg)', border: '1px solid var(--border)', borderRadius: 6, padding: '14px 24px', width: '100%', cursor: 'pointer', transition: 'background 0.2s' }}>
              Return to Base
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT BENTO LEDGER */}
      <main style={{ overflowY: 'auto', background: 'var(--bg)', padding: '32px' }}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', paddingBottom: 16 }}>
           <div>
             <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 700, margin: 0, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>Performance Breakdown</h2>
             <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: 14 }}>Weighted sector analysis and skill acquisition matrix.</p>
           </div>
           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em', textAlign: 'right' }}>
             // telemetry.active<br/>[SYS_OK]
           </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 24 }}>
          {MODULE_ORDER.map((id) => {
            const meta = MODULE_META[id];
            const r = results[id];
            const pct = r && r.total > 0 ? Math.round((r.score / r.total) * 100) : 0;
            const pass = pct >= meta.threshold;
            
            const tags = r?.skillTags?.length ? r.skillTags : ['Accuracy', 'Focus', 'Logic'];

            return (
              <div key={id} className="anim-fade-in-up stagger-1" style={{
                background: 'var(--surface)', border: `1px solid ${pass ? 'var(--border)' : 'var(--bad-border)'}`, borderRadius: 12,
                overflow: 'hidden', display: 'flex', flexDirection: 'column', position: 'relative'
              }}>
                {/* Zone Visual Header */}
                <div style={{ height: 80, borderBottom: '1px solid var(--border)', position: 'relative', background: '#080c16' }}>
                   <div style={{ position: 'absolute', inset: 0, opacity: 0.6 }}>
                     <ZoneVisual variant={id} active={pass} />
                   </div>
                   <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 0%, var(--surface) 100%)' }} />
                   <div style={{ position: 'absolute', bottom: 16, left: 24, right: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', zIndex: 10 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ color: pass ? 'var(--accent)' : 'var(--warn)', padding: 6, background: 'rgba(0,0,0,0.5)', borderRadius: 6, border: '1px solid var(--border)' }}>
                           {ICONS[id]}
                        </div>
                        <div>
                           <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: pass ? 'var(--accent)' : 'var(--warn)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                             Weight: {meta.weight * 100}%
                           </div>
                           <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--fg)', marginTop: 2 }}>
                             {meta.label}
                           </div>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Body */}
                <div style={{ padding: '24px', flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {/* Score & Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                     <CircularProgress pct={pct} pass={pass} size={56} />
                     <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                           <span>Req: {meta.threshold}%</span>
                           <span>{r ? r.score : 0} / {r ? r.total : 0} pts</span>
                        </div>
                        <div style={{ width: '100%', height: 4, background: 'var(--border)', borderRadius: 2, position: 'relative' }}>
                           <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: `${pct}%`, background: pass ? 'var(--good)' : 'var(--bad)', borderRadius: 2, boxShadow: pass ? '0 0 8px rgba(16,185,129,0.5)' : 'none' }} />
                           <div style={{ position: 'absolute', left: `${meta.threshold}%`, top: -4, bottom: -4, width: 2, background: 'var(--fg)', zIndex: 2 }} />
                        </div>
                     </div>
                  </div>

                  {/* Badges / Tags */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                    {tags.map((tag, i) => (
                      <span key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 10, padding: '4px 8px', borderRadius: 4, border: '1px solid var(--border)', color: 'var(--muted)', background: 'var(--bg)', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={10} style={{ color: 'var(--accent)' }}/>
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Judgement / Tip */}
                  <div style={{ marginTop: 'auto', padding: '12px 16px', borderRadius: 4, background: 'var(--bg)', borderLeft: `2px solid ${pass ? 'var(--good)' : 'var(--fail)'}` }}>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                      {pass ? 'Strength Detected' : 'Coaching Required'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--fg)', lineHeight: 1.4 }}>
                      {pass ? 'Excellent operational read. Metric bounds satisfied.' : meta.tip}
                    </div>
                  </div>

                </div>
              </div>
            );
          })}
        </div>

        {unlocked.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h3 className="anim-fade-in-up" style={{ fontFamily: 'var(--font-body)', fontSize: 20, fontWeight: 700, marginBottom: 16, textTransform: 'uppercase', letterSpacing: '-0.01em' }}>
              Achievements Unlocked
            </h3>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              {unlocked.map((ach, i) => (
                <div key={ach.id} className={`anim-stamp stagger-${i + 1}`} style={{
                  padding: '16px 20px', background: 'var(--surface)', border: '1px solid var(--gold-border)',
                  borderRadius: 12, display: 'flex', alignItems: 'center', gap: 12,
                  boxShadow: '0 0 16px var(--gold-bg)',
                }}>
                  <span style={{ fontSize: 28 }}>{ach.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gold)' }}>{ach.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)' }}>{ach.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
