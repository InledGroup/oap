import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { remindersStore } from '../stores/reminders';
import { goalsStore, entriesStore } from '../stores/goals';
import { settingsStore } from '../stores/appState';
import { format } from 'date-fns';
import { syncDataToSW } from '../pwa';

export default function NotificationManager() {
  const reminders = useStore(remindersStore);
  const goals = useStore(goalsStore);
  const entries = useStore(entriesStore);
  const settings = useStore(settingsStore);
  const lastTriggeredRef = useRef<string | null>(null); 
  const lastLowProgressRef = useRef<string | null>(null);

  // Sync with Service Worker for background notifications
  useEffect(() => {
    syncDataToSW({
      goals,
      entries,
      settings,
      reminders
    });
  }, [goals, entries, settings, reminders]);

  const playSound = () => {
    try {
      const audio = new Audio('/sound.mp3');
      audio.play().catch(e => console.error("Audio play failed", e));
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const showNotification = (title: string, body: string) => {
    if (Notification.permission === 'granted') {
      new Notification(title, { body, icon: '/oap.png' });
    }
    playSound();
  };

  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      const todayStr = format(now, 'yyyy-MM-dd');

      if (lastTriggeredRef.current === currentTimeStr) return;

      // 1. Regular Reminders
      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        if (!reminder.days.includes(currentDay)) return;

        if (reminder.time === currentTimeStr) {
          const goal = reminder.goalId ? goals.find(g => g.id === reminder.goalId) : null;
          const title = goal ? goal.name : (reminder.title || 'Reminder');
          const body = goal ? `Time for your goal: ${goal.name}` : 'Here is your reminder!';
          showNotification(title, body);
          lastTriggeredRef.current = currentTimeStr;
        }
      });

      // 2. Low Progress Alert (if enabled)
      if (settings.lowProgressAlertEnabled) {
        // Check at 18:00 and 21:00
        const checkTimes = ['18:00', '21:00'];
        if (checkTimes.includes(currentTimeStr) && lastLowProgressRef.current !== currentTimeStr) {
          const scheduledGoals = goals.filter(g => {
             if (!g.repeatDays.includes(currentDay)) return false;
             if (todayStr.localeCompare(g.startDate) < 0) return false;
             if (g.endDate && todayStr.localeCompare(g.endDate) > 0) return false;
             return true;
          });

          if (scheduledGoals.length > 0) {
            const completedCount = scheduledGoals.filter(g => {
               const entry = entries[`${g.id}_${todayStr}`];
               return entry && (entry.completed || entry.value >= (g.target || 1));
            }).length;
            const percentage = (completedCount / scheduledGoals.length) * 100;

            if (percentage < settings.lowProgressThreshold) {
              showNotification("Objetivos hoy", settings.lowProgressMessage);
            }
          }
          lastLowProgressRef.current = currentTimeStr;
        }
      }
    };

    const intervalId = setInterval(checkReminders, 10000); 
    return () => clearInterval(intervalId);
  }, [reminders, goals, entries, settings]);

  return null; 
}