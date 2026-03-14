/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      // ── Colores del Design System ──────────────────────────
      // Apuntan a las CSS variables de index.css.
      // Uso: bg-brand, text-brand, border-brand, etc.
      colors: {
        brand: {
          DEFAULT: 'var(--color-brand)',
          light:   'var(--color-brand-light)',
          dark:    'var(--color-brand-dark)',
        },
        'bg-section':  'var(--color-bg-section)',
        'bg-card':     'var(--color-bg-card)',
        'text-muted':  'var(--color-text-muted)',
      },

      // ── Gradientes de marca ────────────────────────────────
      backgroundImage: {
        'brand':       'var(--gradient-brand)',
        'brand-hover': 'var(--gradient-brand-hover)',
      },

      // ── Box shadows de marca ───────────────────────────────
      boxShadow: {
        'brand':       'var(--shadow-brand)',
        'brand-hover': 'var(--shadow-brand-hover)',
        'card':        'var(--shadow-card)',
        'card-hover':  'var(--shadow-card-hover)',
      },

      // ── Border radius del Design System ───────────────────
      borderRadius: {
        'card':  'var(--radius-card)',
        'btn':   'var(--radius-btn)',
      },

      // ── Tipografía ─────────────────────────────────────────
      fontFamily: {
        greatVibes: ['"Great Vibes"', 'cursive'],
      },

      // ── Misc ───────────────────────────────────────────────
      backdropBlur: {
        xs: '2px',
      },
      transitionProperty: {
        height:  'height',
        spacing: 'margin, padding',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ],
}
