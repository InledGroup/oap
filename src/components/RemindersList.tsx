import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { remindersStore, addReminder, deleteReminder, updateReminder, type Reminder } from '../stores/reminders';
import { goalsStore } from '../stores/goals';
import { t } from '../stores/i18n';
import { Bell, Plus, Trash2, X, Volume2, Clock } from 'lucide-react';
import { clsx } from 'clsx';

const DAYS = ['D', 'L', 'M', 'X', 'J', 'V', 'S'];

export default function RemindersList() {
  const reminders = useStore(remindersStore);
  const goals = useStore(goalsStore);
  const dict = useStore(t);
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
    try {
      const audio = new Audio('/sound.mp3');
      audio.play().catch(e => console.error("Audio play failed", e));
    } catch (e) {
      console.error(e);
    }

    if (permission === 'granted') {
      new Notification('Test Notification', {
        body: 'This is how your reminders will appear.',
        icon: '/oapp.png'
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
      title: goalId ? undefined : title,
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
      return goal ? `${goal.emoji} ${goal.name}` : '(Deleted Goal)';
    }
    return reminder.title || dict.reminders_title;
  };

  if (permission !== 'granted') {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center space-y-6 bg-white rounded-3xl border-2 border-gray-100 border-b-4">
        <div className="w-24 h-24 bg-blue-100 rounded-3xl flex items-center justify-center text-blue-600 mb-2 shadow-inner">
          <Bell size={48} />
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-gray-800">{dict.reminders_enable_title}</h2>
          <p className="text-gray-500 font-medium mt-2">
            {dict.reminders_enable_desc}
          </p>
        </div>
        <button 
          onClick={requestPermission}
          className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-blue-200 border-b-4 border-blue-800 active:border-b-0 active:translate-y-[4px] transition-all"
        >
          {dict.reminders_allow}
        </button>
      </div>
    );
  }

  // Adding Form Overlay
  if (isAdding) {
    return (
      <div className="fixed inset-0 bg-white z-50 p-4 pb-24 overflow-y-auto animate-in slide-in-from-bottom-10">
        <div className="flex items-center justify-between mb-8 max-w-md mx-auto">
          <h1 className="text-2xl font-extrabold text-gray-900">{dict.reminders_new}</h1>
          <button 
            onClick={() => setIsAdding(false)}
            className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <X size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 max-w-md mx-auto">
            {/* Goal Selector */}
            <div>
               <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.reminders_remind_me}</label>
               <div className="grid grid-cols-1 gap-3">
                 <button
                   type="button"
                   onClick={() => setGoalId('')}
                   className={clsx(
                     "p-4 rounded-2xl border-2 border-b-4 text-left font-bold transition-all active:border-b-2 active:translate-y-[2px]",
                     !goalId 
                        ? "bg-blue-50 border-blue-200 text-blue-600" 
                        : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                   )}
                 >
                    {dict.reminders_custom}
                 </button>
                 {goals.map(g => (
                   <button
                     key={g.id}
                     type="button"
                     onClick={() => setGoalId(g.id)}
                     className={clsx(
                       "p-4 rounded-2xl border-2 border-b-4 text-left font-bold transition-all active:border-b-2 active:translate-y-[2px] flex items-center gap-3",
                       goalId === g.id
                          ? "bg-blue-50 border-blue-200 text-blue-600" 
                          : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                     )}
                   >
                      <span className="text-2xl">{g.emoji}</span>
                      <span>{g.name}</span>
                   </button>
                 ))}
               </div>
            </div>

            {/* Custom Message Input */}
            {!goalId && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{dict.reminders_message}</label>
                <input 
                  type="text" 
                  placeholder={dict.reminders_message_placeholder}
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required={!goalId}
                  className="w-full h-16 px-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 text-lg font-bold outline-none bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            )}

            {/* Time Picker */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{dict.reminders_time}</label>
              <div className="relative">
                 <input 
                   type="time" 
                   value={time}
                   onChange={e => setTime(e.target.value)}
                   required
                   className="w-full h-20 px-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 text-4xl font-black text-center outline-none bg-white"
                 />
                 <Clock className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" size={32} />
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.form_repeat}</label>
              <div className="flex justify-between gap-1">
                {DAYS.map((d, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => toggleDay(i)}
                    className={clsx(
                      "w-10 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all border-b-4 active:border-b-2 active:translate-y-[2px]",
                      days.includes(i) 
                        ? "bg-blue-500 border-blue-700 text-white" 
                        : "bg-gray-100 border-gray-300 text-gray-400"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="pt-8">
              <button 
                 type="submit" 
                 className="w-full bg-green-500 text-white h-16 rounded-2xl font-extrabold text-xl shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-[4px] hover:bg-green-600 transition-all"
              >
                {dict.reminders_save}
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
        className="w-full py-3 bg-white border-2 border-gray-100 border-b-4 text-blue-500 rounded-2xl font-bold text-sm hover:bg-blue-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
      >
        <Volume2 size={18} />
        {dict.reminders_test}
      </button>

      {/* List */}
      <div className="space-y-4">
        {reminders.map(reminder => (
          <div key={reminder.id} className="bg-white p-4 rounded-2xl border-2 border-gray-200 border-b-4 flex items-center gap-4">
            
            {/* Time Badge */}
            <div className="flex flex-col items-center justify-center w-20 h-20 bg-gray-50 rounded-xl border-2 border-gray-100">
               <span className="text-2xl font-black text-gray-800">{reminder.time}</span>
               <div className="flex gap-0.5 mt-1">
                 {reminder.days.length === 7 ? (
                    <span className="text-[10px] font-bold text-gray-400">{dict.reminders_daily}</span>
                 ) : (
                    reminder.days.map(d => (
                       <span key={d} className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    ))
                 )}
               </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-bold text-gray-800 truncate text-lg">{getReminderLabel(reminder)}</div>
              <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mt-1">
                 {reminder.enabled ? dict.reminders_on : dict.reminders_off}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <button 
                 onClick={() => toggleEnabled(reminder)} 
                 className={clsx(
                    "w-10 h-10 rounded-xl flex items-center justify-center border-b-4 transition-all active:border-b-0 active:translate-y-[4px]",
                    reminder.enabled 
                       ? "bg-green-500 border-green-700 text-white" 
                       : "bg-gray-200 border-gray-300 text-gray-400"
                 )}
              >
                <Bell size={20} fill={reminder.enabled ? "currentColor" : "none"} />
              </button>
              <button 
                 onClick={() => deleteReminder(reminder.id)} 
                 className="w-10 h-10 rounded-xl bg-red-100 text-red-400 border-b-4 border-red-200 flex items-center justify-center hover:bg-red-200 active:border-b-0 active:translate-y-[4px] transition-all"
              >
                <Trash2 size={20} />
              </button>
            </div>
          </div>
        ))}
        
        {reminders.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold">{dict.reminders_empty}</p>
          </div>
        )}
      </div>

      {/* FAB Add Button */}
      <button
        onClick={() => setIsAdding(true)}
        className="fixed bottom-24 right-6 w-16 h-16 bg-blue-500 rounded-2xl text-white shadow-xl flex items-center justify-center border-b-4 border-blue-700 active:border-b-0 active:translate-y-[4px] hover:bg-blue-600 transition-all z-40"
      >
        <Plus size={32} strokeWidth={4} />
      </button>

    </div>
  );
}