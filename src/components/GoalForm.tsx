import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { addGoal, updateGoal, deleteGoal, type Goal, type GoalType } from '../stores/goals';
import { Trash2, Save } from 'lucide-react';
import { clsx } from 'clsx';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6', '#8b5cf6', '#ec4899'];

interface GoalFormProps {
  existingGoal?: Goal;
  onClose?: () => void;
}

export default function GoalForm({ existingGoal, onClose }: GoalFormProps) {
  const [name, setName] = useState(existingGoal?.name || '');
  const [emoji, setEmoji] = useState(existingGoal?.emoji || '🎯');
  const [color, setColor] = useState(existingGoal?.color || COLORS[5]);
  const [type, setType] = useState<GoalType>(existingGoal?.type || 'check');
  const [target, setTarget] = useState<number>(existingGoal?.target || 1);
  const [repeatDays, setRepeatDays] = useState<number[]>(existingGoal?.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
  const [tintType, setTintType] = useState<'icon' | 'card'>(existingGoal?.tintType || 'icon');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const goalData: Goal = {
      id: existingGoal?.id || crypto.randomUUID(),
      name,
      emoji,
      color,
      type,
      tintType,
      target: type === 'check' ? 1 : target,
      repeatDays,
      createdAt: existingGoal?.createdAt || Date.now(),
    };

    if (existingGoal) {
      updateGoal(goalData);
    } else {
      addGoal(goalData);
    }
    
    // Reset form or close
    if (!existingGoal) {
      setName('');
      setEmoji('🎯');
      // optional: keep other settings
    }
    onClose?.();
  };

  const handleDelete = () => {
    if (existingGoal && confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(existingGoal.id);
      onClose?.();
    }
  };

  const toggleDay = (dayIndex: number) => {
    setRepeatDays(prev => 
      prev.includes(dayIndex) 
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-lg shadow-sm">
      
      {/* Name and Emoji */}
      <div className="flex gap-4">
        <div className="w-16">
          <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
          <input 
            type="text" 
            value={emoji} 
            onChange={e => setEmoji(e.target.value)}
            className="w-full text-center text-2xl border-b-2 border-gray-300 focus:border-blue-500 bg-transparent py-2"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
          <input 
            type="text" 
            required
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Read 30 mins"
            className="w-full border-b-2 border-gray-300 focus:border-blue-500 bg-transparent py-2 text-lg"
          />
        </div>
      </div>

      {/* Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Goal Type</label>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          {(['check', 'time', 'number'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={clsx(
                "flex-1 py-2 text-sm font-medium rounded-md capitalize transition-all",
                type === t ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
              )}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Target (Conditional) */}
      {type !== 'check' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Target ({type === 'time' ? 'minutes' : 'count'})
          </label>
          <input 
            type="number" 
            min="1"
            value={target}
            onChange={e => setTarget(Number(e.target.value))}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
      )}

      {/* Repeat Days */}
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
                repeatDays.includes(i) 
                  ? "bg-blue-600 text-white" 
                  : "bg-gray-100 text-gray-400"
              )}
            >
              {d.charAt(0)}
            </button>
          ))}
        </div>
      </div>

      {/* Card Style */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Card Style</label>
        <div className="flex bg-gray-100 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => setTintType('icon')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              tintType === 'icon' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Icon Tint
          </button>
          <button
            type="button"
            onClick={() => setTintType('card')}
            className={clsx(
              "flex-1 py-2 text-sm font-medium rounded-md transition-all",
              tintType === 'card' ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"
            )}
          >
            Full Card
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
        <div className="flex gap-3 overflow-x-auto py-2">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={clsx(
                "w-8 h-8 rounded-full flex-shrink-0 border-2",
                color === c ? "border-gray-900 scale-110" : "border-transparent"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-4">
        {existingGoal && (
          <button 
            type="button" 
            onClick={handleDelete}
            className="p-3 text-red-500 bg-red-50 rounded-lg hover:bg-red-100"
          >
            <Trash2 size={20} />
          </button>
        )}
        <button 
          type="submit"
          className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold shadow-lg shadow-blue-200 active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <Save size={20} />
          Save Goal
        </button>
      </div>
    </form>
  );
}