import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  build: {
    rolldownOptions: {
      output: {
        // Long-lived vendor chunks cache independently of app code between deploys.
        codeSplitting: {
          groups: [
            { name: 'vendor-react', test: /node_modules[\/](react|react-dom|react-router|react-router-dom|scheduler)[\/]/, priority: 30 },
            { name: 'vendor-supabase', test: /node_modules[\/]@supabase[\/]/, priority: 20 },
            { name: 'vendor-query', test: /node_modules[\/]@tanstack[\/]/, priority: 20 },
          ],
        },
      },
    },
  },
})
