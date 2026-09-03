import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import ZoneVisual from '../components/ZoneVisual';
import { useSound } from '../hooks/useSound';

const MODULES = [
  {
    id: 'driving', num: '01', label: 'US Driving Behavior', time: '05 Min',
    desc: '3D spatial reasoning, occlusion awareness, intent prediction across AZ, CA, NY scenarios.',
    path: '/driving',
  },
  {
    id: 'listening', num: '02', label: 'Listening Skills', time: '08 Min',
    desc: 'Audio-based fraud comprehension and strict agent procedure retention analysis.',
    path: '/listening',
  },
  {
    id: 'cognitive', num: '03', label: 'Cognitive Assessment', time: '05 Min',
    desc: 'Situational judgment and rapid logic verification under stress conditions.',
    path: '/cognitive',
  },
  {
    id: 'pattern', num: '04', label: 'Pattern Recognition', time: '04 Min',
    desc: 'Visual sequence reconstruction under extreme time logic constraints.',
    path: '/pattern',
  },
  {
    id: 'grammar', num: '05', label: 'English & Grammar', time: '04 Min',
    desc: 'Standardized tacticle sentence structuring and communication accuracy.',
    path: '/grammar',
  },
] as const;

const S: Record<string, React.CSSProperties> = {
  layout: {},

  sidebar: {
    // moved to .dashboard-sidebar
  },
  sidebarHeader: {
    padding: '40px 32px',
    borderBottom: '1px solid var(--border)',
  },
  h1: {
    fontFamily: 'var(--font-body)',
    fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em',
    lineHeight: 1, textTransform: 'uppercase' as const, marginBottom: 16,
    background: 'linear-gradient(180deg, var(--fg), var(--muted))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  candidateInfo: { padding: 32, flex: 1 },
  dataRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '16px 0', borderBottom: '1px solid rgba(255,255,255,0.05)',
  },
  dataLabel: { fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase' as const },
  dataValue: { fontWeight: 500, fontSize: 14, color: 'var(--fg)' },
  punchGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
  punchSlot: {
    aspectRatio: '1', border: '1px solid var(--border)', borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
    color: 'var(--muted)', background: 'var(--surface)', transition: 'all 0.3s'
  },
  punchSlotDone: { background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent)', borderColor: 'var(--accent)', boxShadow: '0 0 12px rgba(56, 189, 248, 0.3)' },
  ledgerContainer: { overflowY: 'auto' as const, background: 'var(--bg)', display: 'flex', flexDirection: 'column' },
  ledgerHeader: {
    padding: '24px 32px', borderBottom: '1px solid var(--border)',
    display: 'grid', gridTemplateColumns: '80px 1fr 140px', gap: 24,
    fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase' as const,
    color: 'var(--muted)', position: 'sticky' as const, top: 0,
    background: 'rgba(3, 7, 18, 0.8)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', zIndex: 10,
  },
  moduleRow: {
    display: 'grid', gridTemplateColumns: '120px 1fr',
    borderBottom: '1px solid var(--border)', cursor: 'pointer', position: 'relative' as const,
  },
  moduleContent: {
    padding: '32px 32px',
    display: 'grid', gridTemplateColumns: '1fr 140px', gap: 24, alignItems: 'center',
  },
  moduleTitle: { fontFamily: 'var(--font-body)', fontSize: 24, fontWeight: 500, letterSpacing: '-0.01em', marginBottom: 8, color: 'var(--fg)' },
  moduleDesc: { fontSize: 14, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.5 },
  btnAction: {
    fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700, borderRadius: 6,
    textTransform: 'uppercase' as const, background: 'var(--surface)',
    border: '1px solid var(--border)', padding: '12px 16px',
    cursor: 'pointer', transition: 'all 0.2s', textAlign: 'center' as const, width: '100%',
  },
};

// ── Splash screen (before registration) ──────────────────────────────────────
function Splash({ onBegin }: { onBegin: () => void }) {
  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="dashboard-sidebar">
        <div style={S.sidebarHeader}>
          <span className="kicker">System // Auth</span>
          <h1 style={S.h1}>AMRA<br />INTEL</h1>
          <p style={{ fontSize: 14, color: 'var(--muted)', lineHeight: 1.6 }}>
            Autonomous Mobility Readiness Assessment — 5 modules, ~26 minutes.
          </p>
        </div>
        <div style={S.candidateInfo}>
          <div style={S.dataRow}><span style={S.dataLabel}>Zones</span><span style={S.dataValue}>5 Total</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Duration</span><span style={S.dataValue}>~26 Min</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Status</span><span style={{...S.dataValue, color: 'var(--warn)'}}>Pending Auth</span></div>
        </div>
      </aside>
      {/* Main — text-only hero */}
      <main className="anim-gradient-bg" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', gap: 32, background: 'var(--surface)' }}>
        <div className="anim-fade-in-up" style={{ textAlign: 'center', maxWidth: 560 }}>
          <span className="kicker anim-fade-in-down stagger-1" style={{ marginBottom: 16, display: 'block' }}>
            Autonomous Mobility Readiness
          </span>
          <h2 style={{ fontFamily: 'var(--font-body)', fontSize: 48, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 16 }}>
            Hiring<br />Assessment
          </h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6, fontWeight: 500 }}>
            5 modules. ~26 minutes. Your results shape the hiring decision.
          </p>
        </div>
        <div className="anim-fade-in-up stagger-2" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center' }}>
          {['Driving', 'Listening', 'Cognitive', 'Pattern', 'Grammar'].map((name, i) => (
            <span key={name} className={`anim-scale-in stagger-${i + 1}`} style={{
              padding: '8px 16px', borderRadius: 999, border: '1px solid var(--border)',
              fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)',
              background: 'var(--bg)',
            }}>
              {name}
            </span>
          ))}
        </div>
        <button className="btn btn-primary anim-fade-in-up stagger-3" style={{ fontSize: 14, padding: '16px 36px', boxShadow: '0 0 15px var(--accent-glow)' }} onClick={onBegin}>
          Begin Assessment
        </button>
      </main>
    </div>
  );
}

// ── Registration form ─────────────────────────────────────────────────────────
function Register({ onRegister }: { onRegister: (name: string, email: string) => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [err, setErr] = useState('');
  const { play } = useSound();

  const submit = () => {
    if (!name.trim()) { setErr('Please enter your name.'); play('wrong'); return; }
    if (!email.trim() || !email.includes('@')) { setErr('Please enter a valid email.'); play('wrong'); return; }
    play('click');
    onRegister(name.trim(), email.trim());
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div style={S.sidebarHeader}>
          <span className="kicker">System // Auth</span>
          <h1 style={S.h1}>AMRA<br />INTEL</h1>
        </div>
        <div style={S.candidateInfo}>
          <div style={S.dataRow}><span style={S.dataLabel}>Zones</span><span style={S.dataValue}>5 Total</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Duration</span><span style={S.dataValue}>~26 Min</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Status</span><span style={{...S.dataValue, color: 'var(--warn)'}}>Pending Auth</span></div>
        </div>
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', background: 'var(--surface)' }}>
        <div className="anim-fade-in-up" style={{ width: '100%', maxWidth: 480 }}>
          <span className="kicker anim-fade-in-down stagger-1">Candidate Registration</span>
          <h2 className="anim-fade-in-up stagger-2" style={{ fontFamily: 'var(--font-body)', fontSize: 36, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1, marginBottom: 12, marginTop: 8 }}>Before you start</h2>
          <p className="anim-fade-in-up stagger-3" style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 16 }}>
            Enter your details. Your score and classification will appear in the final report.
          </p>
          <div className="anim-fade-in-up stagger-4" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Candidate name" onKeyDown={e => e.key === 'Enter' && submit()} style={{ background: 'var(--bg)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" onKeyDown={e => e.key === 'Enter' && submit()} style={{ background: 'var(--bg)' }} />
            </div>
          </div>
          {err && <p className="anim-shake" style={{ color: 'var(--fail)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 16 }}>{err}</p>}
          <button className="btn btn-primary anim-fade-in-up stagger-5" style={{ width: '100%', padding: '16px', fontSize: 14, boxShadow: '0 0 15px var(--accent-glow)' }} onClick={submit}>
            Begin Assessment →
          </button>
        </div>
      </main>
    </div>
  );
}

// ── Main Dashboard (sidebar + ledger) ────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const { candidateName, candidateEmail, setCandidate, results, allModulesComplete } = useAssessmentStore();
  const [showSplash, setShowSplash] = useState(true);
  const [hovered, setHovered] = useState<string | null>(null);

  const completedCount = Object.values(results).filter(r => r.completed).length;
  const allDone = allModulesComplete();

  // Pre-registration flows
  if (!candidateName) {
    if (showSplash) return <Splash onBegin={() => setShowSplash(false)} />;
    return <Register onRegister={(name, email) => setCandidate(name, email)} />;
  }

  return (
    <div className="dashboard-layout">
      {/* ── Left Sidebar ── */}
      <aside className="dashboard-sidebar anim-fade-in-up">
        <div style={S.sidebarHeader}>
          <span className="kicker">System // Active</span>
          <h1 style={S.h1}>AMRA<br />INTEL</h1>
        </div>
        <div style={S.candidateInfo}>
          <div style={S.dataRow}>
            <span style={S.dataLabel}>Candidate</span>
            <span style={{ ...S.dataValue, maxWidth: 180, textAlign: 'right', wordBreak: 'break-word' }}>{candidateName}</span>
          </div>
          <div style={S.dataRow}>
            <span style={S.dataLabel}>Email</span>
            <span style={{ ...S.dataValue, fontFamily: 'var(--font-mono)', fontSize: 11, maxWidth: 180, textAlign: 'right', wordBreak: 'break-all' }}>{candidateEmail}</span>
          </div>
          <div style={S.dataRow}>
            <span style={S.dataLabel}>Status</span>
            <span style={S.dataValue}>{allDone ? 'Complete' : 'In Progress'}</span>
          </div>

          {/* Punch card */}
          <div style={{ marginTop: 40 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase', fontWeight: 600, marginBottom: 12 }}>
              Zone Clearance ({completedCount}/5)
            </div>
            <div style={S.punchGrid}>
              {MODULES.map(mod => {
                const done = results[mod.id]?.completed;
                return (
                  <div key={mod.id} style={{ ...S.punchSlot, ...(done ? S.punchSlotDone : {}) }}>
                    {mod.num}
                  </div>
                );
              })}
            </div>
          </div>

          {/* View report CTA when all done */}
          {allDone && (
            <button
              className="btn btn-accent"
              style={{ width: '100%', marginTop: 32, padding: '14px 16px' }}
              onClick={() => navigate('/results')}
            >
              View Final Report →
            </button>
          )}
        </div>
      </aside>

      {/* ── Right Ledger ── */}
      <main style={S.ledgerContainer}>
        {/* Sticky header */}
        <div className="anim-fade-in-up stagger-1" style={S.ledgerHeader}>
          <div>Ref</div>
          <div>Assessment Details</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {MODULES.map((mod, i) => {
            const done = results[mod.id]?.completed;
            const pct = done ? Math.round((results[mod.id].score / results[mod.id].total) * 100) : null;
            const isHovered = hovered === mod.id;

            return (
              <div
                key={mod.id}
                className={`anim-fade-in-left stagger-${i + 1}`}
                style={{ ...S.moduleRow, transition: 'all 0.3s ease' }}
                onClick={() => navigate(mod.path)}
                onMouseEnter={() => setHovered(mod.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Zone visual */}
                <div style={{ borderRight: '1px solid var(--border)', minHeight: 120 }}>
                  <ZoneVisual variant={mod.id} active={isHovered} />
                </div>

                {/* Content */}
                <div style={{
                  ...S.moduleContent,
                  background: isHovered ? 'var(--surface-subtle)' : 'transparent',
                  transition: 'background 0.2s',
                }}>
                  <div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 8, letterSpacing: '0.05em', fontWeight: 600 }}>
                      TIME LIMIT: {mod.time}
                    </div>
                    <div style={S.moduleTitle}>{mod.label}</div>
                    <p style={S.moduleDesc}>{mod.desc}</p>
                    {done && pct !== null && (
                      <div style={{ marginTop: 10, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--pass)', fontWeight: 700 }}>
                        ✓ COMPLETED — {pct}%
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {done ? (
                      <div style={{
                        fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700,
                        padding: '10px 14px', border: '1px solid var(--pass)',
                        background: 'var(--pass-bg)', color: 'var(--pass)', textTransform: 'uppercase',
                      }}>
                        DONE
                      </div>
                    ) : (
                      <button
                        style={{
                          ...S.btnAction,
                          background: isHovered ? 'var(--accent-bg)' : 'var(--surface)',
                          color: isHovered ? 'var(--fg)' : 'var(--fg)',
                          borderColor: isHovered ? 'var(--accent)' : 'var(--border)',
                        }}
                        onClick={e => { e.stopPropagation(); navigate(mod.path); }}
                      >
                        Execute
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
