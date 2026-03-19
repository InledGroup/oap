import { registerSW } from 'virtual:pwa-register'

const intervalMS = 60 * 60 * 1000 // 1 hour

const updateServiceWorker = registerSW({
  immediate: true,
  onRegistered(r) {
    if (r) {
      // Periodic Sync requires the SW to be active.
      // We can check r.active or wait for it.
      const registerPeriodicSync = async () => {
        if ('periodicSync' in r) {
          try {
            // @ts-ignore
            await r.periodicSync.register('check-progress', {
              minInterval: intervalMS,
            });
            console.log('Periodic Sync registered');
          } catch (e) {
            console.error('Periodic Sync registration failed', e);
          }
        }
      };

      if (r.active) {
        registerPeriodicSync();
      } else {
        r.installing?.addEventListener('statechange', (e: any) => {
          if (e.target.state === 'activated') {
            registerPeriodicSync();
          }
        });
      }

      // Keep SW alive or periodically update
      setInterval(() => {
        r.update();
      }, intervalMS);
    }
  },
  onNeedRefresh() {
    console.log('New content available, click on reload button to update.')
  },
  onOfflineReady() {
    console.log('App is ready to work offline')
  },
})

// Function to sync data to SW
export function syncDataToSW(data: any) {
  if (navigator.serviceWorker && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'SYNC_DATA',
      data
    });
  }
}