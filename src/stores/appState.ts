import { persistentAtom } from '@nanostores/persistent';

// 'true' if the user has clicked "Get Started" or installed the app
export const onboardedStore = persistentAtom<boolean>('oap_onboarded', false, {
  encode: String,
  decode: (str) => str === 'true',
});

// --- NEW SETTINGS & GAMIFICATION ---

export type StreakType = 'percentage' | 'all';

export interface UserSettings {
  lowProgressAlertEnabled: boolean;
  lowProgressThreshold: number; // 0-100
  lowProgressMessage: string;
  streakType: StreakType;
  minStreakPercentage: number; // for 'percentage' mode
  globalTokenMultiplier: number;
  streakFreezerCost: number;
}

export const settingsStore = persistentAtom<UserSettings>('oap_settings_v1', {
  lowProgressAlertEnabled: false,
  lowProgressThreshold: 30,
  lowProgressMessage: "¡Aún puedes lograrlo! Completa tus metas de hoy.",
  streakType: 'percentage',
  minStreakPercentage: 80,
  globalTokenMultiplier: 1,
  streakFreezerCost: 50,
}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export interface UserStats {
  tokens: number;
  streakFreezers: number;
  currentStreak: number;
  lastStreakUpdate: string; // YYYY-MM-DD
}

export const userStatsStore = persistentAtom<UserStats>('oap_stats_v1', {
  tokens: 0,
  streakFreezers: 0,
  currentStreak: 0,
  lastStreakUpdate: '',
}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

// Helper to update stats
export const updateStats = (updater: (stats: UserStats) => UserStats) => {
  userStatsStore.set(updater(userStatsStore.get()));
};

export const updateSettings = (updater: (settings: UserSettings) => UserSettings) => {
  settingsStore.set(updater(settingsStore.get()));
};
