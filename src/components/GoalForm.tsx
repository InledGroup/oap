import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { addGoal, updateGoal, deleteGoal, type Goal, type GoalType } from '../stores/goals';
import { t } from '../stores/i18n';
import { Trash2, Save, Calendar, Check, Clock, Hash, Palette, X, Coins } from 'lucide-react';
import { clsx } from 'clsx';
import { format } from 'date-fns';

const COLORS = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#8B5CF6', '#EC4899'];

interface GoalFormProps {
  existingGoal?: Goal;
  onClose?: () => void;
}

export default function GoalForm({ existingGoal, onClose }: GoalFormProps) {
  const dict = useStore(t);
  const [name, setName] = useState(existingGoal?.name || '');
  const [emoji, setEmoji] = useState(existingGoal?.emoji || '🎯');
  const [color, setColor] = useState(existingGoal?.color || COLORS[5]);
  const [type, setType] = useState<GoalType>(existingGoal?.type || 'check');
  const [target, setTarget] = useState<number>(existingGoal?.target || 1);
  const [rewardTokens, setRewardTokens] = useState<number>(existingGoal?.rewardTokens || 1);
  const [repeatDays, setRepeatDays] = useState<number[]>(existingGoal?.repeatDays || [0, 1, 2, 3, 4, 5, 6]);
  const [tintType, setTintType] = useState<'icon' | 'card'>(existingGoal?.tintType || 'icon');
  
  // Date Range
  const [startDate, setStartDate] = useState(existingGoal?.startDate || format(new Date(), 'yyyy-MM-dd'));
  const [isInfinite, setIsInfinite] = useState(!existingGoal?.endDate);
  const [endDate, setEndDate] = useState(existingGoal?.endDate || format(new Date(), 'yyyy-MM-dd'));

  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStart = e.target.value;
    setStartDate(newStart);
    if (!isInfinite && newStart > endDate) {
      setEndDate(newStart);
    }
  };

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
      rewardTokens,
      repeatDays,
      startDate,
      endDate: isInfinite ? undefined : endDate,
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
    }
    onClose?.();
  };

  const handleDelete = () => {
    if (existingGoal && confirm(dict.form_confirm_delete)) {
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
    <form onSubmit={handleSubmit} className="space-y-8 p-4 bg-white rounded-3xl pb-24">
      
      {/* Name and Emoji */}
      <div className="flex gap-4">
        <div className="w-20">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{dict.form_icon}</label>
          <input 
            type="text" 
            value={emoji} 
            onChange={e => setEmoji(e.target.value)}
            className="w-full h-16 text-center text-4xl border-2 border-gray-200 rounded-2xl focus:border-blue-500 outline-none bg-gray-50 focus:bg-white transition-colors"
            maxLength={2}
          />
        </div>
        <div className="flex-1">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">{dict.form_name}</label>
          <input 
            type="text" 
            required
            value={name} 
            onChange={e => setName(e.target.value)}
            placeholder={dict.form_name_placeholder}
            className="w-full h-16 px-4 border-2 border-gray-200 rounded-2xl focus:border-blue-500 text-lg font-bold outline-none bg-gray-50 focus:bg-white transition-colors placeholder:font-normal"
          />
        </div>
      </div>

      {/* Goal Type */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.form_type}</label>
        <div className="grid grid-cols-3 gap-3">
          {(['check', 'time', 'number'] as const).map((t) => {
             const icons = { check: Check, time: Clock, number: Hash };
             const labels = { check: dict.form_type_check, time: dict.form_type_time, number: dict.form_type_number };
             const Icon = icons[t];
             const isSelected = type === t;
             
             return (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={clsx(
                  "flex flex-col items-center justify-center gap-2 py-4 rounded-2xl border-2 border-b-4 transition-all active:border-b-2 active:translate-y-[2px]",
                  isSelected 
                    ? "bg-blue-50 border-blue-200 text-blue-600 shadow-sm" 
                    : "bg-white border-gray-200 text-gray-400 hover:bg-gray-50"
                )}
              >
                <Icon size={24} strokeWidth={3} />
                <span className="text-xs font-bold uppercase">{labels[t]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Target (Conditional) */}
      {type !== 'check' && (
        <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100">
          <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
            {dict.form_target} ({type === 'time' ? 'min' : '#'})
          </label>
          <div className="flex items-center gap-4">
             <button 
               type="button" 
               onClick={() => setTarget(Math.max(1, target - (type === 'time' ? 5 : 1)))}
               className="w-12 h-12 rounded-xl bg-white border-2 border-b-4 border-gray-200 flex items-center justify-center text-gray-400 font-bold text-xl active:border-b-2 active:translate-y-[2px]"
             >
               -
             </button>
             <input 
                type="number" 
                min="1"
                value={target}
                onChange={e => setTarget(Number(e.target.value))}
                className="flex-1 h-12 text-center text-2xl font-bold bg-transparent outline-none text-gray-800"
              />
              <button 
               type="button" 
               onClick={() => setTarget(target + (type === 'time' ? 5 : 1))}
               className="w-12 h-12 rounded-xl bg-white border-2 border-b-4 border-gray-200 flex items-center justify-center text-blue-500 font-bold text-xl active:border-b-2 active:translate-y-[2px]"
             >
               +
             </button>
          </div>
        </div>
      )}

      {/* Reward Tokens */}
      <div className="bg-amber-50 p-4 rounded-2xl border-2 border-amber-100">
        <label className="block text-xs font-bold text-amber-600 uppercase tracking-wide mb-2">
          {dict.form_reward_tokens}
        </label>
        <div className="flex items-center gap-4">
            <button 
              type="button" 
              onClick={() => setRewardTokens(Math.max(1, rewardTokens - 1))}
              className="w-12 h-12 rounded-xl bg-white border-2 border-b-4 border-amber-200 flex items-center justify-center text-amber-400 font-bold text-xl active:border-b-2 active:translate-y-[2px]"
            >
              -
            </button>
            <div className="flex-1 flex items-center justify-center gap-2">
              <Coins size={20} className="text-amber-500" />
              <input 
                type="number" 
                min="1"
                value={rewardTokens}
                onChange={e => setRewardTokens(Number(e.target.value))}
                className="w-16 h-12 text-center text-2xl font-bold bg-transparent outline-none text-amber-800"
              />
            </div>
            <button 
              type="button" 
              onClick={() => setRewardTokens(rewardTokens + 1)}
              className="w-12 h-12 rounded-xl bg-white border-2 border-b-4 border-amber-200 flex items-center justify-center text-amber-500 font-bold text-xl active:border-b-2 active:translate-y-[2px]"
            >
              +
            </button>
        </div>
      </div>

      {/* Repeat Days */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.form_repeat}</label>
        <div className="flex justify-between gap-1">
          {dict.days_short.map((d: string, i: number) => (
            <button
              key={i}
              type="button"
              onClick={() => toggleDay(i)}
              className={clsx(
                "w-10 h-12 rounded-xl text-sm font-bold flex items-center justify-center transition-all border-b-4 active:border-b-2 active:translate-y-[2px]",
                repeatDays.includes(i) 
                  ? "bg-blue-500 border-blue-700 text-white" 
                  : "bg-gray-100 border-gray-300 text-gray-400"
              )}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

       {/* Style (Tint) */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.form_style}</label>
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => setTintType('icon')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:translate-y-[2px]",
              tintType === 'icon' 
                ? "bg-white border-blue-200 text-blue-600 shadow-sm" 
                : "bg-gray-50 border-gray-200 text-gray-400"
            )}
          >
            {dict.form_style_icon}
          </button>
          <button
            type="button"
            onClick={() => setTintType('card')}
            className={clsx(
              "flex-1 py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:translate-y-[2px]",
              tintType === 'card' 
                ? "bg-blue-500 border-blue-700 text-white shadow-sm" 
                : "bg-gray-50 border-gray-200 text-gray-400"
            )}
          >
            {dict.form_style_card}
          </button>
        </div>
      </div>

      {/* Color Picker */}
      <div>
        <label className="block text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{dict.form_color}</label>
        <div className="flex flex-wrap gap-3">
          {COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={clsx(
                "w-10 h-10 rounded-xl transition-transform border-2",
                color === c ? "scale-110 border-gray-900 shadow-lg" : "border-transparent opacity-80 hover:opacity-100"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* Date Range (Simplified/Chunky) */}
      <div className="bg-gray-50 p-4 rounded-2xl border-2 border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{dict.form_start_date}</label>
             <input 
                type="date" 
                required
                value={startDate}
                onChange={handleStartDateChange}
                className="bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500"
             />
          </div>
          
          <div className="flex items-center justify-between">
             <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">{dict.form_end_date}</label>
             <div className="flex items-center gap-2">
               <input 
                  type="date" 
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  disabled={isInfinite}
                  className={clsx(
                    "bg-white border-2 border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:border-blue-500 transition-opacity",
                    isInfinite && "opacity-30 pointer-events-none"
                  )}
               />
               <button 
                  type="button"
                  onClick={() => setIsInfinite(!isInfinite)}
                  className={clsx(
                     "px-3 py-2 rounded-xl text-xs font-bold border-2 border-b-4 transition-all active:border-b-2 active:translate-y-[2px]",
                     isInfinite ? "bg-blue-500 border-blue-700 text-white" : "bg-white border-gray-200 text-gray-400"
                  )}
               >
                  ∞
               </button>
             </div>
          </div>
      </div>

      {/* Actions */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t-2 border-gray-100 flex gap-4 safe-area-bottom z-[110] max-w-md mx-auto">
        {existingGoal && (
          <button 
            type="button" 
            onClick={handleDelete}
            className="w-16 h-14 bg-red-100 text-red-500 rounded-2xl flex items-center justify-center border-b-4 border-red-200 hover:bg-red-200 active:border-b-0 active:translate-y-[4px] transition-all"
          >
            <Trash2 size={24} />
          </button>
        )}
        <button 
          type="submit"
          className="flex-1 bg-green-500 text-white h-14 rounded-2xl font-extrabold text-lg shadow-lg border-b-4 border-green-700 active:border-b-0 active:translate-y-[4px] hover:bg-green-600 transition-all flex items-center justify-center gap-2"
        >
          <Save size={24} />
          {dict.form_save}
        </button>
      </div>
    </form>
  );
}