// tailwind.config.js
module.exports = {
  content: [
    './views/**/*.ejs',
    './public/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
        caveat: ['Caveat', 'cursive'], 
      },
      colors: {
        blue: {
          500: '#3B82F6',
          600: '#2563EB',
        },
        red: {
          500: '#EF4444',
          600: '#DC2626',
        },
        green: {
          500: '#10B981',
          600: '#059669',
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
  safelist: [
    'ring-2',
    'ring-blue-500',
    'ring-blue-950',
    // Add other dynamic classes if needed
  ],
};
