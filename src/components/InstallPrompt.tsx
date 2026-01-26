import React, { useEffect, useState } from 'react';
import { Download, X } from 'lucide-react';

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (PWA)
    const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone || document.referrer.includes('android-app://');
    setIsInstalled(isInStandaloneMode);

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      if (!isInStandaloneMode) {
          setIsVisible(true);
      }
    };

    window.addEventListener('beforeinstallprompt', handler);
    window.addEventListener('appinstalled', () => {
        setIsInstalled(true);
        setIsVisible(false);
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt');
      setDeferredPrompt(null);
      setIsVisible(false);
    }
  };

  // If already installed, don't show anything
  if (isInstalled || !isVisible) return null;

  return (
    <div className="fixed bottom-20 left-4 right-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-xl shadow-2xl z-50 flex items-center justify-between animate-in slide-in-from-bottom-10 fade-in duration-300">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-white/20 rounded-lg">
          <Download size={24} />
        </div>
        <div>
          <h3 className="font-semibold text-sm">Install App for Best Experience</h3>
          <p className="text-xs text-blue-100">Use offline & fullscreen</p>
        </div>
      </div>
      <button 
        onClick={handleInstallClick}
        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold text-xs shadow-sm hover:bg-gray-50 active:scale-95 transition-all"
      >
        Install
      </button>
    </div>
  );
}