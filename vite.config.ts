/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

// base relativa: la app funciona igual en GitHub Pages, Netlify o dentro de una app móvil.
export default defineConfig({
  base: './',
  // NEXT_PUBLIC_ es el prefijo de las variables públicas que crea la integración de Supabase en Vercel.
  // Solo esos prefijos llegan al navegador: las claves secretas (SUPABASE_SECRET_KEY, POSTGRES_*) nunca.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
  define: { __VERCEL__: JSON.stringify(process.env.VERCEL === '1') },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  build: {
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          charts: ['recharts'],
          motion: ['motion'],
        },
      },
    },
  },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
})
