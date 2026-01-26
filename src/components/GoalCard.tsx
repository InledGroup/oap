import React, { useState, useEffect } from 'react';
import { useStore } from '@nanostores/react';
import { type Goal, setEntry, getEntry, entriesStore } from '../stores/goals';
import { Check, Plus, Minus } from 'lucide-react';
import { clsx } from 'clsx';

interface GoalCardProps {
  goal: Goal;
  dateStr: string; // YYYY-MM-DD
}

export default function GoalCard({ goal, dateStr }: GoalCardProps) {
  // Subscribe to entries store to react to changes
  const entries = useStore(entriesStore);
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

  return (
    <div 
      className={clsx(
        "rounded-xl shadow-sm border overflow-hidden mb-3 transition-colors",
        isCardTint ? "border-transparent" : "bg-white border-gray-100"
      )}
      style={isCardTint ? { backgroundColor: goal.color } : {}}
    >
      <div className="p-4 flex items-center gap-4">
        
        {/* Icon & Color Indicator */}
        <div 
          className="w-12 h-12 rounded-full flex items-center justify-center text-2xl flex-shrink-0"
          style={{ 
            backgroundColor: isCardTint ? 'rgba(255,255,255,0.2)' : `${goal.color}20`,
            color: isCardTint ? '#fff' : 'inherit'
          }}
        >
          {goal.emoji}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={clsx("font-semibold truncate", isCardTint ? "text-white" : "text-gray-900")}>
            {goal.name}
          </h3>
          <p className={clsx("text-xs", isCardTint ? "text-white/80" : "text-gray-500")}>
            {goal.type === 'check' 
              ? (entry.completed ? 'Completed' : 'Tap to complete')
              : `${entry.value} / ${goal.target} ${goal.type === 'time' ? 'mins' : ''}`
            }
          </p>
        </div>

        {/* Action / Status */}
        <div className="flex items-center gap-2">
          {goal.type === 'check' ? (
            <button
              onClick={handleCheck}
              className={clsx(
                "w-10 h-10 rounded-full flex items-center justify-center transition-all border-2",
                isCardTint 
                  ? (entry.completed ? "bg-white border-white text-gray-900" : "border-white/40 text-white hover:border-white")
                  : (entry.completed ? "bg-green-500 border-green-500 text-white" : "border-gray-200 text-gray-300 hover:border-gray-300")
              )}
              style={!isCardTint && entry.completed ? { backgroundColor: goal.color, borderColor: goal.color } : {}}
            >
              <Check size={20} />
            </button>
          ) : (
             <div className="flex items-center gap-2">
                <button 
                   onClick={() => handleIncrement(-1 * (goal.type === 'time' ? 5 : 1))}
                   className={clsx(
                     "w-8 h-8 rounded-full flex items-center justify-center active:bg-opacity-80",
                     isCardTint ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                   )}
                >
                  <Minus size={16} />
                </button>
                 <button 
                   onClick={() => handleIncrement(goal.type === 'time' ? 5 : 1)}
                   className={clsx(
                     "w-8 h-8 rounded-full flex items-center justify-center active:bg-opacity-80",
                     isCardTint ? "bg-white/20 text-white hover:bg-white/30" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                   )}
                >
                  <Plus size={16} />
                </button>
             </div>
          )}
        </div>
      </div>

      {/* Progress Bar (for non-check types) */}
      {goal.type !== 'check' && (
        <div className={clsx("h-1 w-full", isCardTint ? "bg-black/10" : "bg-gray-100")}>
          <div 
            className="h-full transition-all duration-500 ease-out"
            style={{ 
              width: `${percent}%`,
              backgroundColor: isCardTint ? 'rgba(255,255,255,0.8)' : goal.color 
            }}
          />
        </div>
      )}
      {/* Visual cue for check completion */}
      {goal.type === 'check' && entry.completed && !isCardTint && (
           <div className="h-1 w-full" style={{ backgroundColor: goal.color }} />
      )}
      {goal.type === 'check' && entry.completed && isCardTint && (
           <div className="h-1 w-full bg-white/50" />
      )}
    </div>
  );
}