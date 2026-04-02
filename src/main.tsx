
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

createRoot(document.getElementById("root")!).render(<App />);

// Mark root as ready and remove prerender hero
requestAnimationFrame(() => {
  const root = document.getElementById("root");
  root?.classList.add("ready");
  // Remove prerender hero after React has painted
  const prerender = document.getElementById("hero-prerender");
  if (prerender) {
    prerender.remove();
  }
});
