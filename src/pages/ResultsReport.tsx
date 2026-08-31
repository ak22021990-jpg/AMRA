import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';

const MODULE_ORDER = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'];

const MODULE_META: Record<string, { label: string; threshold: number; image: string }> = {
  driving: {
    label: 'US Driving Behavior',
    threshold: 80,
    image: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?auto=format&fit=crop&q=80&w=400',
  },
  listening: {
    label: 'Listening Skills',
    threshold: 75,
    image: 'https://images.unsplash.com/photo-1516280440502-86ec168db6e5?auto=format&fit=crop&q=80&w=400',
  },
  cognitive: {
    label: 'Cognitive Assessment',
    threshold: 85,
    image: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=400',
  },
  pattern: {
    label: 'Pattern Recognition',
    threshold: 90,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=400',
  },
  grammar: {
    label: 'English / Grammar',
    threshold: 75,
    image: 'https://images.unsplash.com/photo-1455390582262-044cdead27d8?auto=format&fit=crop&q=80&w=400',
  },
};

export default function ResultsReport() {
  const navigate = useNavigate();
  const { candidateName, results, allModulesComplete } = useAssessmentStore();

  if (!candidateName || !allModulesComplete()) {
    return <Navigate to="/" replace />;
  }

  // Compute per-module scores
  const modulePcts = MODULE_ORDER.map((id) => {
    const r = results[id];
    return r ? Math.round((r.score / r.total) * 100) : 0;
  });

  // Composite = simple average of all module percentages
  const composite = Math.round(modulePcts.reduce((a, b) => a + b, 0) / modulePcts.length);

  // Overall pass = all modules pass their threshold
  const allPass = MODULE_ORDER.every((id, i) => modulePcts[i] >= MODULE_META[id].threshold);

  // Test ID: TRK-{first 3 chars of name uppercased}-001
  const testId = `TRK-${candidateName.slice(0, 3).toUpperCase()}-001`;

  // Total completion time: sum module times if available (store doesn't track time → N/A)
  const totalTime = 'N/A';

  return (
    <div
      style={{
        maxWidth: 1440,
        height: 'calc(100vh - 3px)',
        margin: '3px auto 0',
        display: 'grid',
        gridTemplateColumns: '380px 1fr',
        background: '#fff',
        border: '2px solid #111',
        boxShadow: '12px 12px 0 rgba(0,0,0,1)',
        overflow: 'hidden',
      }}
    >
      {/* LEFT SIDEBAR */}
      <aside
        style={{
          borderRight: '2px solid #111',
          display: 'flex',
          flexDirection: 'column',
          background: '#f9f9f9',
          overflow: 'hidden',
        }}
      >
        {/* Sidebar header */}
        <div style={{ padding: '40px 32px', borderBottom: '2px solid #111' }}>
          <span
            style={{
              fontFamily: 'monospace',
              fontSize: 11,
              textTransform: 'uppercase',
              color: '#666',
              display: 'block',
              marginBottom: 24,
              letterSpacing: '0.08em',
            }}
          >
            Zone Clearance / Finished
          </span>
          <h1
            style={{
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: '-0.04em',
              lineHeight: 1,
              textTransform: 'uppercase',
              margin: 0,
            }}
          >
            FINAL
            <br />
            EVAL
          </h1>
        </div>

        {/* Candidate info */}
        <div
          style={{
            padding: '32px',
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Data rows */}
          {[
            { label: 'Candidate', value: candidateName },
            { label: 'Test ID', value: testId },
            { label: 'Completion Time', value: totalTime },
          ].map(({ label, value }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '16px 0',
                borderBottom: '1px solid #111',
              }}
            >
              <span style={{ fontFamily: 'monospace', fontSize: 11, textTransform: 'uppercase', color: '#666' }}>
                {label}
              </span>
              <span style={{ fontWeight: 700, fontSize: 13 }}>{value}</span>
            </div>
          ))}

          {/* Score hero */}
          <div style={{ margin: '40px 0' }}>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 11,
                textTransform: 'uppercase',
                color: '#666',
                marginBottom: 12,
                letterSpacing: '0.08em',
              }}
            >
              Aggregate Score
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 96,
                fontWeight: 800,
                letterSpacing: '-0.05em',
                lineHeight: 1,
              }}
            >
              {composite}
              <span style={{ fontSize: 48, color: '#666' }}>%</span>
            </div>
            <div
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                padding: '12px 16px',
                border: '2px solid #111',
                boxShadow: '4px 4px 0 rgba(0,0,0,1)',
                marginTop: 24,
                display: 'inline-block',
                background: allPass ? '#e6f6ec' : '#fae8e6',
                color: allPass ? '#008833' : '#d92211',
              }}
            >
              {allPass ? 'CLEARANCE APPROVED' : 'REQUIREMENTS NOT MET'}
            </div>
          </div>

          {/* Buttons */}
          <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button
              onClick={() => window.print()}
              style={{
                fontFamily: 'monospace',
                fontSize: 14,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: '#111',
                color: '#fff',
                border: '2px solid #111',
                padding: '16px 24px',
                width: '100%',
                boxShadow: '6px 6px 0 rgba(0,0,0,1)',
                cursor: 'pointer',
              }}
            >
              Export / Print
            </button>
            <button
              onClick={() => navigate('/')}
              style={{
                fontFamily: 'monospace',
                fontSize: 13,
                fontWeight: 700,
                textTransform: 'uppercase',
                background: 'transparent',
                color: '#111',
                border: '2px solid #111',
                padding: '12px 24px',
                width: '100%',
                cursor: 'pointer',
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </aside>

      {/* RIGHT LEDGER */}
      <main style={{ overflowY: 'auto', background: '#fff', display: 'flex', flexDirection: 'column' }}>
        {/* Ledger header */}
        <div
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            padding: '24px 32px',
            borderBottom: '2px solid #111',
            display: 'grid',
            gridTemplateColumns: '80px 1fr 140px',
            gap: 24,
            fontFamily: 'monospace',
            fontSize: 11,
            textTransform: 'uppercase',
            color: '#666',
            background: '#fff',
            letterSpacing: '0.08em',
          }}
        >
          <span>Ref</span>
          <span>Telemetry Breakdown</span>
          <span style={{ textAlign: 'right' }}>Zone Score</span>
        </div>

        {/* Module rows */}
        {MODULE_ORDER.map((id) => {
          const meta = MODULE_META[id];
          const r = results[id];
          const pct = r ? Math.round((r.score / r.total) * 100) : 0;
          const pass = pct >= meta.threshold;

          return (
            <div
              key={id}
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 1fr',
                borderBottom: '2px solid #111',
              }}
            >
              {/* Photo thumbnail */}
              <div
                style={{
                  backgroundImage: `url(${meta.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  filter: 'grayscale(100%)',
                  opacity: 0.8,
                  borderRight: '2px solid #111',
                  minHeight: 120,
                }}
              />

              {/* Row content */}
              <div
                style={{
                  padding: '24px 32px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 120px',
                  gap: 40,
                  alignItems: 'center',
                }}
              >
                {/* Left info */}
                <div>
                  <div
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      letterSpacing: '-0.02em',
                      marginBottom: 16,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>{meta.label}</span>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 11,
                        padding: '4px 8px',
                        border: `1px solid ${pass ? '#008833' : '#d92211'}`,
                        fontWeight: 600,
                        background: pass ? '#e6f6ec' : '#fae8e6',
                        color: pass ? '#008833' : '#d92211',
                      }}
                    >
                      {pass ? 'PASS' : 'FAIL'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 60px',
                      gap: 16,
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: '100%',
                        height: 16,
                        border: '2px solid #111',
                        background: '#f4f4f0',
                        position: 'relative',
                      }}
                    >
                      {/* Fill */}
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          background: pass ? '#111' : '#d92211',
                          position: 'absolute',
                          left: 0,
                          top: 0,
                        }}
                      />
                      {/* Threshold marker */}
                      <div
                        style={{
                          position: 'absolute',
                          left: `${meta.threshold}%`,
                          top: -4,
                          bottom: -4,
                          width: 2,
                          background: '#666',
                          zIndex: 2,
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontFamily: 'monospace',
                        fontSize: 10,
                        color: '#666',
                        textAlign: 'right',
                      }}
                    >
                      REQ: {meta.threshold}%
                    </span>
                  </div>
                </div>

                {/* Right score */}
                <div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 32,
                      fontWeight: 700,
                      textAlign: 'right',
                    }}
                  >
                    {pct}%
                  </div>
                  <div
                    style={{
                      fontFamily: 'monospace',
                      fontSize: 11,
                      color: '#666',
                      textAlign: 'right',
                      textTransform: 'uppercase',
                      marginTop: 4,
                    }}
                  >
                    Score
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </main>
    </div>
  );
}
