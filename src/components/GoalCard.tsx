import React from 'react';
import { useStore } from '@nanostores/react';
import { type Goal, setEntry, entriesStore } from '../stores/goals';
import { t } from '../stores/i18n';
import { Check, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface GoalCardProps {
  goal: Goal;
  dateStr: string;
}

export default function GoalCard({ goal, dateStr }: GoalCardProps) {
  const entries = useStore(entriesStore);
  const dict = useStore(t);
  const entryKey = `${goal.id}_${dateStr}`;
  const entry = entries[entryKey] || { value: 0, completed: false };

  const handleCheck = () => {
    const newValue = entry.completed ? 0 : 1;
    setEntry(goal.id, dateStr, newValue, 1);
  };

  const handleIncrement = (amount: number) => {
    const newValue = Math.max(0, (entry.value || 0) + amount);
    setEntry(goal.id, dateStr, newValue, goal.target || 1);
  };

  const percent = Math.min(100, Math.round((entry.value / (goal.target || 1)) * 100));
  const isCardTint = goal.tintType === 'card';

  // Helper styles for the "3D" button effect
  const cardBaseStyle = "relative transition-all duration-200 active:scale-[0.98] active:translate-y-[2px]";
  const cardBorderStyle = isCardTint 
    ? "border-transparent shadow-[0_4px_0_rgba(0,0,0,0.2)] active:shadow-none"
    : "border-2 border-gray-200 shadow-[0_4px_0_#E5E7EB] active:shadow-none active:border-t-2";

  return (
    <div 
      className={clsx(
        "rounded-2xl mb-4 overflow-hidden",
        cardBaseStyle,
        cardBorderStyle,
        isCardTint ? "text-white" : "bg-white text-gray-900"
      )}
      style={isCardTint ? { backgroundColor: goal.color } : {}}
    >
      <div className="p-5 flex items-center gap-4">
        
        {/* Icon */}
        <div 
          className={clsx(
            "w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 font-emoji",
            isCardTint ? "bg-white/20" : "bg-gray-50 border-2 border-gray-100"
          )}
        >
          {goal.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg leading-tight truncate">
            {goal.name}
          </h3>
          <p className={clsx("text-sm font-medium mt-1", isCardTint ? "text-white/90" : "text-gray-400")}>
            {goal.type === 'check' 
              ? (entry.completed ? dict.daily_completed : dict.daily_tap)
              : `${entry.value} / ${goal.target} ${goal.type === 'time' ? 'min' : ''}`
            }
          </p>
          
          {/* Progress Bar (Inline for non-check) */}
          {goal.type !== 'check' && (
            <div className={clsx("h-3 w-full rounded-full mt-3 overflow-hidden", isCardTint ? "bg-black/20" : "bg-gray-100")}>
               <div 
                 className="h-full rounded-full transition-all duration-500 ease-out"
                 style={{ 
                   width: `${percent}%`,
                   backgroundColor: isCardTint ? 'rgba(255,255,255,0.9)' : goal.color 
                 }}
               />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pl-2">
          {goal.type === 'check' ? (
            <button
              onClick={handleCheck}
              className={clsx(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-all border-b-4 active:border-b-0 active:translate-y-[4px]",
                isCardTint 
                  ? (entry.completed ? "bg-white text-blue-600 border-blue-900/20" : "bg-white/20 border-black/20 text-white hover:bg-white/30")
                  : (entry.completed ? "bg-green-500 border-green-700 text-white" : "bg-gray-100 border-gray-300 text-gray-400 hover:bg-gray-200")
              )}
            >
              <Check size={28} strokeWidth={3} />
            </button>
          ) : (
             <div className="flex flex-col gap-2">
                <button 
                   onClick={() => handleIncrement(goal.type === 'time' ? 5 : 1)}
                   className={clsx(
                     "w-10 h-8 rounded-lg flex items-center justify-center active:translate-y-[2px] transition-all border-b-2",
                     isCardTint 
                        ? "bg-white/20 border-black/20 text-white hover:bg-white/30 active:border-b-0" 
                        : "bg-blue-100 border-blue-200 text-blue-600 hover:bg-blue-200 active:border-b-0"
                   )}
                >
                  <Plus size={18} strokeWidth={3} />
                </button>
                 <button 
                   onClick={() => handleIncrement(-1 * (goal.type === 'time' ? 5 : 1))}
                   className={clsx(
                     "w-10 h-8 rounded-lg flex items-center justify-center active:translate-y-[2px] transition-all border-b-2",
                     isCardTint 
                        ? "bg-black/10 border-black/20 text-white/70 hover:bg-black/20 active:border-b-0" 
                        : "bg-gray-100 border-gray-200 text-gray-400 hover:bg-gray-200 active:border-b-0"
                   )}
                >
                  <Minus size={18} strokeWidth={3} />
                </button>
             </div>
          )}
        </div>
      </div>
      
      {/* Check Completion visual cue (Bottom strip) */}
      {goal.type === 'check' && entry.completed && (
           <div className={clsx("h-1.5 w-full", isCardTint ? "bg-white/50" : "bg-green-500")} />
      )}
    </div>
  );
}