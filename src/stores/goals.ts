import { persistentAtom } from '@nanostores/persistent';

export type GoalType = 'check' | 'time' | 'number';

export interface Goal {
  id: string;
  name: string;
  color: string;
  emoji: string;
  type: GoalType;
  tintType?: 'icon' | 'card'; // New property
  target?: number; // For time (minutes) or number
  repeatDays: number[]; // 0-6, Sunday is 0
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
