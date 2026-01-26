import React, { useEffect, useState } from 'react';
import { useStore } from '@nanostores/react';
import { onboardedStore } from '../stores/appState';
import LandingPage from './LandingPage';
import DailyGoals from './DailyGoals';
import InstallPrompt from './InstallPrompt';
import BottomNav from './BottomNav';

export default function MainView() {
  const isOnboarded = useStore(onboardedStore);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleEnterApp = () => {
    onboardedStore.set(true);
  };

  if (!mounted) return null; // Avoid hydration mismatch on initial render

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