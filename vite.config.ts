import path from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const isSSR = process.argv.includes('--ssr')

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './app'),
    },
  },
  root: isSSR ? '.' : 'app',
  build: isSSR
    ? {
        emptyOutDir: false,
        minify: 'esbuild',
        rollupOptions: {
          output: {
            entryFileNames: 'filediff.js',
          },
        },
      }
    : {
        outDir: path.resolve(__dirname, 'dist/client'),
        emptyOutDir: true,
      },
  server: {
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:4321',
        changeOrigin: true,
      },
    },
  },
})
