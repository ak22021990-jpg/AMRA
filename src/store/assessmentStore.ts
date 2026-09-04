import { create } from 'zustand';

export interface ModuleResult {
  moduleId: string;
  score: number;
  total: number;
  skillTags: string[];
  criticalErrors?: number;
  completed: boolean;
  duration?: number;
}

export interface RoutingRecommendation {
  label: string;
  color: string;
  badge: string;
  signals: string[];
}

interface AssessmentStore {
  candidateName: string;
  candidateEmail: string;
  results: Record<string, ModuleResult>;
  unlockedAchievements: string[];
  currentStreak: number;
  bestStreak: number;
  xp: number;
  audioEnabled: boolean;
  moduleStartTime: number | null;
  startModule: () => void;
  recordAnswer: (correct: boolean, xpGained?: number) => void;
  addXp: (amount: number) => void;
  toggleAudio: () => void;
  setCandidate: (name: string, email: string) => void;
  recordResult: (result: ModuleResult) => void;
  resetModule: (moduleId: string) => void;
  getRoutingRecommendation: () => RoutingRecommendation;
  getCompositeScore: () => number;
  allModulesComplete: () => boolean;
  resetAssessment: () => void;
}

const MODULE_IDS = ['driving', 'listening', 'cognitive', 'pattern', 'grammar'];

export const useAssessmentStore = create<AssessmentStore>((set, get) => ({
  candidateName: '',
  candidateEmail: '',
  results: {},
  unlockedAchievements: [],
  currentStreak: 0,
  bestStreak: 0,
  xp: 0,
  audioEnabled: true,
  moduleStartTime: null,

  startModule: () => {
    set({ moduleStartTime: Date.now() });
  },

  recordAnswer: (correct: boolean, xpGained = 10) => {
    const { currentStreak, bestStreak, xp } = get();
    if (correct) {
      const newStreak = currentStreak + 1;
      set({
        currentStreak: newStreak,
        bestStreak: Math.max(newStreak, bestStreak),
        xp: xp + xpGained + (newStreak > 2 ? 5 : 0), // bonus xp for streak
      });
    } else {
      set({ currentStreak: 0 });
    }
  },

  addXp: (amount: number) => set((state) => ({ xp: state.xp + amount })),
  
  toggleAudio: () => set((state) => ({ audioEnabled: !state.audioEnabled })),

  setCandidate: (name, email) => set({ candidateName: name, candidateEmail: email }),

  recordResult: (result) =>
    set((state) => {
      const { moduleStartTime, xp } = state;
      const duration = moduleStartTime ? Math.round((Date.now() - moduleStartTime) / 1000) : undefined;
      // Bonus XP for finishing module
      const bonusXp = result.completed ? 50 : 0;
      return {
        results: { ...state.results, [result.moduleId]: { ...result, duration } },
        moduleStartTime: null,
        xp: xp + bonusXp
      };
    }),

  resetModule: (moduleId) =>
    set((state) => {
      const { [moduleId]: _, ...rest } = state.results;
      return { results: rest };
    }),

  allModulesComplete: () => {
    const { results } = get();
    return MODULE_IDS.every((id) => results[id]?.completed);
  },

  getCompositeScore: (): number => {
    const { results } = get();
    const driving = results['driving'];
    const listening = results['listening'];
    const cognitive = results['cognitive'];
    const pattern = results['pattern'];
    const grammar = results['grammar'];

    const drivingPct = driving ? (driving.score / driving.total) * 100 : 0;
    const listeningPct = listening ? (listening.score / listening.total) * 100 : 0;
    const cognitivePct = cognitive ? (cognitive.score / cognitive.total) * 100 : 0;
    const patternPct = pattern ? (pattern.score / pattern.total) * 100 : 0;
    const grammarPct = grammar ? (grammar.score / grammar.total) * 100 : 0;

    return Math.round(
      (drivingPct * 0.35) +
      (listeningPct * 0.20) +
      (cognitivePct * 0.20) +
      (patternPct * 0.15) +
      (grammarPct * 0.10)
    );
  },

  getRoutingRecommendation: (): RoutingRecommendation => {
    const { results } = get();
    const signals: string[] = [];

    const driving = results['driving'];
    const listening = results['listening'];
    const cognitive = results['cognitive'];
    const pattern = results['pattern'];
    const grammar = results['grammar'];

    // Per-module percentage scores
    const drivingPct = driving ? (driving.score / driving.total) * 100 : 0;
    const listeningPct = listening ? (listening.score / listening.total) * 100 : 0;
    const cognitivePct = cognitive ? (cognitive.score / cognitive.total) * 100 : 0;
    const patternPct = pattern ? (pattern.score / pattern.total) * 100 : 0;
    const grammarPct = grammar ? (grammar.score / grammar.total) * 100 : 0;

    // Weighted composite
    const composite =
      (drivingPct * 0.35) +
      (listeningPct * 0.20) +
      (cognitivePct * 0.20) +
      (patternPct * 0.15) +
      (grammarPct * 0.10);

    const criticalErrors = driving?.criticalErrors ?? 0;

    if (criticalErrors > 0) {
      signals.push(`${criticalErrors} critical safety error${criticalErrors > 1 ? 's' : ''} — requires review`);
      return { label: 'Needs Review', color: 'var(--fail)', badge: 'SAFETY FLAG', signals };
    }

    if (composite >= 80) {
      if (drivingPct >= 80 && cognitivePct >= 80) signals.push('Strong driving + cognitive profile');
      if (listeningPct === 100) signals.push('Perfect listening retention');
      if (grammarPct === 100) signals.push('Excellent written communication');
      return { label: 'MPCI Ready', color: 'var(--pass)', badge: 'HIGH JUDGMENT', signals };
    }

    if (composite >= 60) {
      if (drivingPct >= 60) signals.push('Adequate driving knowledge');
      if (cognitivePct < 60) signals.push('Cognitive reasoning needs development');
      return { label: 'Triage Candidate', color: 'var(--warn)', badge: 'TRIAGE', signals };
    }

    signals.push('Performance below threshold across key modules');
    return { label: 'Not Recommended', color: 'var(--fail)', badge: 'NOT READY', signals };
  },

  resetAssessment: () =>
    set({
      candidateName: '',
      candidateEmail: '',
      results: {},
      unlockedAchievements: [],
      currentStreak: 0,
      bestStreak: 0,
      xp: 0,
      moduleStartTime: null,
    }),
}));
