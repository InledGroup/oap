import React, { useState, useEffect } from 'react';
import { type Goal, addGoal, goalsStore } from '../stores/goals';
import DailyGoals from './DailyGoals';
import { 
  Zap, Heart, Brain, Download, Shield, Lock, EyeOff, X
} from 'lucide-react';
import { clsx } from 'clsx';
import { useStore } from '@nanostores/react';
import { t } from '../stores/i18n';
import LanguageSelector from './LanguageSelector';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const goals = useStore(goalsStore);
  const dict = useStore(t);

  // Initialize demo data
  useEffect(() => {
    const currentGoals = goalsStore.get();
    if (currentGoals.length === 0) {
      const demoGoals: Goal[] = [
        {
          id: 'demo-1',
          name: 'Drink Water',
          emoji: '💧',
          color: '#3B82F6', 
          type: 'number',
          target: 8,
          repeatDays: [0,1,2,3,4,5,6],
          startDate: new Date().toISOString().split('T')[0],
          tintType: 'card',
          createdAt: Date.now()
        },
        {
          id: 'demo-2',
          name: 'Read 10 min',
          emoji: '📖', 
          color: '#8B5CF6', 
          type: 'time',
          target: 10,
          repeatDays: [0,1,2,3,4,5,6],
          startDate: new Date().toISOString().split('T')[0],
          tintType: 'icon',
          createdAt: Date.now()
        },
        {
          id: 'demo-3',
          name: 'Meditate',
          emoji: '🧘',
          color: '#F59E0B', 
          type: 'check',
          target: 1,
          repeatDays: [0,1,2,3,4,5,6],
          startDate: new Date().toISOString().split('T')[0],
          tintType: 'card',
          createdAt: Date.now()
        }
      ];
      setTimeout(() => {
         if (goalsStore.get().length === 0) {
            goalsStore.set(demoGoals);
         }
      }, 100);
    }

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Check if already installed
    const isInstalled = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
    
    // Check for global deferred prompt (captured in Layout)
    if (!isInstalled && (window as any).deferredInstallPrompt) {
       setInstallPrompt((window as any).deferredInstallPrompt);
       setShowBanner(true);
    }

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
      if (!isInstalled) {
         setShowBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleAction = async () => {
    if (installPrompt) {
      installPrompt.prompt();
      const { outcome } = await installPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallPrompt(null);
        setShowBanner(false);
      }
    } else {
       // Just enter if no install prompt (or manual install needed)
       onEnter();
    }
  };

  const handleInstallClick = () => {
    if (installPrompt) {
      installPrompt.prompt();
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900 overflow-x-hidden flex flex-col">
      
      {/* Header */}
      <header 
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled ? "bg-white border-gray-200" : "bg-transparent border-transparent py-4"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 text-2xl font-extrabold text-blue-600 tracking-tighter">
             <img src="/oap.png" alt="oap logo" className="w-10 h-10 rounded-xl shadow-sm" />
             oap
          </div>
          
          <div className="flex items-center gap-4">
             <LanguageSelector />
             <button 
               onClick={handleAction}
               className="bg-gray-900 text-white px-6 py-2.5 rounded-2xl font-bold uppercase tracking-wide text-sm shadow-[0_4px_0_#000] active:shadow-none active:translate-y-[4px] transition-all hover:bg-gray-800 hidden sm:block"
             >
               {installPrompt ? dict.landing_cta_install : dict.landing_cta_start}
             </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:pt-40 lg:pb-32 bg-[url('/background.svg')] bg-repeat flex-1">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          
          {/* Hero Content */}
          <div className="space-y-8 z-10">
            <h1 className="text-4xl lg:text-6xl font-extrabold text-gray-900 leading-tight">
              {dict.landing_title}
            </h1>
            <p className="text-xl text-gray-500 font-medium max-w-lg leading-relaxed">
              {dict.landing_subtitle}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAction}
                className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-extrabold text-lg shadow-[0_4px_0_#1E40AF] active:shadow-none active:translate-y-[4px] transition-all w-full sm:w-auto uppercase tracking-wider hover:bg-blue-700"
              >
                {dict.landing_cta_start}
              </button>
            </div>
          </div>

          {/* Phone Demo */}
          <div className="relative z-10 flex justify-center lg:justify-end perspective-1000">
             <div className="relative w-[320px] h-[640px] bg-black rounded-[3rem] border-8 border-gray-900 shadow-2xl overflow-hidden transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500">
                {/* Status Bar Mock */}
                <div className="h-6 bg-white w-full absolute top-0 z-20 flex justify-between px-6 items-center text-[10px] font-bold text-gray-800">
                   <span>9:41</span>
                   <div className="flex gap-1">
                     <div className="w-4 h-2.5 bg-gray-800 rounded-sm"></div>
                     <div className="w-0.5 h-2.5 bg-gray-800 rounded-sm"></div>
                   </div>
                </div>
                {/* App Content */}
                <div className="h-full bg-gray-50 pt-8 overflow-y-auto scrollbar-hide">
                   <DailyGoals />
                   <div className="px-4 pb-8 pt-4">
                      <div className="bg-blue-50 p-4 rounded-xl text-center text-sm text-blue-600 font-bold border-2 border-blue-100 border-b-4">
                         {dict.landing_demo_try}
                      </div>
                   </div>
                </div>
                {/* Bottom Bar Mock */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-gray-900 rounded-full z-20"></div>
             </div>
          </div>
        </div>
      </section>

      {/* Neurodiversity / Use Cases */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
           <div className="text-center mb-16 space-y-4">
              <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900">{dict.landing_neuro}</h2>
              <p className="text-xl text-gray-500">{dict.landing_neuro_sub}</p>
           </div>
           
           <div className="grid md:grid-cols-3 gap-8">
              {/* TDAH */}
              <div className="border-2 border-gray-200 border-b-[6px] rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-16 h-16 bg-amber-500 rounded-2xl shadow-[0_4px_0_#B45309] flex items-center justify-center text-white mb-6">
                    <Zap size={32} fill="currentColor" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3 text-gray-900">{dict.landing_adhd}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">
                    {dict.landing_adhd_desc}
                 </p>
              </div>

              {/* TEA */}
              <div className="border-2 border-gray-200 border-b-[6px] rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-16 h-16 bg-blue-500 rounded-2xl shadow-[0_4px_0_#1D4ED8] flex items-center justify-center text-white mb-6">
                    <Brain size={32} />
                 </div>
                 <h3 className="text-2xl font-bold mb-3 text-gray-900">{dict.landing_asd}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">
                    {dict.landing_asd_desc}
                 </p>
              </div>

              {/* Ansiedad */}
              <div className="border-2 border-gray-200 border-b-[6px] rounded-3xl p-8 hover:-translate-y-2 transition-transform duration-300">
                 <div className="w-16 h-16 bg-rose-500 rounded-2xl shadow-[0_4px_0_#BE123C] flex items-center justify-center text-white mb-6">
                    <Heart size={32} fill="currentColor" />
                 </div>
                 <h3 className="text-2xl font-bold mb-3 text-gray-900">{dict.landing_anxiety}</h3>
                 <p className="text-gray-500 font-medium leading-relaxed">
                    {dict.landing_anxiety_desc}
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Privacy First Section */}
      <section className="py-24 px-6 bg-gray-50 text-gray-900 border-t-2 border-gray-100">
        <div className="max-w-4xl mx-auto text-center space-y-12">
           <div className="inline-flex items-center gap-2 bg-white text-blue-600 px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider border-2 border-gray-200 shadow-sm">
              <Shield size={16} /> {dict.landing_privacy_title}
           </div>
           
           <h2 className="text-3xl lg:text-5xl font-extrabold leading-tight text-gray-900">
              {dict.landing_privacy_title}<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">{dict.landing_privacy_sub}</span>
           </h2>
           
           <div className="grid md:grid-cols-3 gap-8 text-left mt-12">
              <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 border-b-[6px] hover:-translate-y-1 transition-transform">
                 <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mb-4 text-green-600">
                    <Lock size={24} />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-gray-900">{dict.landing_offline}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {dict.landing_offline_desc}
                 </p>
              </div>
              
              <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 border-b-[6px] hover:-translate-y-1 transition-transform">
                 <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-4 text-blue-600">
                    <EyeOff size={24} />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-gray-900">{dict.landing_no_tracking}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {dict.landing_no_tracking_desc}
                 </p>
              </div>

              <div className="bg-white p-6 rounded-3xl border-2 border-gray-200 border-b-[6px] hover:-translate-y-1 transition-transform">
                 <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-4 text-purple-600">
                    <Download size={24} />
                 </div>
                 <h3 className="font-bold text-lg mb-2 text-gray-900">{dict.landing_control}</h3>
                 <p className="text-gray-500 text-sm leading-relaxed font-medium">
                    {dict.landing_control_desc}
                 </p>
              </div>
           </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-white border-t-2 border-gray-100 mt-auto">
         <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
            <div>
               <div className="flex items-center justify-center md:justify-start gap-3 text-2xl font-extrabold text-gray-900 tracking-tighter mb-4">
                  <img src="/oap.png" alt="oap" className="w-8 h-8 rounded-lg" />
                  oap
               </div>
               <p className="max-w-xs font-bold text-gray-400 text-xs uppercase tracking-wide">
                  {dict.landing_footer_desc}
               </p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-8 text-sm font-extrabold text-gray-400">
                <div className="flex gap-8">
                  <a href="#" className="hover:text-blue-600 transition-colors">{dict.landing_links_github}</a>
                  <a href="#" className="hover:text-blue-600 transition-colors">{dict.landing_links_privacy}</a>
                  <a href="#" className="hover:text-blue-600 transition-colors">{dict.landing_links_terms}</a>
                </div>
            </div>
         </div>
      </footer>

      {/* Persistent Install Banner */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-[100] animate-in slide-in-from-bottom-full duration-500">
          <div className="max-w-lg mx-auto bg-gray-900 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border border-gray-800">
             <div className="flex items-center gap-3">
                <img src="/oap.png" className="w-12 h-12 rounded-xl" alt="App Icon" />
                <div>
                   <h4 className="font-bold">{dict.landing_cta_install}</h4>
                   <p className="text-xs text-gray-400">100% Offline</p>
                </div>
             </div>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setShowBanner(false)}
                  className="p-2 text-gray-400 hover:text-white"
                >
                   <X size={20} />
                </button>
                <button 
                  onClick={handleInstallClick}
                  className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg active:scale-95 transition-all"
                >
                  {dict.landing_cta_install}
                </button>
             </div>
          </div>
        </div>
      )}

    </div>
  );
}