import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          
          // Three.js and related
          if (id.includes('three') || id.includes('@react-three') || id.includes('fiber') || id.includes('drei')) {
            return 'three-vendor';
          }
          
          // Mapbox
          if (id.includes('mapbox-gl')) {
            return 'mapbox-vendor';
          }
          
          // UI components
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-vendor';
          }
          
          // Heavy components
          if (id.includes('OvenVisualizer') || id.includes('ARVisualizer')) {
            return 'visualizer-chunk';
          }
          
          // Map component
          if (id.includes('ClientsMap')) {
            return 'map-chunk';
          }
          
          // Gallery
          if (id.includes('OvenGallery') || id.includes('Gallery')) {
            return 'gallery-chunk';
          }
          
          // Utils and services
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    sourcemap: false,
    minify: mode === 'production' ? 'terser' : false,
    chunkSizeWarningLimit: 1000,
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug'],
          passes: 2
        },
        mangle: {
          safari10: true
        }
      }
    })
  }
}));
