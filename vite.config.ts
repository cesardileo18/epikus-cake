// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths'
// import javascriptObfuscator from 'vite-plugin-javascript-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    // javascriptObfuscator({
    //   // sin enforce/apply para evitar errores de tipado
    //   options: {
    //     compact: true,
    //     identifierNamesGenerator: 'hexadecimal',
    //     renameGlobals: true,
    //     numbersToExpressions: true,
    //     simplify: true,
    //     unicodeEscapeSequence: true,
    //     stringArray: false,
    //     controlFlowFlattening: false,
    //     deadCodeInjection: false,
    //     transformObjectKeys: false,
    //     reservedStrings: ['./', '../', '/'] // protege imports/rutas
    //   }
    // })
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
