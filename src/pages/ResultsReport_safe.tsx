import { useNavigate, Navigate } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { Car, Headphones, Lightbulb, PuzzlePiece, PencilSimple, Printer, ArrowClockwise } from '@phosphor-icons/react';

const MODULE_META: Record<string, { label: string; icon: React.ReactNode; maxScore: number }> = {
  driving: { label: 'US Driving Behavior', icon: <Car size={18} weight="fill" />, maxScore: 3 },
  listening: { label: 'Listening Skills', icon: <Headphones size={18} weight="fill" />, maxScore: 3 },
  cognitive: { label: 'Cognitive Assessment', icon: <Lightbulb size={18} weight="fill" />, maxScore: 3 },
  pattern: { label: 'Pattern Recognition', icon: <PuzzlePiece size={18} weight="fill" />, maxScore: 6 },
  grammar: { label: 'English / Grammar', icon: <PencilSimple size={18} weight="fill" />, maxScore: 3 },
};

const MODULE_ORDER = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'];

export default function ResultsReport() {
  const navigate = useNavigate();
  const { candidateName, candidateEmail, results, getRoutingRecommendation, getCompositeScore, allModulesComplete, resetModule } = useAssessmentStore();

  if (!candidateName || !allModulesComplete()) {
    return <Navigate to="/" replace />;
  }

  const recommendation = getRoutingRecommendation();
  const today = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  const totalScore = MODULE_ORDER.reduce((sum, id) => sum + (results[id]?.score ?? 0), 0);
  const totalMax = MODULE_ORDER.reduce((sum, id) => sum + (MODULE_META[id]?.maxScore ?? 0), 0);
  const totalPct = Math.round((totalScore / totalMax) * 100);

  const criticalErrors = results['driving']?.criticalErrors ?? 0;
  const compositeScore = getCompositeScore();

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Certificate header */}
      <div className="score-hero grain">
        <div style={{ flex: 1, textAlign: 'left', position: 'relative', zIndex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 16 }}>
            Autonomous Mobility Readiness · Hiring Assessment
          </div>
          <div style={{ fontSize: 36, fontWeight: 850, letterSpacing: '-0.04em' }}>Assessment Report</div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', margin: '16px 0 8px' }}>{candidateName}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{candidateEmail} · {today}</div>
        </div>
      </div>

      {/* Routing recommendation */}
      <div className="score-hero grain" style={{ background: recommendation.color }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)', marginBottom: 6 }}>
            Hiring Recommendation
          </div>
          <div style={{ fontSize: 30, fontWeight: 850, letterSpacing: '-0.04em' }}>{recommendation.label}</div>
          {recommendation.label === 'Triage / MPCI Candidate' && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', lineHeight: 1.5, maxWidth: 480 }}>
              Strong cognitive and driving scores suggest this candidate warrants further review by the Medical Panel / Clinical Interview (MPCI) team before final hiring decision.
            </p>
          )}
          {recommendation.label === 'Standard Operations' && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', margin: '8px 0 0', lineHeight: 1.5, maxWidth: 480 }}>
              Candidate shows standard readiness. Proceed with normal onboarding.
            </p>
          )}
          {recommendation.signals.length > 0 && (
            <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {recommendation.signals.map(s => (
                <span key={s} style={{
                  background: 'rgba(255,255,255,0.2)', borderRadius: 999,
                  padding: '4px 10px', fontSize: 12, fontWeight: 700,
                }}>
                  ✓ {s}
                </span>
              ))}
            </div>
          )}
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Composite Score</div>
          <div style={{ fontSize: 52, fontWeight: 850, letterSpacing: '-0.06em' }}>{compositeScore}%</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{totalScore}/{totalMax} raw total</div>
          {criticalErrors > 0 && (
            <div style={{ marginTop: 6, fontSize: 12, color: '#fda29b', fontWeight: 700 }}>
              [WARN] {criticalErrors} critical safety error{criticalErrors !== 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>

      {/* Per-module breakdown */}
      <div className="card">
        <h3 style={{ margin: '0 0 20px', letterSpacing: '-0.02em' }}>Module Breakdown</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Module</th>
              <th style={{ textAlign: 'center' }}>Score</th>
              <th style={{ textAlign: 'center' }}>%</th>
              <th>Skills</th>
              <th className="noprint"></th>
            </tr>
          </thead>
          <tbody>
            {MODULE_ORDER.map(id => {
              const meta = MODULE_META[id];
              const result = results[id];
              const score = result?.score ?? '—';
              const pct = result ? Math.round((result.score / result.total) * 100) : null;
              const pctColor = pct === null ? 'var(--muted)' : pct >= 80 ? 'var(--good)' : pct >= 50 ? 'var(--warn)' : 'var(--bad)';

              return (
                <tr key={id}>
                  <td>
                    <span style={{ marginRight: 8 }}>{meta.icon}</span>
                    <strong>{meta.label}</strong>
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 750 }}>
                    {result ? `${score}/${meta.maxScore}` : '—'}
                  </td>
                  <td style={{ textAlign: 'center', fontWeight: 850, color: pctColor }}>
                    {pct !== null ? `${pct}%` : '—'}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      {result?.skillTags?.map(tag => (
                        <span key={tag} style={{
                          padding: '3px 9px', borderRadius: 6,
                          background: 'var(--surface-subtle)', color: 'var(--muted)',
                          fontSize: 11, fontWeight: 700, border: '1px solid var(--line)'
                        }}>
                          {tag.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="noprint" style={{ textAlign: 'center' }}>
                    {result && (
                      <button
                        className="btn btn-ghost"
                        onClick={() => { resetModule(id); navigate(`/${id}`); }}
                        style={{ padding: '6px 12px', fontSize: 12 }}
                        title={`Retake ${meta.label}`}
                      >
                        <ArrowClockwise size={13} /> Retake
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
            <tr style={{ background: 'var(--surface-subtle)' }}>
              <td style={{ fontWeight: 800 }}>Total</td>
              <td style={{ textAlign: 'center', fontWeight: 850 }}>{totalScore}/{totalMax}</td>
              <td style={{ textAlign: 'center', fontWeight: 850, fontSize: 16, color: totalPct >= 80 ? 'var(--good)' : totalPct >= 50 ? 'var(--warn)' : 'var(--bad)' }}>
                {totalPct}%
              </td>
              <td></td>
              <td className="noprint"></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }} className="noprint">
        <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to Dashboard</button>
        <button className="btn btn-primary" onClick={() => window.print()}>
          <Printer size={16} weight="fill" /> Print Report
        </button>
      </div>
    </div>
  );
}
