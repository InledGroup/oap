import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { remindersStore, addReminder, deleteReminder, updateReminder, type Reminder } from '../stores/reminders';
import { goalsStore } from '../stores/goals';
import { Bell, Plus, Trash2, X, Volume2, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export default function RemindersList() {
  const reminders = useStore(remindersStore);
  const goals = useStore(goalsStore);
  const [isAdding, setIsAdding] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof Notification !== 'undefined') {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    const perm = await Notification.requestPermission();
    setPermission(perm);
  };

  const testNotification = () => {
    // 1. Sound
    try {
      const audio = new Audio('/sound.mp3');
      audio.play().catch(e => console.error("Audio play failed", e));
    } catch (e) {
      console.error(e);
    }

    // 2. Notification
    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is how your reminders will appear.',
        icon: '/icon-192.png'
      });
    } else {
      alert('Enable notifications first!');
    }
  };

  // Form State
  const [title, setTitle] = useState('');
  const [goalId, setGoalId] = useState('');
  const [time, setTime] = useState('09:00');
  const [days, setDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addReminder({
      id: crypto.randomUUID(),
      title: goalId ? undefined : title, // Clear title if linked to goal
      goalId: goalId || undefined,
      time,
      days,
      enabled: true
    });
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setGoalId('');
    setTime('09:00');
    setDays([0, 1, 2, 3, 4, 5, 6]);
  };

  const toggleDay = (dayIndex: number) => {
    setDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const toggleEnabled = (reminder: Reminder) => {
    updateReminder({ ...reminder, enabled: !reminder.enabled });
  };

  const getReminderLabel = (reminder: Reminder) => {
    if (reminder.goalId) {
      const goal = goals.find(g => g.id === reminder.goalId);
      return goal ? `Goal: ${goal.name}` : '(Deleted Goal)';
    }
    return reminder.title || 'Untitled Reminder';
  };

  // If permission is strictly needed and not granted, block the view or show a prominent CTA
  if (permission !== 'granted') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6">
        <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mb-2">
          <Bell size={40} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Enable Notifications</h2>
          <p className="text-gray-500 mt-2">
            To receive reminders for your goals, you need to allow notifications for this app.
          </p>
        </div>
        <button 
          onClick={requestPermission}
          className="bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
        >
          Allow Notifications
        </button>
      </div>
    );
  }

  // If Adding, show full screen form (overlay)
  if (isAdding) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-50 p-4 pb-24 overflow-y-auto animate-in slide-in-from-bottom-10">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">New Reminder</h1>
          <button 
            onClick={() => setIsAdding(false)}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-4 rounded-xl shadow-sm">
            {/* Type Selector */}
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Remind me about</label>
               <select 
                 value={goalId} 
                 onChange={e => setGoalId(e.target.value)}
                 className="w-full p-3 border border-gray-200 rounded-lg text-base bg-white focus:border-blue-500 outline-none"
               >
                 <option value="">Custom Message</option>
                 {goals.map(g => (
                   <option key={g.id} value={g.id}>{g.emoji} {g.name}</option>
                 ))}
               </select>
            </div>

            {/* Custom Title (if no goal) */}
            {!goalId && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <input 
                  type="text" 
                  placeholder="e.g. Drink Water"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required={!goalId}
                  className="w-full p-3 border border-gray-200 rounded-lg text-base focus:border-blue-500 outline-none"
                />
              </div>
            )}

            {/* Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
              <input 
                type="time" 
                value={time}
                onChange={e => setTime(e.target.value)}
                required
                className="w-full p-3 border border-gray-200 rounded-lg text-2xl font-mono text-center focus:border-blue-500 outline-none"
              />
            </div>

            {/* Days */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Repeat On</label>
              <div className="flex justify-between">
                {DAYS.map((d, i) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={clsx(
                      "w-9 h-9 rounded-full text-xs font-medium flex items-center justify-center transition-colors",
                      days.includes(i) 
                        ? "bg-blue-600 text-white" 
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {d.charAt(0)}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <button type="submit" className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                Save Reminder
              </button>
            </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      
      {/* Test Button */}
      <button 
        onClick={testNotification}
        className="w-full flex items-center justify-center gap-2 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors"
      >
        <Volume2 size={16} />
        Test Sound & Notification
      </button>

      {/* List */}
      <div className="space-y-3">
        {reminders.map(reminder => (
          <div key={reminder.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-bold text-gray-900">{reminder.time}</span>
                <span className={clsx("text-xs px-2 py-0.5 rounded-full", reminder.enabled ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500")}>
                  {reminder.enabled ? 'ON' : 'OFF'}
                </span>
              </div>
              <div className="text-sm font-medium text-gray-700">{getReminderLabel(reminder)}</div>
              <div className="flex gap-1 mt-1">
                 {DAYS.map((d, i) => (
                    <span key={i} className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${reminder.days.includes(i) ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-300'}`}>
                      {d.charAt(0)}
                    </span>
                 ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button onClick={() => toggleEnabled(reminder)} className={`p-2 rounded-full ${reminder.enabled ? 'text-blue-600 bg-blue-50' : 'text-gray-400 bg-gray-50'}`}>
                <Bell size={18} />
              </button>
              <button onClick={() => deleteReminder(reminder.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-full">
                <Trash2 size={18} />
              </button>
            </div>
          </div>
        ))}
        
        {reminders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p>No reminders yet.</p>
          </div>
        )}
      </div>

      {/* FAB Add Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-300 flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-40"
      >
        <Plus size={28} />
      </button>

    </div>
  );
}