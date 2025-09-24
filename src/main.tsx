
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

// Register service worker for performance
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

// Preload critical resources
const preloadCriticalResources = () => {
  // Preload hero image
  const heroImage = new Image();
  heroImage.src = '/src/assets/mattoni-refrattari-hero.jpg';
  
  // Preload logo
  const logo = new Image();
  logo.src = '/lovable-uploads/vesuviano-logo-bianco.png';
  
  // Prefetch API endpoints
  if ('fetch' in window) {
    // Warm up Supabase connection
    setTimeout(() => {
      fetch('/api/health').catch(() => {});
    }, 2000);
  }
};

// Initialize app
preloadCriticalResources();
createRoot(document.getElementById("root")!).render(<App />);
