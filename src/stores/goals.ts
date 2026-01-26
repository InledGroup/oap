import { persistentAtom } from '@nanostores/persistent';
import { subDays, format } from 'date-fns';

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
}

export interface Entry {
  value: number; // 1 for check, minutes for time, count for number
  completed: boolean; // if target reached
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
  // Clean up entries for this goal? Optional, maybe keep history.
};

export const setEntry = (goalId: string, dateStr: string, value: number, target: number = 1) => {
  const key = `${goalId}_${dateStr}`;
  const completed = value >= target;
  
  const currentEntries = entriesStore.get();
  entriesStore.set({
    ...currentEntries,
    [key]: { value, completed }
  });
};

export const getEntry = (goalId: string, dateStr: string): Entry | undefined => {
  return entriesStore.get()[`${goalId}_${dateStr}`];
};

export const getStreak = (referenceDate: Date = new Date()): number => {
  const goals = goalsStore.get();
  const entries = entriesStore.get();
  
  if (goals.length === 0) return 0;

  let streak = 0;
  let currentCheckDate = new Date(referenceDate);
  let checking = true;
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const refDateStr = format(referenceDate, 'yyyy-MM-dd');

  while (checking) {
    const dateStr = format(currentCheckDate, 'yyyy-MM-dd');
    const dayOfWeek = currentCheckDate.getDay();

    // Find goals scheduled for this day
    const scheduledGoals = goals.filter(g => {
       if (!g.repeatDays.includes(dayOfWeek)) return false;
       if (dateStr.localeCompare(g.startDate) < 0) return false;
       if (g.endDate && dateStr.localeCompare(g.endDate) > 0) return false;
       return true;
    });

    if (scheduledGoals.length === 0) {
       // If no goals were scheduled this day, we just skip it (it doesn't break the streak, but doesn't add to it)
       // UNLESS it's the very first day we are checking (Reference Date) and it has no goals,
       // we continue backward.
       if (streak > 365) checking = false;
    } else {
       // Check if ALL scheduled goals were completed
       const allCompleted = scheduledGoals.every(g => {
          const entry = entries[`${g.id}_${dateStr}`];
          if (!entry) return false;
          // Check completion based on type
          if (g.type === 'check') return entry.completed || entry.value >= 1;
          return entry.value >= (g.target || 1);
       });

       if (allCompleted) {
          streak++;
       } else {
          // If not completed...
          // If the day being checked is TODAY, it doesn't break the streak yet (unless we strictly want "current streak").
          // However, if we are calculating streak for a PAST date (refDate != today), then if that past date is incomplete, streak is 0.
          
          // Case 1: We are checking the Reference Date itself.
          if (dateStr === refDateStr) {
             // If reference date is TODAY, we allow it to be incomplete (streak starts from yesterday).
             if (dateStr === todayStr) {
                // Do nothing, just don't increment streak. Continue to yesterday.
             } else {
                // If reference date is a PAST date and it's incomplete, then the streak for that date is 0.
                checking = false;
             }
          } else {
             // Case 2: We are checking a day BEFORE the reference date.
             // If any previous day is incomplete, streak breaks.
             checking = false;
          }
       }
    }

    // Move to previous day
    currentCheckDate = subDays(currentCheckDate, 1);
    
    if (currentCheckDate.getFullYear() < 2020) checking = false;
  }

  return streak;
};
