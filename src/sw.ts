/// <reference lib="webworker" />
import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';

declare let self: ServiceWorkerGlobalScope;

cleanupOutdatedCaches();
precacheAndRoute(self.__WB_MANIFEST);

self.skipWaiting();
clientsClaim();

// Simple IndexedDB wrapper for Service Worker
const DB_NAME = 'oap-sw-db';
const STORE_NAME = 'sw-data';

function openDB() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveData(data: any) {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, 'cached-stats');
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

async function getData() {
  const db = await openDB();
  return new Promise<any>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get('cached-stats');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Listen for data sync from main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SYNC_DATA') {
    saveData(event.data.data).then(() => {
       console.log('SW: Data persisted to IDB');
    });
  }
});

// Periodic Sync for background notifications
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'check-progress') {
    event.waitUntil(checkProgressAndNotify());
  }
});

async function checkProgressAndNotify() {
  const cachedData = await getData();
  if (!cachedData) return;

  const { goals, entries, settings } = cachedData;
  if (!settings || !settings.lowProgressAlertEnabled) return;

  const now = new Date();
  const currentHours = now.getHours();
  
  // Only notify in the evening (e.g., between 18:00 and 22:00)
  if (currentHours < 18 || currentHours > 22) return;

  const currentDay = now.getDay();
  const todayStr = now.toISOString().split('T')[0];

  const scheduledGoals = goals.filter((g: any) => {
    if (!g.repeatDays.includes(currentDay)) return false;
    if (todayStr.localeCompare(g.startDate) < 0) return false;
    if (g.endDate && todayStr.localeCompare(g.endDate) > 0) return false;
    return true;
  });

  if (scheduledGoals.length > 0) {
    const completedCount = scheduledGoals.filter((g: any) => {
      const entry = entries[`${g.id}_${todayStr}`];
      return entry && (entry.completed || entry.value >= (g.target || 1));
    }).length;
    
    const percentage = (completedCount / scheduledGoals.length) * 100;

    if (percentage < settings.lowProgressThreshold) {
      await self.registration.showNotification("Objetivos hoy", {
        body: settings.lowProgressMessage,
        icon: '/oap.png',
        tag: 'low-progress-alert',
        renotify: true
      });
    }
  }
}
