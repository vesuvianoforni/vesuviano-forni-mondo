
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './i18n/config'

createRoot(document.getElementById("root")!).render(<App />);

// Mark root as ready after styles are applied
requestAnimationFrame(() => {
  document.getElementById("root")?.classList.add("ready");
});
