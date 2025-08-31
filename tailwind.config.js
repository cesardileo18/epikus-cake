/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      // Agregamos backdrop-blur que usa el navbar
      backdropBlur: {
        'xs': '2px',
      },
      // Extendemos las animaciones de transformación
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      // Duración de transiciones personalizadas
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
      }
    }
  },
  plugins: [
    require('flowbite/plugin')
  ],
}