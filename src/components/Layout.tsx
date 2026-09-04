import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { useAssessmentStore } from '../store/assessmentStore';
import { AchievementToast } from './AchievementToast';
import { SpeakerHigh, SpeakerSlash, Lightning, Fire, MapTrifold } from '@phosphor-icons/react';

const ZONE_PATHS = ['/driving', '/listening', '/cognitive', '/pattern', '/grammar'];

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { results, candidateName, xp, currentStreak, audioEnabled, toggleAudio, allModulesComplete } = useAssessmentStore();
  const completedCount = Object.values(results).filter(r => r.completed).length;
  const isZone = ZONE_PATHS.includes(location.pathname);
  const showHeader = candidateName && !isZone;

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      
      <div className="progress-rail" style={{ position: 'fixed', top: showHeader ? 64 : 0, left: 0, right: 0, height: 4, zIndex: 200, background: 'var(--surface-2)' }}>
        <div className="progress-rail-fill" style={{ height: '100%', background: 'linear-gradient(90deg, var(--accent), var(--secondary))', transition: 'width 0.7s cubic-bezier(0.4, 0, 0.2, 1)', width: `${(completedCount / 5) * 100}%` }} />
      </div>

      {showHeader && (
        <header style={{
          position: 'fixed', top: 0, left: 0, width: '100%', zIndex: 100, height: 64,
          background: 'rgba(255, 255, 255, 0.85)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(0,0,0,0.06)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '0 24px',
        }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 12, background: 'var(--midnight)', color: 'var(--secondary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden'
            }}>
              <MapTrifold weight="duotone" size={24} style={{ position: 'relative', zIndex: 2 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: 'var(--midnight)', letterSpacing: '-0.02em' }}>DriveReady</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, fontWeight: 600, background: 'var(--surface-2)', padding: '2px 6px', borderRadius: 4, color: 'var(--muted)' }}>AV-OS</span>
              </div>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--muted)', fontWeight: 600, letterSpacing: '0.05em' }}>AUTONOMOUS MOBILITY</span>
            </div>
          </div>

          {/* Center Nav */}
          <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }} className="hidden-mobile">
            <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: location.pathname === '/' ? 'var(--midnight)' : 'var(--muted)', textDecoration: 'none', borderBottom: location.pathname === '/' ? '2px solid var(--secondary)' : '2px solid transparent', paddingBottom: 4 }}>
              Trajectory Hub
            </Link>
            <Link to="/results" style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 14, color: location.pathname === '/results' ? 'var(--midnight)' : 'var(--muted)', textDecoration: 'none', borderBottom: location.pathname === '/results' ? '2px solid var(--secondary)' : '2px solid transparent', paddingBottom: 4, opacity: allModulesComplete() ? 1 : 0.5, pointerEvents: allModulesComplete() ? 'auto' : 'none' }}>
              Final Report
            </Link>
          </nav>

          {/* Gamification Counters */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {currentStreak > 1 && (
              <div className="anim-pop-in" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--warn-bg)', border: '1px solid var(--warn-border)', borderRadius: 999, color: '#B45309' }}>
                <Fire weight="fill" />
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 12, fontWeight: 700 }}>{currentStreak} Streak</span>
              </div>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 12px', background: 'var(--accent-bg)', border: '1px solid var(--accent-border)', borderRadius: 999, color: 'var(--accent-hover)' }}>
              <Lightning weight="fill" />
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, fontWeight: 700 }}>{xp} XP</span>
            </div>

            <button onClick={toggleAudio} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: '50%', background: 'var(--surface)', border: '1px solid var(--border)', cursor: 'pointer', color: audioEnabled ? 'var(--accent)' : 'var(--muted)', transition: 'all 0.2s' }}>
              {audioEnabled ? <SpeakerHigh weight="bold" /> : <SpeakerSlash weight="bold" />}
            </button>

            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: 16, fontFamily: 'var(--font-display)', marginLeft: 8 }}>
              {candidateName.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>
      )}

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div key={location.pathname} className={!isZone ? "page-transition" : ""} style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {children}
        </div>
      </main>
      
      <AchievementToast />

      <style>{`
        .hidden-mobile { display: flex; }
        @media (max-width: 768px) { .hidden-mobile { display: none !important; } }
      `}</style>
    </div>
  );
}
