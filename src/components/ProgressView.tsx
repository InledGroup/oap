import React, { useState, useMemo } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore, entriesStore, type Goal, getStreak, useStreakFreezer, usedFreezersStore } from '../stores/goals';
import { userStatsStore } from '../stores/appState';
import { t, dateLocale } from '../stores/i18n';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, startOfMonth, endOfMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Trophy, Flame, Coins, Snowflake } from 'lucide-react';
import { clsx } from 'clsx';

type ViewMode = 'day' | 'week' | 'month';

export default function ProgressView() {
  const goals = useStore(goalsStore);
  const entries = useStore(entriesStore);
  const userStats = useStore(userStatsStore);
  const usedFreezers = useStore(usedFreezersStore);
  const dict = useStore(t);
  const locale = useStore(dateLocale);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [referenceDate, setReferenceDate] = useState(new Date());

  const currentStreak = useMemo(() => getStreak(), [goals, entries, usedFreezers]);
  const todayStr = format(new Date(), 'yyyy-MM-dd');
  const isFreezerUsedToday = !!usedFreezers[todayStr];

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
      let dailyScore = 0; 

      goals.forEach(goal => {
        if (dateStr.localeCompare(goal.startDate) < 0) return;
        if (goal.endDate && dateStr.localeCompare(goal.endDate) > 0) return;

        if (goal.repeatDays.includes(date.getDay())) {
          totalGoals++;
          const entryKey = `${goal.id}_${dateStr}`;
          const entry = entries[entryKey];
          const value = entry?.value || 0;
          const target = goal.target || 1;

          let ratio = 0;
          if (goal.type === 'check') {
             ratio = (entry?.completed || value >= 1) ? 1 : 0;
          } else {
             ratio = Math.min(1, Math.max(0, value / target));
          }

          dailyScore += ratio;
        }
      });

      return {
        name: format(date, viewMode === 'month' ? 'd' : 'EEE', { locale }),
        fullDate: dateStr,
        score: dailyScore,
        total: totalGoals,
        percent: totalGoals > 0 ? Math.round((dailyScore / totalGoals) * 100) : 0
      };
    });
  }, [dateRange, goals, entries, viewMode, locale]);


  const overallRate = useMemo(() => {
    const totalPossibleScore = chartData.reduce((acc, curr) => acc + curr.total, 0); 
    const totalAchievedScore = chartData.reduce((acc, curr) => acc + curr.score, 0); 

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

  const handleUseFreezer = () => {
    if (useStreakFreezer(todayStr)) {
      alert(dict.shop_freezer_used);
    }
  };

  return (
    <div className="pb-28 pt-6 px-4 space-y-6 max-w-md mx-auto min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">{dict.progress_title}</h1>

      {/* Gamification Stats Bar */}
      <div className="flex gap-3 mb-6">
        <div className="flex-1 bg-amber-50 border-2 border-amber-200 border-b-4 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-400 rounded-xl flex items-center justify-center text-white shadow-lg border-b-4 border-amber-600">
            <Coins size={24} strokeWidth={3} />
          </div>
          <div>
            <p className="text-[10px] text-amber-800 font-bold uppercase tracking-wider">{dict.shop_tokens}</p>
            <p className="text-xl font-black text-amber-900 leading-none">{userStats.tokens}</p>
          </div>
        </div>
        <div className="flex-1 bg-orange-50 border-2 border-orange-200 border-b-4 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-400 rounded-xl flex items-center justify-center text-white shadow-lg border-b-4 border-orange-600">
            <Flame size={24} strokeWidth={3} fill="currentColor" />
          </div>
          <div>
            <p className="text-[10px] text-orange-800 font-bold uppercase tracking-wider">{dict.daily_streak}</p>
            <p className="text-xl font-black text-orange-900 leading-none">{currentStreak} {dict.daily_days}</p>
          </div>
        </div>
      </div>

      {/* Streak Freezer Alert/Action */}
      {userStats.streakFreezers > 0 && !isFreezerUsedToday && (
         <div className="bg-blue-50 border-2 border-blue-200 border-b-4 rounded-3xl p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-500">
                  <Snowflake size={24} strokeWidth={3} />
               </div>
               <div>
                  <p className="text-sm font-black text-blue-800">{dict.shop_freezers} ({userStats.streakFreezers})</p>
                  <p className="text-xs font-bold text-blue-600 opacity-80">Protege tu racha para hoy</p>
               </div>
            </div>
            <button 
               onClick={handleUseFreezer}
               className="w-full bg-blue-500 text-white py-3 rounded-xl font-bold border-b-4 border-blue-700 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
            >
               <Snowflake size={18} />
               {dict.shop_use_freezer}
            </button>
         </div>
      )}

      {isFreezerUsedToday && (
         <div className="bg-emerald-50 border-2 border-emerald-100 border-b-4 rounded-3xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-500">
               <Snowflake size={28} strokeWidth={3} />
            </div>
            <p className="font-bold text-emerald-800">{dict.shop_freezer_used}</p>
         </div>
      )}

      {/* Header / Controls - Chunky Style */}
      <div className="flex items-center justify-between bg-white border-2 border-gray-200 border-b-4 rounded-2xl p-2">
        <button 
           onClick={handlePrev} 
           className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
        >
           <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-extrabold text-gray-700 uppercase tracking-wide text-sm">
             {viewMode === 'day' ? dict.progress_day : viewMode === 'week' ? dict.progress_week : dict.progress_month}
          </span>
          <span className="text-xs font-bold text-gray-400 capitalize">
            {format(dateRange[0], 'MMM d', { locale })} - {format(dateRange[dateRange.length - 1], 'MMM d', { locale })}
          </span>
        </div>
        <button 
           onClick={handleNext} 
           className="w-10 h-10 flex items-center justify-center text-gray-400 hover:bg-gray-100 rounded-xl transition-colors active:scale-95"
        >
           <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>

      {/* Mode Selector - Chunky Segmented */}
      <div className="flex bg-gray-100 p-1.5 rounded-2xl border-2 border-transparent">
        {(['day', 'week', 'month'] as const).map(m => (
          <button
            key={m}
            onClick={() => setViewMode(m)}
            className={clsx(
               "flex-1 py-2 text-sm font-bold rounded-xl capitalize transition-all border-b-4 active:border-b-0 active:translate-y-[4px]",
               viewMode === m 
                  ? "bg-white text-blue-600 shadow-sm border-gray-200" 
                  : "bg-transparent text-gray-400 border-transparent hover:bg-gray-200/50"
            )}
          >
            {m === 'day' ? dict.progress_day : m === 'week' ? dict.progress_week : dict.progress_month}
          </button>
        ))}
      </div>

      {/* Summary Card - Hero Style */}
      <div className="relative overflow-hidden bg-yellow-400 rounded-3xl p-6 text-yellow-900 border-b-[6px] border-yellow-600 shadow-xl">
         <div className="relative z-10 flex flex-col items-center text-center">
             <div className="w-16 h-16 bg-white/30 rounded-full flex items-center justify-center mb-3 backdrop-blur-sm">
                <Trophy size={32} fill="currentColor" className="text-yellow-800" />
             </div>
             <h2 className="text-sm font-bold uppercase tracking-widest opacity-80 mb-1">{dict.progress_completion}</h2>
             <div className="text-6xl font-black tracking-tighter drop-shadow-sm">{overallRate}%</div>
             <p className="font-bold opacity-80 mt-2">{dict.progress_keep_up}</p>
         </div>
         {/* Decorative blob */}
         <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-300/50 rounded-full blur-2xl"></div>
         <div className="absolute bottom-0 left-0 -ml-8 -mb-8 w-32 h-32 bg-yellow-500/30 rounded-full blur-2xl"></div>
      </div>

      {/* Chart - Container Style */}
      <div className="bg-white p-5 rounded-3xl border-2 border-gray-200 border-b-4 h-72">
        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider mb-6 flex items-center gap-2">
           <Flame size={16} className="text-orange-500" fill="currentColor" />
           {dict.progress_activity}
        </h3>
        <ResponsiveContainer width="100%" height="80%">
          <BarChart data={chartData}>
            <XAxis 
               dataKey="name" 
               fontSize={12} 
               tickLine={false} 
               axisLine={false} 
               tick={{ fill: '#9CA3AF', fontWeight: 'bold' }} 
               dy={10}
            />
            <YAxis domain={[0, 100]} hide />
            <Tooltip 
              cursor={{ fill: '#F3F4F6', radius: 8 }}
              contentStyle={{ 
                 borderRadius: '16px', 
                 border: '2px solid #E5E7EB', 
                 boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                 fontWeight: 'bold',
                 color: '#374151'
              }}
            />
            <Bar dataKey="percent" radius={[6, 6, 6, 6]}>
               {chartData.map((entry, index) => (
                  <Cell 
                     key={`cell-${index}`} 
                     fill={entry.percent >= 100 ? '#22C55E' : '#3B82F6'} 
                  />
                ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Breakdown by Goal */}
      <div className="space-y-4">
        <h3 className="text-sm font-extrabold text-gray-400 uppercase tracking-wider pl-2">{dict.progress_by_goal}</h3>
        {goals.map(goal => {
          let goalTotalDays = 0;
          let goalTotalScore = 0;

          dateRange.forEach(date => {
             const dateStr = format(date, 'yyyy-MM-dd');
             if (dateStr.localeCompare(goal.startDate) < 0) return;
             if (goal.endDate && dateStr.localeCompare(goal.endDate) > 0) return;

             if (goal.repeatDays.includes(date.getDay())) {
                goalTotalDays++;
                const entryKey = `${goal.id}_${dateStr}`;
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

          if (goalTotalDays === 0) return null; 

          const goalRate = Math.round((goalTotalScore / goalTotalDays) * 100);

          return (
            <div key={goal.id} className="bg-white p-4 rounded-2xl border-2 border-gray-100 border-b-4 flex items-center gap-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 border-black/5"
                style={{ 
                   backgroundColor: goal.tintType === 'card' ? goal.color : `${goal.color}20`,
                   color: goal.tintType === 'card' ? 'white' : 'inherit'
                }}
              >
                {goal.emoji}
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-base mb-2 font-bold">
                  <span className="text-gray-800">{goal.name}</span>
                  <span className={clsx(
                     goalRate === 100 ? "text-green-500" : "text-gray-400"
                  )}>{goalRate}%</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-100">
                  <div 
                    className="h-full rounded-full transition-all duration-500" 
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