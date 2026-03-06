import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    /* VitePWA({
      selfDestroying: true,
      manifest: {
        name: 'GoatStats',
        short_name: 'GoatStats',
        description: 'Dashboard rapide pour GoatCounter',
        theme_color: '#0f172a',
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
          }
        ]
      },
      devOptions: {
        enabled: true
      }
    }) */
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://allanlg.goatcounter.com',
        changeOrigin: true,
        // Pas de rewrite nécessaire si on garde /api/v0 dans l'URL du service
      }
    }
  }
})
