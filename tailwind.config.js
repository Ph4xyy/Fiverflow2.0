/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Enhanced dark mode color palette
        slate: {
          850: '#1a202c',
          950: '#0f172a',
        },
        // Vibrant accent colors for dark mode
        'accent-blue': '#4a9eff',
        'accent-green': '#39d353',
        'accent-purple': '#bf5af2',
        'accent-orange': '#ff9f0a',
        'accent-red': '#ff6b6b',
        'accent-pink': '#ff49db',
        'accent-yellow': '#ffd60a',
        'accent-cyan': '#00d9ff',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'vibrant-gradient': 'linear-gradient(135deg, #4a9eff 0%, #bf5af2 50%, #39d353 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(74, 158, 255, 0.3)',
        'glow-md': '0 0 20px rgba(74, 158, 255, 0.4)',
        'glow-lg': '0 0 30px rgba(74, 158, 255, 0.5)',
        'glow-green': '0 0 20px rgba(57, 211, 83, 0.4)',
        'glow-purple': '0 0 20px rgba(191, 90, 242, 0.4)',
        'glow-orange': '0 0 20px rgba(255, 159, 10, 0.4)',
        'dark-lg': '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -4px rgba(0, 0, 0, 0.5)',
        'dark-xl': '0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 8px 10px -6px rgba(0, 0, 0, 0.6)',
      },
      animation: {
        'gradient-shift': 'gradientShift 15s ease infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        gradientShift: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(74, 158, 255, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(74, 158, 255, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
