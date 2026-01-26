import React, { useEffect, useRef } from 'react';
import { useStore } from '@nanostores/react';
import { remindersStore } from '../stores/reminders';
import { goalsStore } from '../stores/goals';

export default function NotificationManager() {
  const reminders = useStore(remindersStore);
  const goals = useStore(goalsStore);
  const lastTriggeredRef = useRef<string | null>(null); // To prevent double firing in the same minute

  // Simple beep function using Web Audio API
  const playSound = () => {
    try {
      const audio = new Audio('/sound.mp3');
      audio.play().catch(e => console.error("Audio play failed", e));
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  useEffect(() => {
    // Request permission on mount (or maybe we should do this on a button click to be polite? 
    // Browsers often block auto-request. We'll leave it passive here and rely on the UI to request it.)
    
    const checkReminders = () => {
      const now = new Date();
      const currentDay = now.getDay();
      const currentHours = now.getHours().toString().padStart(2, '0');
      const currentMinutes = now.getMinutes().toString().padStart(2, '0');
      const currentTimeStr = `${currentHours}:${currentMinutes}`;
      
      // Avoid re-triggering for the same minute
      if (lastTriggeredRef.current === currentTimeStr) return;

      reminders.forEach(reminder => {
        if (!reminder.enabled) return;
        if (!reminder.days.includes(currentDay)) return;
        
        if (reminder.time === currentTimeStr) {
          // Trigger!
          const goal = reminder.goalId ? goals.find(g => g.id === reminder.goalId) : null;
          const title = goal ? goal.name : (reminder.title || 'Reminder');
          const body = goal ? `Time for your goal: ${goal.name}` : 'Here is your reminder!';
          const icon = '/oap.png'; 

          // 1. System Notification
          if (Notification.permission === 'granted') {
            new Notification(title, { body, icon });
          }

          // 2. Sound
          playSound();

          lastTriggeredRef.current = currentTimeStr;
        }
      });
    };

    const intervalId = setInterval(checkReminders, 10000); // Check every 10 seconds to be safe
    return () => clearInterval(intervalId);
  }, [reminders, goals]);

  return null; // Invisible component
}