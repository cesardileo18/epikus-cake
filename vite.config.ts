// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
  ],
  build: {
    outDir: 'dist',               // explícito
    minify: 'terser',
    terserOptions: {
      compress: { passes: 2 },
      mangle: { toplevel: true },
      format: { comments: false }
    },
    sourcemap: false
  },
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  }
})
