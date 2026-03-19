import React from 'react';
import { useStore } from '@nanostores/react';
import { buyStreakFreezer } from '../stores/goals';
import { userStatsStore, settingsStore } from '../stores/appState';
import { t } from '../stores/i18n';
import { Coins, Snowflake } from 'lucide-react';
import { clsx } from 'clsx';

export default function ShopView() {
  const dict = useStore(t);
  const userStats = useStore(userStatsStore);
  const settings = useStore(settingsStore);

  const handleBuy = () => {
    if (buyStreakFreezer()) {
      alert(dict.shop_success);
    } else {
      alert(dict.shop_insufficient);
    }
  };

  return (
    <div className="pb-28 pt-6 px-4 space-y-6 max-w-md mx-auto min-h-screen bg-white">
      <h1 className="text-3xl font-extrabold text-gray-800 mb-8 tracking-tight">{dict.shop_title}</h1>

      <div className="bg-amber-50 p-6 rounded-3xl border-2 border-amber-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-amber-400 rounded-2xl flex items-center justify-center text-white shadow-lg border-b-4 border-amber-600">
            <Coins size={28} strokeWidth={3} />
          </div>
          <div>
            <p className="text-amber-800 font-bold text-sm uppercase tracking-wider">{dict.shop_tokens}</p>
            <p className="text-3xl font-black text-amber-900 leading-none">{userStats.tokens}</p>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 border-b-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:scale-110 transition-transform">
          <Snowflake size={80} strokeWidth={3} />
        </div>
        <div className="flex items-center gap-4 mb-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-500 border-2 border-blue-200">
            <Snowflake size={32} strokeWidth={3} />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-800">{dict.shop_freezers}</h3>
            <p className="text-gray-500 font-bold">{userStats.streakFreezers} disponibles</p>
          </div>
        </div>
        <p className="text-gray-500 text-sm mb-6 font-medium">
          Protege tu racha si un día no logras tus objetivos. Se usa automáticamente si fallas.
        </p>
        <button 
          onClick={handleBuy}
          className={clsx(
            "w-full py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 border-b-4",
            userStats.tokens >= settings.streakFreezerCost 
              ? "bg-blue-600 text-white border-blue-800 active:border-b-0 active:translate-y-[4px] shadow-lg shadow-blue-100" 
              : "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
          )}
        >
          <Coins size={20} />
          {dict.shop_buy_freezer} ({settings.streakFreezerCost})
        </button>
      </div>
    </div>
  );
}
