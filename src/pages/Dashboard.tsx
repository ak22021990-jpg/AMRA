import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';

const MODULES = [
  {
    id: 'driving', num: '01', label: 'US Driving Behavior', time: '05 Min',
    desc: '3D spatial reasoning, occlusion awareness, intent prediction across AZ, CA, NY scenarios.',
    path: '/driving',
    img: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'listening', num: '02', label: 'Listening Skills', time: '08 Min',
    desc: 'Audio-based fraud comprehension and strict agent procedure retention analysis.',
    path: '/listening',
    img: 'https://images.unsplash.com/photo-1516280440502-86ec168db6e5?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'cognitive', num: '03', label: 'Cognitive Assessment', time: '05 Min',
    desc: 'Situational judgment and rapid logic verification under stress conditions.',
    path: '/cognitive',
    img: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'pattern', num: '04', label: 'Pattern Recognition', time: '04 Min',
    desc: 'Visual sequence reconstruction under extreme time logic constraints.',
    path: '/pattern',
    img: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
  },
  {
    id: 'grammar', num: '05', label: 'English & Grammar', time: '04 Min',
    desc: 'Standardized tacticle sentence structuring and communication accuracy.',
    path: '/grammar',
    img: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=400',
  },
];

const S: Record<string, React.CSSProperties> = {
  layout: {
    width: '100%', maxWidth: 1440, height: 'calc(100vh - 3px)',
    margin: '3px auto 0',
    display: 'grid', gridTemplateColumns: '380px 1fr',
    background: 'var(--surface)',
    border: '2px solid var(--border)',
    boxShadow: '12px 12px 0 rgba(0,0,0,1)',
  },
  sidebar: {
    borderRight: '2px solid var(--border)',
    display: 'flex', flexDirection: 'column',
    background: '#f9f9f9', overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '40px 32px',
    borderBottom: '2px solid var(--border)',
  },
  h1: {
    fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em',
    lineHeight: 1, textTransform: 'uppercase' as const, marginBottom: 16,
  },
  candidateInfo: { padding: 32, flex: 1 },
  dataRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
    padding: '16px 0', borderBottom: '1px solid var(--border)',
  },
  dataLabel: { fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--muted)', textTransform: 'uppercase' as const },
  dataValue: { fontWeight: 600, fontSize: 14 },
  punchGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 8 },
  punchSlot: {
    aspectRatio: '1', border: '2px solid var(--border)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700,
    color: 'var(--muted)', background: 'var(--surface)',
  },
  punchSlotDone: { background: 'var(--fg)', color: 'var(--surface)' },
  ledgerContainer: { overflowY: 'auto' as const, background: 'var(--surface)', display: 'flex', flexDirection: 'column' },
  ledgerHeader: {
    padding: '24px 32px', borderBottom: '2px solid var(--border)',
    display: 'grid', gridTemplateColumns: '80px 1fr 140px', gap: 24,
    fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase' as const,
    color: 'var(--muted)', position: 'sticky' as const, top: 0,
    background: 'var(--surface)', zIndex: 10,
  },
  moduleRow: {
    display: 'grid', gridTemplateColumns: '120px 1fr',
    borderBottom: '2px solid var(--border)', cursor: 'pointer', position: 'relative' as const,
  },
  moduleContent: {
    padding: '24px 32px',
    display: 'grid', gridTemplateColumns: '1fr 140px', gap: 24, alignItems: 'center',
  },
  moduleTitle: { fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 8 },
  moduleDesc: { fontSize: 14, color: 'var(--muted)', maxWidth: 500, lineHeight: 1.5 },
  btnAction: {
    fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700,
    textTransform: 'uppercase' as const, background: 'var(--surface)',
    border: '2px solid var(--border)', padding: '12px 16px',
    cursor: 'pointer', boxShadow: '4px 4px 0 rgba(0,0,0,1)',
    transition: 'all 0.1s', textAlign: 'center' as const, width: '100%',
  },
};

// ── Splash screen (before registration) ──────────────────────────────────────
function Splash({ onBegin }: { onBegin: () => void }) {
  return (
    <div style={{ width: '100%', maxWidth: 1440, margin: '3px auto 0', height: 'calc(100vh - 3px)', display: 'grid', gridTemplateColumns: '380px 1fr', background: 'var(--surface)', border: '2px solid var(--border)', boxShadow: '12px 12px 0 rgba(0,0,0,1)' }}>
      {/* Sidebar */}
      <aside style={{ borderRight: '2px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
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
          <div style={S.dataRow}><span style={S.dataLabel}>Status</span><span style={S.dataValue}>Pending Auth</span></div>
        </div>
      </aside>
      {/* Main */}
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64, gap: 40 }}>
        <div style={{ textAlign: 'center', maxWidth: 560 }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', letterSpacing: '0.1em', display: 'block', marginBottom: 16 }}>Autonomous Mobility Readiness</span>
          <h2 style={{ fontSize: 48, fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1, marginBottom: 16 }}>Hiring<br />Assessment</h2>
          <p style={{ color: 'var(--muted)', fontSize: 16, lineHeight: 1.6 }}>
            5 modules. ~26 minutes. Your results shape the hiring decision.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, width: '100%', maxWidth: 560 }}>
          {MODULES.map((mod, i) => (
            <div key={mod.id} style={{ padding: '14px 16px', background: '#f9f9f9', border: '2px solid var(--border)', gridColumn: i === 4 ? '1 / -1' : 'auto' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 4 }}>{mod.num}</div>
              <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>{mod.label}</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--accent)' }}>{mod.time}</div>
            </div>
          ))}
        </div>
        <button className="btn btn-primary" style={{ fontSize: 14, padding: '14px 32px' }} onClick={onBegin}>
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

  const submit = () => {
    if (!name.trim()) { setErr('Please enter your name.'); return; }
    if (!email.trim() || !email.includes('@')) { setErr('Please enter a valid email.'); return; }
    onRegister(name.trim(), email.trim());
  };

  return (
    <div style={{ width: '100%', maxWidth: 1440, margin: '3px auto 0', height: 'calc(100vh - 3px)', display: 'grid', gridTemplateColumns: '380px 1fr', background: 'var(--surface)', border: '2px solid var(--border)', boxShadow: '12px 12px 0 rgba(0,0,0,1)' }}>
      <aside style={{ borderRight: '2px solid var(--border)', display: 'flex', flexDirection: 'column', background: '#f9f9f9' }}>
        <div style={S.sidebarHeader}>
          <span className="kicker">System // Auth</span>
          <h1 style={S.h1}>AMRA<br />INTEL</h1>
        </div>
        <div style={S.candidateInfo}>
          <div style={S.dataRow}><span style={S.dataLabel}>Zones</span><span style={S.dataValue}>5 Total</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Duration</span><span style={S.dataValue}>~26 Min</span></div>
          <div style={S.dataRow}><span style={S.dataLabel}>Status</span><span style={S.dataValue}>Pending Auth</span></div>
        </div>
      </aside>
      <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 64 }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <span className="kicker">Candidate Registration</span>
          <h2 style={{ fontSize: 36, fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1, marginBottom: 8, marginTop: 8 }}>Before you start</h2>
          <p style={{ color: 'var(--muted)', marginBottom: 32, fontSize: 15 }}>
            Enter your details. Your score and classification will appear in the final report.
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Candidate name" onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
            <div>
              <label style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 11, textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="name@example.com" onKeyDown={e => e.key === 'Enter' && submit()} />
            </div>
          </div>
          {err && <p style={{ color: 'var(--fail)', fontFamily: 'var(--font-mono)', fontSize: 13, marginBottom: 16 }}>{err}</p>}
          <button className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: 14 }} onClick={submit}>
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
    <div style={S.layout}>
      {/* ── Left Sidebar ── */}
      <aside style={S.sidebar}>
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
        <div style={S.ledgerHeader}>
          <div>Ref</div>
          <div>Assessment Details</div>
          <div style={{ textAlign: 'right' }}>Action</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
          {MODULES.map(mod => {
            const done = results[mod.id]?.completed;
            const pct = done ? Math.round((results[mod.id].score / results[mod.id].total) * 100) : null;
            const isHovered = hovered === mod.id;

            return (
              <div
                key={mod.id}
                style={S.moduleRow}
                onClick={() => navigate(mod.path)}
                onMouseEnter={() => setHovered(mod.id)}
                onMouseLeave={() => setHovered(null)}
              >
                {/* Grayscale photo thumbnail */}
                <div style={{
                  borderRight: '2px solid var(--border)',
                  backgroundImage: `url(${mod.img})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: isHovered ? 'grayscale(0%) contrast(100%)' : 'grayscale(100%) contrast(120%)',
                  transition: 'filter 0.3s',
                  minHeight: 120,
                }} />

                {/* Content */}
                <div style={{
                  ...S.moduleContent,
                  background: isHovered ? '#fafafa' : 'var(--surface)',
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
                          background: isHovered ? 'var(--accent)' : 'var(--surface)',
                          color: isHovered ? '#fff' : 'var(--fg)',
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
