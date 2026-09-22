import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n/config'
import { captureAttribution } from './lib/attribution'

// Capture traffic source (utm_*, gclid, fbclid) from the landing URL.
captureAttribution();

const root = document.getElementById("root")!;
createRoot(root).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);

// Once React paints, show app and remove prerender
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    root.classList.add("ready");
    const prerender = document.getElementById("hero-prerender");
    if (prerender) prerender.style.display = "none";
  });
});
