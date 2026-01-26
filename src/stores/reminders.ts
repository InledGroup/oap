import { persistentAtom } from '@nanostores/persistent';

export interface Reminder {
  id: string;
  title?: string; // If not linked to a goal
  goalId?: string; // Optional link to a goal
  time: string; // "HH:MM" 24h format
  days: number[]; // 0-6, Sunday is 0
  enabled: boolean;
}

export const remindersStore = persistentAtom<Reminder[]>('reminders_v1', [], {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export const addReminder = (reminder: Reminder) => {
  remindersStore.set([...remindersStore.get(), reminder]);
};

export const updateReminder = (updated: Reminder) => {
  remindersStore.set(remindersStore.get().map(r => r.id === updated.id ? updated : r));
};

export const deleteReminder = (id: string) => {
  remindersStore.set(remindersStore.get().filter(r => r.id !== id));
};
