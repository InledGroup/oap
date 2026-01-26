import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore, type Goal } from '../stores/goals';
import GoalForm from './GoalForm';
import RemindersList from './RemindersList';
import { Plus, X, Edit2 } from 'lucide-react';

export default function ConfigView() {
  const goals = useStore(goalsStore);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'reminders'>('goals');

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal);
    setIsFormOpen(true);
  };

  const handleAddNew = () => {
    setEditingGoal(undefined);
    setIsFormOpen(true);
  };

  const handleClose = () => {
    setIsFormOpen(false);
    setEditingGoal(undefined);
  };

  if (isFormOpen) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 pb-24">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            {editingGoal ? 'Edit Goal' : 'New Goal'}
          </h1>
          <button 
            onClick={handleClose}
            className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-100"
          >
            <X size={24} />
          </button>
        </div>
        <GoalForm existingGoal={editingGoal} onClose={handleClose} />
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 px-2">Settings</h1>
      
      {/* Tabs */}
      <div className="flex bg-gray-200 p-1 rounded-xl mb-6">
        <button
          onClick={() => setActiveTab('goals')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'goals' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          Goals
        </button>
        <button
          onClick={() => setActiveTab('reminders')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${activeTab === 'reminders' ? 'bg-white shadow text-gray-900' : 'text-gray-500'}`}
        >
          Reminders
        </button>
      </div>
      
      {activeTab === 'goals' && (
        <>
          <div className="space-y-3">
            {goals.map(goal => (
              <div 
                key={goal.id}
                onClick={() => handleEdit(goal)}
                className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4 active:scale-[0.99] transition-transform cursor-pointer"
              >
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: `${goal.color}20` }}
                >
                  {goal.emoji}
                </div>
                
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">{goal.name}</h3>
                  <div className="flex gap-1 mt-1">
                     {['S','M','T','W','T','F','S'].map((d, i) => (
                        <span key={i} className={`text-[10px] w-4 h-4 rounded-full flex items-center justify-center ${goal.repeatDays.includes(i) ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-300'}`}>
                          {d}
                        </span>
                     ))}
                  </div>
                </div>

                <Edit2 size={16} className="text-gray-400" />
              </div>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <p>No goals yet. Create one!</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddNew}
            className="fixed bottom-24 right-6 w-14 h-14 bg-blue-600 rounded-full text-white shadow-lg shadow-blue-300 flex items-center justify-center hover:bg-blue-700 active:scale-90 transition-all z-40"
          >
            <Plus size={28} />
          </button>
        </>
      )}

      {activeTab === 'reminders' && (
        <>
          <RemindersList />
          <div className="mt-8 text-center text-xs text-gray-400 pb-4">
             Notification sound from <a href="https://notificationsounds.com" target="_blank" rel="noopener noreferrer" className="underline hover:text-gray-500">notificationsounds.com</a>
          </div>
        </>
      )}

    </div>
  );
}