import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore, entriesStore, getStreak } from '../stores/goals';
import { t, dateLocale } from '../stores/i18n';
import GoalCard from './GoalCard';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Star } from 'lucide-react';
import { clsx } from 'clsx';

export default function DailyGoals() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const goals = useStore(goalsStore);
  const entries = useStore(entriesStore); 
  const dict = useStore(t);
  const locale = useStore(dateLocale);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = selectedDate.getDay(); // 0-6 Sun-Sat

  const todaysGoals = useMemo(() => {
    return goals.filter(goal => {
      // 1. Check Day of Week
      if (!goal.repeatDays.includes(dayOfWeek)) return false;
      
      // 2. Check Date Range
      if (dateStr.localeCompare(goal.startDate) < 0) return false;
      if (goal.endDate && dateStr.localeCompare(goal.endDate) > 0) return false;

      return true;
    });
  }, [goals, dayOfWeek, dateStr]);

  const streak = useMemo(() => getStreak(selectedDate), [entries, goals, selectedDate]);

  const handlePrev = () => setSelectedDate(d => subDays(d, 1));
  const handleNext = () => setSelectedDate(d => addDays(d, 1));
  const goToday = () => setSelectedDate(new Date());

  const isToday = isSameDay(selectedDate, new Date());

  // Check if all goals for the selected date are completed
  const isDayCompleted = useMemo(() => {
     if (todaysGoals.length === 0) return false;
     return todaysGoals.every(g => {
        const entry = entries[`${g.id}_${dateStr}`];
        if (!entry) return false;
        if (g.type === 'check') return entry.completed || entry.value >= 1;
        return entry.value >= (g.target || 1);
     });
  }, [todaysGoals, entries, dateStr]);

  return (
    <div className="pb-28 pt-6 px-4 max-w-md mx-auto min-h-screen flex flex-col bg-white">
      
      {/* Date Header */}
      <div className="flex items-center justify-between mb-8 sticky top-4 z-30">
        <button 
          onClick={handlePrev} 
          className="w-10 h-10 bg-white border-2 border-gray-200 border-b-4 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 active:border-b-2 active:translate-y-[2px] transition-all"
        >
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        
        <div 
          className="flex flex-col items-center cursor-pointer select-none" 
          onClick={goToday}
        >
          <h1 className="text-xl font-extrabold text-gray-800 tracking-tight uppercase first-letter:capitalize">
            {isToday ? dict.daily_today : format(selectedDate, 'EEEE', { locale })}
          </h1>
          <div className="flex items-center gap-1 text-xs font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-lg uppercase tracking-wide">
             <Calendar size={12} />
             {format(selectedDate, 'MMMM d', { locale })}
          </div>
        </div>

        <button 
          onClick={handleNext} 
          className="w-10 h-10 bg-white border-2 border-gray-200 border-b-4 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-500 hover:border-blue-200 active:border-b-2 active:translate-y-[2px] transition-all"
        >
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Progress Summary (Gamification) */}
      {(isDayCompleted || (isToday && streak > 0)) && todaysGoals.length > 0 && (
         <div className="mb-6 bg-amber-400 rounded-2xl p-4 border-b-4 border-amber-600 text-white flex items-center justify-between shadow-sm animate-in fade-in zoom-in duration-300">
            <div className="font-bold text-amber-900">
               <span className="text-xs opacity-80 uppercase tracking-wider block mb-0.5">{dict.daily_streak}</span>
               <span className="text-2xl flex items-center gap-2">
                 🔥 {streak} {streak === 1 ? dict.daily_day : dict.daily_days}
               </span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-amber-900 shadow-inner">
               <Star size={28} fill="currentColor" strokeWidth={0} />
            </div>
         </div>
      )}

      {/* Goals List */}
      <div className="flex-1">
        {todaysGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-300">
            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Calendar size={48} className="opacity-20" />
            </div>
            <p className="text-xl font-bold text-gray-400">{dict.daily_no_goals}</p>
            <p className="text-sm font-medium">{dict.daily_enjoy}</p>
          </div>
        ) : (
          <div className="space-y-4">
            {todaysGoals.map(goal => (
              <GoalCard key={goal.id} goal={goal} dateStr={dateStr} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}