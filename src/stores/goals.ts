import { persistentAtom } from '@nanostores/persistent';
import { subDays, format, isToday } from 'date-fns';
import { userStatsStore, settingsStore } from './appState';

export type GoalType = 'check' | 'time' | 'number';

export interface Goal {
  id: string;
  name: string;
  color: string;
  emoji: string;
  type: GoalType;
  tintType?: 'icon' | 'card'; 
  target?: number; // For time (minutes) or number
  repeatDays: number[]; // 0-6, Sunday is 0
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD, optional (infinite if missing)
  createdAt: number;
  rewardTokens?: number; // Specific tokens for this goal
}

export interface Entry {
  value: number; // 1 for check, minutes for time, count for number
  completed: boolean; // if target reached
  rewarded?: boolean; // if token was given
}

// Store for Goals
export const goalsStore = persistentAtom<Goal[]>('goals_v1', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Store for Entries: Key is `${goalId}_${YYYY-MM-DD}`
export const entriesStore = persistentAtom<Record<string, Entry>>('entries_v1', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Helpers
export const addGoal = (goal: Goal) => {
  goalsStore.set([...goalsStore.get(), goal]);
};

export const updateGoal = (updatedGoal: Goal) => {
  goalsStore.set(goalsStore.get().map(g => g.id === updatedGoal.id ? updatedGoal : g));
};

export const deleteGoal = (id: string) => {
  goalsStore.set(goalsStore.get().filter(g => g.id !== id));
};

export const setEntry = (goalId: string, dateStr: string, value: number, target: number = 1) => {
  const key = `${goalId}_${dateStr}`;
  const completed = value >= target;
  
  const currentEntries = entriesStore.get();
  const existingEntry = currentEntries[key];
  const settings = settingsStore.get();
  
  let rewarded = existingEntry?.rewarded || false;
  
  // Give token if completed for the first time
  if (completed && !rewarded) {
    rewarded = true;
    const goal = goalsStore.get().find(g => g.id === goalId);
    const baseReward = goal?.rewardTokens ?? 1;
    const finalReward = Math.ceil(baseReward * (settings.globalTokenMultiplier || 1));

    const stats = userStatsStore.get();
    userStatsStore.set({
      ...stats,
      tokens: stats.tokens + finalReward
    });
  }

  entriesStore.set({
    ...currentEntries,
    [key]: { value, completed, rewarded }
  });
};

export const getEntry = (goalId: string, dateStr: string): Entry | undefined => {
  return entriesStore.get()[`${goalId}_${dateStr}`];
};

export const buyStreakFreezer = (customCost?: number) => {
  const stats = userStatsStore.get();
  const settings = settingsStore.get();
  const cost = customCost ?? settings.streakFreezerCost;
  
  if (stats.tokens >= cost) {
    userStatsStore.set({
      ...stats,
      tokens: stats.tokens - cost,
      streakFreezers: stats.streakFreezers + 1
    });
    return true;
  }
  return false;
};

// Store for used freezers to avoid infinite use
// Key: YYYY-MM-DD
export const usedFreezersStore = persistentAtom<Record<string, boolean>>('used_freezers_v1', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const useStreakFreezer = (dateStr: string) => {
  const stats = userStatsStore.get();
  if (stats.streakFreezers > 0 && !usedFreezersStore.get()[dateStr]) {
    userStatsStore.set({
      ...stats,
      streakFreezers: stats.streakFreezers - 1
    });
    usedFreezersStore.set({
      ...usedFreezersStore.get(),
      [dateStr]: true
    });
    return true;
  }
  return false;
};

export const getStreak = (referenceDate: Date = new Date()): number => {
  const goals = goalsStore.get();
  const entries = entriesStore.get();
  const settings = settingsStore.get();
  const usedFreezers = usedFreezersStore.get();
  
  if (goals.length === 0) return 0;

  let streak = 0;
  let currentCheckDate = new Date(referenceDate);
  let checking = true;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const refDateStr = format(referenceDate, 'yyyy-MM-dd');

  while (checking) {
    const dateStr = format(currentCheckDate, 'yyyy-MM-dd');
    const dayOfWeek = currentCheckDate.getDay();

    const scheduledGoals = goals.filter(g => {
       if (!g.repeatDays.includes(dayOfWeek)) return false;
       if (dateStr.localeCompare(g.startDate) < 0) return false;
       if (g.endDate && dateStr.localeCompare(g.endDate) > 0) return false;
       return true;
    });

    if (scheduledGoals.length === 0) {
       // Skip day with no goals
    } else {
       let daySuccess = false;

       if (settings.streakType === 'all') {
         daySuccess = scheduledGoals.every(g => {
            const entry = entries[`${g.id}_${dateStr}`];
            if (!entry) return false;
            return entry.completed || entry.value >= (g.target || 1);
         });
       } else {
         const completedCount = scheduledGoals.filter(g => {
            const entry = entries[`${g.id}_${dateStr}`];
            return entry && (entry.completed || entry.value >= (g.target || 1));
         }).length;
         const percentage = (completedCount / scheduledGoals.length) * 100;
         daySuccess = percentage >= settings.minStreakPercentage;
       }

       // Check for Freezer
       if (!daySuccess && usedFreezers[dateStr]) {
         daySuccess = true;
       }

       if (daySuccess) {
          streak++;
       } else {
          if (dateStr === refDateStr && dateStr === todayStr) {
             // Today incomplete doesn't break streak yet
          } else {
             checking = false;
          }
       }
    }

    currentCheckDate = subDays(currentCheckDate, 1);
    if (currentCheckDate.getFullYear() < 2020) checking = false;
  }

  return streak;
};
