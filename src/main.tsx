import {createRoot} from 'react-dom/client';
import {registerSW} from 'virtual:pwa-register';
import '@fontsource/outfit/600.css';
import '@fontsource/outfit/700.css';
import '@fontsource/outfit/800.css';
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import '@fontsource/plus-jakarta-sans/700.css';
import App from './App.tsx';
import './index.css';

if ('serviceWorker' in navigator) {
  registerSW({
    immediate: true,
    onRegisteredSW(_swUrl, registration) {
      if (!registration) return;
      const warmCache = () => {
        const target =
          registration.active ||
          registration.waiting ||
          registration.installing;
        target?.postMessage({ type: 'PRECACHE_DAILY_VERSES' });
      };
      if (registration.active) {
        warmCache();
      } else {
        navigator.serviceWorker.ready
          .then((readyReg) => {
            readyReg.active?.postMessage({ type: 'PRECACHE_DAILY_VERSES' });
          })
          .catch(() => {});
      }
    },
    onRegisterError(error) {
      console.warn('Service worker registration failed:', error);
    },
  });
}

createRoot(document.getElementById('root')!).render(<App />);
