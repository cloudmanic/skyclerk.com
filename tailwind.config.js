// tailwind.config.js
const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  purge: [
    './layouts/**/*.html',
    './content/**/*.html'
  ],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter var', ...defaultTheme.fontFamily.sans],
      },
    },
  },

  variants: {},

  plugins: [
    require('@tailwindcss/ui'),
  ],
}
