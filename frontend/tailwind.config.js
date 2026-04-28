/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{js,jsx,ts,tsx,html}'],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0f1117',
          surface: '#161b27',
          card: '#1e2535',
          border: 'rgba(255,255,255,0.07)',
        },
        accent: {
          green: '#4ade80',
          hover: '#22c55e',
          dim: 'rgba(74,222,128,0.12)',
          border: 'rgba(74,222,128,0.25)',
        },
        textDark: {
          primary: '#f0f4ff',
          secondary: '#9aa3b8',
          muted: '#5c6478',
        },
      },
    },
  },
  plugins: [],
};

