// src/components/AchievementToast.tsx
import { useEffect, useState, useCallback } from 'react';
import { useAchievements } from '../hooks/useAchievements';
import type { Achievement } from '../hooks/useAchievements';
import { useSound } from '../hooks/useSound';
import { useConfetti } from '../hooks/useConfetti';
import { useAssessmentStore } from '../store/assessmentStore';

export function AchievementToast() {
  const { checkAchievements, newAchievement } = useAchievements();
  const { play } = useSound();
  const fireConfetti = useConfetti();
  const [visible, setVisible] = useState(false);
  const [current, setCurrent] = useState<Achievement | null>(null);

  const dismiss = useCallback(() => {
    setVisible(false);
    setTimeout(() => setCurrent(null), 300);
  }, []);

  useEffect(() => {
    const unsub = useAssessmentStore.subscribe(() => {
      checkAchievements();
      if (newAchievement.current) {
        setCurrent(newAchievement.current);
        setVisible(true);
        play('achievement');
        if (['streak-3', 'streak-5'].includes(newAchievement.current.id)) {
          fireConfetti();
        }
        newAchievement.current = null;
        setTimeout(dismiss, 4000);
      }
    });
    return unsub;
  }, [checkAchievements, play, fireConfetti, dismiss, newAchievement]);

  if (!current) return null;

  return (
    <div
      className="achievement-toast"
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        background: 'var(--surface)',
        border: '2px solid var(--gold-border)',
        borderRadius: '12px',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.4), 0 0 16px var(--gold-bg)',
        transform: visible ? 'translateX(0)' : 'translateX(120%)',
        opacity: visible ? 1 : 0,
        transition: 'transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
        cursor: 'pointer',
        maxWidth: '360px',
      }}
      onClick={dismiss}
      role="alert"
      aria-live="polite"
    >
      <span style={{ fontSize: '32px', lineHeight: 1 }} className={visible ? 'anim-stamp' : ''}>
        {current.icon}
      </span>
      <div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '14px',
          color: 'var(--gold)',
          letterSpacing: '0.05em',
          textTransform: 'uppercase',
          marginBottom: '2px',
        }}>
          Achievement Unlocked
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontWeight: 700,
          fontSize: '16px',
          color: 'var(--fg)',
        }}>
          {current.name}
        </div>
        <div style={{
          fontFamily: 'var(--font-body)',
          fontSize: '13px',
          color: 'var(--muted)',
          marginTop: '2px',
        }}>
          {current.description}
        </div>
      </div>
    </div>
  );
}
