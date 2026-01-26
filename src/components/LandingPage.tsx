import React, { useState, useEffect } from 'react';
import { ArrowRight, CheckCircle2, BarChart2, Bell, Layout, Smartphone, Github, Twitter, Monitor, Download } from 'lucide-react';
import { clsx } from 'clsx';

interface LandingPageProps {
  onEnter: () => void;
}

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [scrolled, setScrolled] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);

    // Capture install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
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
        // We can wait or just enter. Let's enter after install logic or dismissal.
      }
    }
    // Proceed to app regardless of install outcome
    onEnter();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-blue-100">
      
      {/* Floating Header */}
      <header 
        className={clsx(
          "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
          scrolled ? "bg-white/80 backdrop-blur-md py-3 shadow-sm border-gray-100" : "bg-transparent py-5 border-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-2xl tracking-tight text-gray-900">
            <img src="/oapp.png" alt="oap logo" className="w-8 h-8 rounded-lg" />
            oap
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded uppercase tracking-widest">Beta</span>
          </div>
          <button 
            onClick={handleAction}
            className="bg-gray-900 text-white px-5 py-2.5 rounded-full font-medium hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
          >
            {installPrompt ? <Download size={16}/> : null}
            {installPrompt ? 'Install App' : 'Launch App'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 lg:pt-48 lg:pb-32 bg-gradient-to-b from-gray-50 to-white overflow-hidden relative">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8 relative z-10 animate-in slide-in-from-bottom-10 fade-in duration-700">
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-[1.1]">
              Achieve your <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                daily goals.
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-lg leading-relaxed">
              The simplest way to build habits, track progress, and stay consistent. No clutter, just focus.
            </p>
            
            <div className="flex items-center gap-4 text-sm font-medium text-gray-500 bg-gray-100/50 w-fit px-4 py-2 rounded-full border border-gray-200">
               <Monitor size={16} />
               <span>Works on iOS, Android, Windows, macOS & Linux</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={handleAction}
                className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                {installPrompt ? 'Install & Start' : 'Start Tracking Free'}
                <ArrowRight size={20} />
              </button>
              <button 
                onClick={handleAction}
                className="px-8 py-4 rounded-full font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Learn more
              </button>
            </div>
            <div className="pt-4 flex items-center gap-4 text-sm text-gray-500">
              <div className="flex -space-x-2">
                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white"/>) }
              </div>
              <p>Trusted by 10+ early adopters</p>
            </div>
          </div>

          {/* Hero Visual */}
          <div className="relative z-10 lg:h-[600px] flex items-center justify-center">
             <div className="relative w-full max-w-sm transform rotate-y-6 hover:rotate-y-0 transition-transform duration-700 drop-shadow-2xl">
                <img src="/goalsview.png" alt="App Screenshot" className="w-full h-auto rounded-2xl" />
             </div>
             
             {/* Decorative Blobs */}
             <div className="absolute -top-10 -right-10 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl -z-10"/>
             <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-indigo-400/20 rounded-full blur-3xl -z-10"/>
          </div>
        </div>
      </section>

      {/* Feature 1: Progress */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 flex items-center justify-center relative">
             <img src="/progress.png" alt="Progress View" className="rounded-2xl shadow-2xl max-h-[500px] object-contain" />
          </div>
          <div className="order-1 md:order-2 space-y-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
              <BarChart2 size={24} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Visualize your success</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              See how far you've come with beautiful, interactive charts. Track streaks, completion rates, and daily performance at a glance.
            </p>
            <ul className="space-y-3">
              {['Weekly & Monthly views', 'Completion statistics', 'Goal streaks'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Feature 2: Reminders & Config */}
      <section className="py-24 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-6">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
              <Bell size={24} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">Customize & Remind</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Set smart reminders for specific goals. Customize colors, icons, and schedules to fit your lifestyle perfectly.
            </p>
            <ul className="space-y-3">
              {['Custom schedules', 'Smart notifications', 'Personalized themes'].map(item => (
                <li key={item} className="flex items-center gap-3 text-gray-700">
                  <CheckCircle2 size={18} className="text-green-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex items-center justify-center relative">
             <img src="/objectivesconf.png" alt="Configuration View" className="rounded-2xl shadow-2xl max-h-[500px] object-contain" />
          </div>
        </div>
      </section>

      {/* Feature 3: PWA */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="order-2 md:order-1 bg-gray-900 rounded-3xl p-8 aspect-square flex items-center justify-center relative overflow-hidden text-white group">
             <Smartphone size={120} className="text-white relative z-10 drop-shadow-2xl" />
          </div>
          <div className="order-1 md:order-2 space-y-6">
             <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 mb-4">
              <Layout size={24} />
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900">App-like experience</h2>
            <p className="text-lg text-gray-600 leading-relaxed">
              Install <strong>oap</strong> directly to your home screen. It works offline, loads instantly, and feels just like a native app.
            </p>
             <button onClick={handleAction} className="text-blue-600 font-semibold hover:underline flex items-center gap-2">
               {installPrompt ? 'Install now' : 'Try it now'} <ArrowRight size={16} />
             </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 bg-gray-900 text-white text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <h2 className="text-4xl lg:text-6xl font-bold tracking-tight">Ready to build better habits?</h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            Join the community of goal achievers. Free, open source, and privacy-focused.
          </p>
          <div className="flex flex-col items-center gap-4">
            <button 
              onClick={handleAction}
              className="bg-white text-gray-900 px-10 py-4 rounded-full font-bold text-lg hover:bg-gray-100 transition-transform active:scale-95 shadow-xl shadow-white/10"
            >
               {installPrompt ? 'Install App' : 'Get Started Now'}
            </button>
            <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Currently in Beta</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 font-bold text-xl mb-4">
                 <img src="/oapp.png" alt="oap logo" className="w-6 h-6 rounded" />
                 oap
                 <span className="text-[9px] font-bold px-1 py-0.5 bg-blue-100 text-blue-600 rounded uppercase">Beta</span>
              </div>
              <p className="text-gray-500 max-w-sm">
                Objectives APP (oap) is designed to help you organize your life, one goal at a time. Privacy first, offline capable.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Product</h3>
              <ul className="space-y-3 text-sm text-gray-600 text-left">
                <li><button onClick={handleAction}>Features</button></li>
                <li><button onClick={handleAction}>Pricing</button></li>
                <li><button onClick={handleAction}>Download</button></li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-4">Legal</h3>
              <ul className="space-y-3 text-sm text-gray-600 text-left">
                <li><button onClick={handleAction} className="hover:underline">Privacy Policy</button></li>
                <li><button onClick={handleAction} className="hover:underline">Terms of Service</button></li>
                <li><button onClick={handleAction} className="hover:underline">Cookie Policy</button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-gray-200 text-sm text-gray-500 gap-4">
            <p>&copy; {new Date().getFullYear()} oap. All rights reserved.</p>
            <div className="flex gap-6">
              <button onClick={handleAction}><Github size={20} className="hover:text-gray-900 cursor-pointer" /></button>
              <button onClick={handleAction}><Twitter size={20} className="hover:text-gray-900 cursor-pointer" /></button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}