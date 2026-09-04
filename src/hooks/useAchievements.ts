// src/hooks/useAchievements.ts
import { useEffect, useRef, useCallback } from 'react';
import { useAssessmentStore } from '../store/assessmentStore';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: (state: ReturnType<typeof useAssessmentStore.getState>) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-complete',
    name: 'First Steps',
    description: 'Complete your first module',
    icon: '🎯',
    condition: (s) => Object.values(s.results).filter(r => r.completed).length >= 1,
  },
  {
    id: 'all-complete',
    name: 'Full Clearance',
    description: 'Complete all 5 modules',
    icon: '🏆',
    condition: (s) => s.allModulesComplete(),
  },
  {
    id: 'perfect-score',
    name: 'Flawless',
    description: 'Score 100% on any module',
    icon: '⭐',
    condition: (s) => Object.values(s.results).some(r => r.completed && r.score === r.total),
  },
  {
    id: 'speed-demon',
    name: 'Speed Demon',
    description: 'Complete a module in under 2 minutes',
    icon: '⚡',
    condition: (s) => Object.values(s.results).some(r => r.completed && r.duration && r.duration < 120),
  },
  {
    id: 'streak-3',
    name: 'Hot Streak',
    description: 'Get 3 correct answers in a row',
    icon: '🔥',
    condition: (s) => s.currentStreak >= 3,
  },
  {
    id: 'streak-5',
    name: 'Unstoppable',
    description: 'Get 5 correct answers in a row',
    icon: '💎',
    condition: (s) => s.currentStreak >= 5,
  },
];

export function useAchievements() {
  const prevUnlockedRef = useRef<Set<string>>(new Set());
  const newAchievement = useRef<Achievement | null>(null);

  const checkAchievements = useCallback(() => {
    const state = useAssessmentStore.getState();
    const currentUnlocked = new Set(state.unlockedAchievements);

    for (const ach of ACHIEVEMENTS) {
      if (!prevUnlockedRef.current.has(ach.id) && ach.condition(state)) {
        currentUnlocked.add(ach.id);
        newAchievement.current = ach;
        // Defer to break out of any synchronous Zustand subscriber call stack
        setTimeout(() => {
          useAssessmentStore.setState({ unlockedAchievements: Array.from(currentUnlocked) });
        }, 0);
        break;
      }
    }

    prevUnlockedRef.current = currentUnlocked;
  }, []);

  useEffect(() => {
    const state = useAssessmentStore.getState();
    prevUnlockedRef.current = new Set(state.unlockedAchievements);
  }, []);

  return {
    achievements: ACHIEVEMENTS,
    checkAchievements,
    newAchievement,
  };
}
