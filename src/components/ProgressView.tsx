import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore, entriesStore, type Goal } from '../stores/goals';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type ViewMode = 'day' | 'week' | 'month';

export default function ProgressView() {
  const goals = useStore(goalsStore);
  const entries = useStore(entriesStore);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [referenceDate, setReferenceDate] = useState(new Date());

  // Calculate date range based on view mode
  const dateRange = useMemo(() => {
    const start = viewMode === 'day' ? referenceDate :
                  viewMode === 'week' ? startOfWeek(referenceDate, { weekStartsOn: 1 }) :
                  startOfMonth(referenceDate);
    const end = viewMode === 'day' ? referenceDate :
                viewMode === 'week' ? endOfWeek(referenceDate, { weekStartsOn: 1 }) :
                endOfMonth(referenceDate);
    return eachDayOfInterval({ start, end });
  }, [viewMode, referenceDate]);

  // Process data for charts
  const chartData = useMemo(() => {
    return dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      let totalGoals = 0;
      let dailyScore = 0; // Sum of completion ratios (0.0 to 1.0)

      goals.forEach(goal => {
        // Check if goal is active on this day of week
        if (goal.repeatDays.includes(date.getDay())) {
          totalGoals++;
          const entryKey = `${goal.id}_${dateStr}`;
          const entry = entries[entryKey];
          const value = entry?.value || 0;
          const target = goal.target || 1;

          // Calculate ratio for this goal
          let ratio = 0;
          if (goal.type === 'check') {
             ratio = (entry?.completed || value >= 1) ? 1 : 0;
          } else {
             // For number/time, calculate percentage, capped at 100% (1.0)
             ratio = Math.min(1, Math.max(0, value / target));
          }
          
          dailyScore += ratio;
        }
      });

      return {
        name: format(date, viewMode === 'month' ? 'd' : 'EEE'),
        fullDate: dateStr,
        score: dailyScore,
        total: totalGoals,
        percent: totalGoals > 0 ? (dailyScore / totalGoals) * 100 : 0
      };
    });
  }, [dateRange, goals, entries, viewMode]);

  const overallRate = useMemo(() => {
    const totalPossibleScore = chartData.reduce((acc, curr) => acc + curr.total, 0); // Total number of goals scheduled
    const totalAchievedScore = chartData.reduce((acc, curr) => acc + curr.score, 0); // Total sum of ratios
    
    return totalPossibleScore > 0 ? Math.round((totalAchievedScore / totalPossibleScore) * 100) : 0;
  }, [chartData]);


  const handlePrev = () => {
    const days = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    setReferenceDate(prev => subDays(prev, days));
  };

  const handleNext = () => {
    const days = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    setReferenceDate(prev => subDays(prev, -days));
  };

  return (
    <div className="pb-24 pt-4 px-4 space-y-6 max-w-md mx-auto">
      
      {/* Header / Controls */}
      <div className="flex items-center justify-between bg-white p-2 rounded-lg shadow-sm">
        <button onClick={handlePrev} className="p-2 hover:bg-gray-100 rounded-full"><ChevronLeft size={20} /></button>
        <div className="flex flex-col items-center">
          <span className="font-semibold text-gray-900 capitalize">{viewMode} View</span>
          <span className="text-xs text-gray-500">
            {format(dateRange[0], 'MMM d')} - {format(dateRange[dateRange.length - 1], 'MMM d')}
          </span>
        </div>
        <button onClick={handleNext} className="p-2 hover:bg-gray-100 rounded-full"><ChevronRight size={20} /></button>
      </div>

      {/* Mode Selector */}
      <div className="flex bg-gray-200 p-1 rounded-lg">
        {(['day', 'week', 'month'] as const).map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={`flex-1 py-1 text-xs font-medium rounded-md capitalize transition-all ${viewMode === m ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Summary Card */}
      <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg text-center">
        <h2 className="text-sm font-medium opacity-80 mb-1">Completion Rate</h2>
        <div className="text-5xl font-bold mb-2">{overallRate}%</div>
        <p className="text-sm opacity-80">Keep it up!</p>
      </div>

      {/* Chart */}
      <div className="bg-white p-4 rounded-xl shadow-sm h-64">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">Activity</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              cursor={{ fill: '#f3f4f6' }}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Bar dataKey="percent" radius={[4, 4, 4, 4]}>
               {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.percent >= 100 ? '#22c55e' : '#3b82f6'} />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown by Goal */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-700">By Goal</h3>
        {goals.map(goal => {
          // Calculate stats for this specific goal in the range
          let goalTotalDays = 0;
          let goalTotalScore = 0;
          
          dateRange.forEach(date => {
             if (goal.repeatDays.includes(date.getDay())) {
                goalTotalDays++;
                const entryKey = `${goal.id}_${format(date, 'yyyy-MM-dd')}`;
                const entry = entries[entryKey];
                const value = entry?.value || 0;
                const target = goal.target || 1;
                
                let ratio = 0;
                 if (goal.type === 'check') {
                   ratio = (entry?.completed || value >= 1) ? 1 : 0;
                } else {
                   ratio = Math.min(1, Math.max(0, value / target));
                }
                goalTotalScore += ratio;
             }
          });

          if (goalTotalDays === 0) return null; // Skip if not scheduled in this range

          const goalRate = Math.round((goalTotalScore / goalTotalDays) * 100);

          return (
            <div key={goal.id} className="bg-white p-3 rounded-lg shadow-sm flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-full flex items-center justify-center text-lg"
                style={{ 
                   backgroundColor: goal.tintType === 'card' ? goal.color : `${goal.color}20`,
                   color: goal.tintType === 'card' ? 'white' : 'inherit'
                }}
              >
                {goal.emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-gray-900">{goal.name}</span>
                  <span className="text-gray-500">{goalRate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all" 
                    style={{ width: `${goalRate}%`, backgroundColor: goal.color }} 
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}