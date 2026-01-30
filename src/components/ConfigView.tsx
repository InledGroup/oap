import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { goalsStore, entriesStore, type Goal, type Entry } from '../stores/goals';
import { remindersStore, type Reminder } from '../stores/reminders';
import { t } from '../stores/i18n';
import GoalForm from './GoalForm';
import RemindersList from './RemindersList';
import LanguageSelector from './LanguageSelector';
import { Plus, X, Edit2, Settings, Bell, ChevronRight, Database, Download, Upload, Trash2, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';

export default function ConfigView() {
  const goals = useStore(goalsStore);
  const dict = useStore(t);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'goals' | 'reminders' | 'data'>('goals');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');

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

  const handleExport = () => {
    const data = {
      goals: goalsStore.get(),
      entries: entriesStore.get(),
      reminders: remindersStore.get(),
      version: 1,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `oap-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        
        // Basic validation
        if (!json.goals || !json.entries) {
          throw new Error('Invalid format');
        }

        if (confirm(dict.config_import_confirm)) {
          goalsStore.set(json.goals);
          entriesStore.set(json.entries);
          if (json.reminders) remindersStore.set(json.reminders);
          setImportStatus('success');
          setTimeout(() => setImportStatus('idle'), 3000);
          alert(dict.config_restore_success);
        }
      } catch (err) {
        console.error(err);
        setImportStatus('error');
        alert(dict.config_import_error);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleReset = () => {
    if (confirm(dict.config_reset_confirm_1)) {
      if (confirm(dict.config_reset_confirm_2)) {
        goalsStore.set([]);
        entriesStore.set({});
        remindersStore.set([]);
        alert(dict.config_reset_done);
      }
    }
  };

  if (isFormOpen) {
    return (
      <div className="fixed inset-0 bg-gray-50 z-[100] overflow-y-auto animate-in slide-in-from-bottom-5">
        <div className="p-4 pb-32">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-extrabold text-gray-800 tracking-tight">
              {editingGoal ? dict.form_edit_title : dict.form_new_title}
            </h1>
            <button 
              onClick={handleClose}
              className="w-10 h-10 bg-white border-2 border-gray-200 border-b-4 rounded-xl flex items-center justify-center text-gray-400 hover:text-red-500 hover:border-red-200 active:border-b-2 active:translate-y-[2px] transition-all"
            >
              <X size={24} strokeWidth={3} />
            </button>
          </div>
          <GoalForm existingGoal={editingGoal} onClose={handleClose} />
        </div>
      </div>
    );
  }

  return (
    <div className="pb-28 pt-6 px-4 max-w-md mx-auto min-h-screen bg-white">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 tracking-tight">{dict.nav_config}</h1>
        <LanguageSelector />
      </div>
      
      {/* Chunky Tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
        <button
          onClick={() => setActiveTab('goals')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:translate-y-[2px] flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'goals' 
              ? "bg-blue-500 border-blue-700 text-white shadow-blue-200" 
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          )}
        >
          <Settings size={18} strokeWidth={3} />
          {dict.config_tab_goals}
        </button>
        {/* <button
          onClick={() => setActiveTab('reminders')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:translate-y-[2px] flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'reminders' 
              ? "bg-amber-500 border-amber-700 text-white shadow-amber-200" 
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          )}
        > 
          <Bell size={18} strokeWidth={3} />
          {dict.config_tab_reminders}
        </button> */}
        <button
          onClick={() => setActiveTab('data')}
          className={clsx(
            "flex-1 py-3 px-4 rounded-xl border-2 border-b-4 font-bold text-sm transition-all active:border-b-2 active:translate-y-[2px] flex items-center justify-center gap-2 whitespace-nowrap",
            activeTab === 'data' 
              ? "bg-purple-500 border-purple-700 text-white shadow-purple-200" 
              : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
          )}
        >
          <Database size={18} strokeWidth={3} />
          {dict.config_tab_data}
        </button>
      </div>
      
      {activeTab === 'goals' && (
        <>
          <div className="space-y-4">
            {goals.map(goal => (
              <div 
                key={goal.id}
                onClick={() => handleEdit(goal)}
                className="group relative bg-white p-4 rounded-2xl border-2 border-gray-200 border-b-4 hover:border-blue-300 transition-all active:border-b-2 active:translate-y-[2px] cursor-pointer"
              >
                <div className="flex items-center gap-4">
                   <div 
                     className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border-2 border-gray-100"
                     style={{ backgroundColor: `${goal.color}15` }}
                   >
                     {goal.emoji}
                   </div>
                   
                   <div className="flex-1 min-w-0">
                     <h3 className="font-bold text-gray-800 text-lg truncate">{goal.name}</h3>
                     <div className="flex gap-1 mt-2">
                        {dict.days_short.map((d, i) => (
                           <span key={i} className={clsx(
                             "text-[10px] w-5 h-5 rounded flex items-center justify-center font-bold",
                             goal.repeatDays.includes(i) ? "bg-gray-800 text-white" : "bg-gray-100 text-gray-300"
                           )}>
                             {d}
                           </span>
                        ))}
                     </div>
                   </div>

                   <div className="w-8 h-8 rounded-lg bg-gray-50 text-gray-300 flex items-center justify-center group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      <ChevronRight size={20} strokeWidth={3} />
                   </div>
                </div>
              </div>
            ))}

            {goals.length === 0 && (
              <div className="text-center py-12 px-8 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold text-lg mb-2">{dict.config_empty_goals}</p>
                <p className="text-gray-400 text-sm">{dict.config_empty_desc}</p>
              </div>
            )}
          </div>

          <button
            onClick={handleAddNew}
            className="fixed bottom-24 right-6 w-16 h-16 bg-blue-500 rounded-2xl text-white shadow-xl flex items-center justify-center border-b-4 border-blue-700 active:border-b-0 active:translate-y-[4px] hover:bg-blue-600 transition-all z-40"
          >
            <Plus size={32} strokeWidth={4} />
          </button>
        </>
      )}

      {activeTab === 'reminders' && (
        <div className="bg-white rounded-2xl border-2 border-gray-200 border-b-4 p-4">
          <RemindersList />
          <div className="mt-8 text-center text-xs text-gray-400 font-medium pb-2 border-t pt-4 border-gray-100">
             Sonidos de notificación de <a href="https://notificationsounds.com" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-500 hover:underline">notificationsounds.com</a>
          </div>
        </div>
      )}

      {activeTab === 'data' && (
         <div className="space-y-6">
            <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
               <h3 className="font-extrabold text-blue-900 text-lg mb-2 flex items-center gap-2">
                  <Download size={24} />
                  {dict.config_backup}
               </h3>
               <p className="text-blue-700/80 text-sm mb-6 font-medium">
                  {dict.config_backup_desc}
               </p>
               <button 
                  onClick={handleExport}
                  className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold shadow-lg border-b-4 border-blue-800 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2"
               >
                  {dict.config_export}
               </button>
            </div>

            <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 border-b-4">
               <h3 className="font-extrabold text-gray-800 text-lg mb-2 flex items-center gap-2">
                  <Upload size={24} />
                  {dict.config_restore}
               </h3>
               <p className="text-gray-500 text-sm mb-6 font-medium">
                  {dict.config_restore_desc}
               </p>
               <label className="w-full bg-gray-100 text-gray-600 py-4 rounded-2xl font-bold border-b-4 border-gray-300 active:border-b-0 active:translate-y-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer hover:bg-gray-200">
                  <span>{dict.config_select_file}</span>
                  <input 
                    type="file" 
                    accept=".json" 
                    onChange={handleImport} 
                    className="hidden" 
                  />
               </label>
               {importStatus === 'success' && <p className="text-green-500 text-center font-bold mt-4">{dict.config_restore_success}</p>}
               {importStatus === 'error' && <p className="text-red-500 text-center font-bold mt-4">{dict.config_restore_error}</p>}
            </div>

            <div className="bg-red-50 p-6 rounded-3xl border-2 border-red-100 mt-8">
               <h3 className="font-extrabold text-red-900 text-lg mb-2 flex items-center gap-2">
                  <AlertTriangle size={24} />
                  {dict.config_danger}
               </h3>
               <button 
                  onClick={handleReset}
                  className="w-full bg-white text-red-500 py-4 rounded-2xl font-bold border-2 border-red-100 border-b-4 hover:bg-red-50 active:border-b-2 active:translate-y-[2px] transition-all flex items-center justify-center gap-2"
               >
                  <Trash2 size={20} />
                  {dict.config_reset}
               </button>
            </div>
         </div>
      )}

    </div>
  );
}