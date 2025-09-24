import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { splitVendorChunkPlugin } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
    splitVendorChunkPlugin()
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom', 
      'react-router-dom',
      'lucide-react'
    ],
    exclude: ['three', '@react-three/fiber', '@react-three/drei', 'mapbox-gl']
  },
  build: {
    target: 'esnext',
    minify: mode === 'production' ? 'terser' : false,
    sourcemap: false,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // React core - highest priority
          if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
            return 'react-core';
          }
          
          // Critical UI components
          if (id.includes('@radix-ui') || id.includes('lucide-react')) {
            return 'ui-core';
          }
          
          // Three.js - separate heavy chunk
          if (id.includes('three') || id.includes('@react-three') || id.includes('fiber') || id.includes('drei')) {
            return 'three-vendor';
          }
          
          // Maps - separate chunk
          if (id.includes('mapbox-gl') || id.includes('@googlemaps')) {
            return 'map-vendor';
          }
          
          // Form libraries
          if (id.includes('react-hook-form') || id.includes('@hookform') || id.includes('zod')) {
            return 'form-vendor';
          }
          
          // i18n libraries
          if (id.includes('i18next') || id.includes('react-i18next')) {
            return 'i18n-vendor';
          }
          
          // Charts
          if (id.includes('recharts')) {
            return 'chart-vendor';
          }
          
          // Heavy components as separate chunks
          if (id.includes('OvenVisualizer') || id.includes('ARVisualizer')) {
            return 'visualizer';
          }
          
          if (id.includes('ClientsMap')) {
            return 'map';
          }
          
          if (id.includes('OvenGallery') || id.includes('VirtualizedGallery')) {
            return 'gallery';
          }
          
          // Other vendor chunks
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        }
      }
    },
    ...(mode === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.debug', 'console.info'],
          passes: 2,
          unsafe_arrows: true,
          unsafe_methods: true
        },
        mangle: {
          safari10: true
        },
        format: {
          comments: false
        }
      }
    })
  }
}));
