import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore } from '../stores/goals';
import GoalCard from './GoalCard';
import { format, addDays, subDays, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

export default function DailyGoals() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const goals = useStore(goalsStore);

  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const dayOfWeek = selectedDate.getDay(); // 0-6 Sun-Sat

  const todaysGoals = useMemo(() => {
    return goals.filter(goal => goal.repeatDays.includes(dayOfWeek));
  }, [goals, dayOfWeek]);

  const handlePrev = () => setSelectedDate(d => subDays(d, 1));
  const handleNext = () => setSelectedDate(d => addDays(d, 1));
  const goToday = () => setSelectedDate(new Date());

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto min-h-screen flex flex-col">
      
      {/* Date Header */}
      <div className="flex items-center justify-between mb-6 bg-white p-3 rounded-xl shadow-sm sticky top-4 z-10">
        <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronLeft size={24} />
        </button>
        
        <div className="flex flex-col items-center cursor-pointer" onClick={goToday}>
          <h1 className="text-lg font-bold text-gray-900">
            {isSameDay(selectedDate, new Date()) ? 'Today' : format(selectedDate, 'EEEE')}
          </h1>
          <span className="text-sm text-gray-500">{format(selectedDate, 'MMMM d, yyyy')}</span>
        </div>

        <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full text-gray-600">
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Goals List */}
      <div className="flex-1">
        {todaysGoals.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-400">
            <Calendar size={48} className="mb-4 opacity-20" />
            <p className="text-lg font-medium">No goals for this day</p>
            <p className="text-sm">Enjoy your free time!</p>
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