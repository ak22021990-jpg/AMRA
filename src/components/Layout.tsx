import React from 'react';
import { useLocation } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { AchievementToast } from './AchievementToast';

const ZONE_PATHS = ['/driving', '/listening', '/cognitive', '/pattern', '/grammar'];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { results } = useAssessmentStore();
  const completedCount = Object.values(results).filter(r => r.completed).length;
  const isZone = ZONE_PATHS.includes(location.pathname);

  if (isZone) {
    // Zone pages: full-screen, no chrome
    return (
      <div style={{ width: '100%', height: '100dvh', background: 'var(--bg)', overflow: 'hidden' }}>
        <div className="progress-rail">
          <div className="progress-rail-fill" style={{ width: `${(completedCount / 5) * 100}%` }} />
        </div>
        {children}
      </div>
    );
  }

  // Dashboard / Results: centered with top progress rail
  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div className="progress-rail">
        <div className="progress-rail-fill" style={{ width: `${(completedCount / 5) * 100}%` }} />
      </div>
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div key={location.pathname} className="page-transition">
          {children}
        </div>
      </main>
      <AchievementToast />
    </div>
  );
}
