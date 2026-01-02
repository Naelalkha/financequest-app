import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      devOptions: {
        enabled: true
      },
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-96x96.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Moniyo - Gamified Financial Learning',
        short_name: 'Moniyo',
        description: 'Master your finances through interactive quests and gamification',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ['finance', 'education', 'productivity'],
        shortcuts: [
          {
            name: 'Dashboard',
            short_name: 'Dashboard',
            description: 'View your progress and stats',
            url: '/dashboard',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          },
          {
            name: 'Start Quest',
            short_name: 'Quests',
            description: 'Begin a new financial quest',
            url: '/quests',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }]
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json,woff2}'],
        maximumFileSizeToCacheInBytes: 5000000,
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'gstatic-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 365 days
              }
            }
          },
          {
            urlPattern: /^https:\/\/moniyo\.app\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          }
        ]
      }
    })
  ],
  define: {
    global: 'globalThis',
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],

          // Firebase (large dependency)
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore'],

          // Animation libraries (framer-motion is ~100kb)
          animations: ['framer-motion'],

          // Icon libraries (lucide-react tree-shakes well)
          icons: ['lucide-react'],

          // UI libraries
          ui: ['react-toastify', 'react-hot-toast'],

          // i18n
          i18n: ['i18next', 'react-i18next'],

          // State management
          state: ['zustand'],

          // Charts (recharts is ~200kb)
          charts: ['recharts']
        }
      }
    },
    target: 'esnext',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable chunk size reporting
    chunkSizeWarningLimit: 500
  },
  server: {
    port: 5173,
    host: true,
    hmr: {
      port: 5173,
      host: 'localhost'
    },
    watch: {
      usePolling: false,
      // Watch tailwind config for changes
      ignored: ['!**/tailwind.config.js']
    }
  },
  preview: {
    port: 5173,
    host: true
  }
})