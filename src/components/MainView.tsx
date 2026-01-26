import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { onboardedStore } from '../stores/appState';
import LandingPage from './LandingPage';
import DailyGoals from './DailyGoals';
import InstallPrompt from './InstallPrompt';
import BottomNav from './BottomNav';

export default function MainView() {
  const [isOnboarded, setIsOnboarded] = useState<boolean | null>(null);
  
  useEffect(() => {
    // Check local storage directly on mount to set initial state
    const stored = localStorage.getItem('oap_onboarded');
    setIsOnboarded(stored === 'true');
  }, []);

  const handleEnterApp = () => {
    onboardedStore.set(true);
    setIsOnboarded(true);
  };

  if (isOnboarded === null) return null; 

  if (!isOnboarded) {
    return <LandingPage onEnter={handleEnterApp} />;
  }

  return (
    <>
      <DailyGoals />
      <InstallPrompt />
      <BottomNav currentPath="/" />
    </>
  );
}