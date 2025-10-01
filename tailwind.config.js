// Align app palette to dashboard/calendar neutral scheme and deprecate blue accents app‑wide
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Override blue scale globally to slate (removes blue from `text-blue-600`, etc.)
        blue: colors.slate,
        // Brand palette aligned with calendar/dashboard
        brand: {
          DEFAULT: '#11151D',
          surface: '#0E121A',
          surfaceAlt: '#121722',
          border: '#1C2230',
          text: '#E5E7EB',
          accent: '#10b981', // emerald for positive actions
          danger: '#ef4444',
          warning: '#f59e0b',
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'dark-gradient': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
        'vibrant-gradient': 'linear-gradient(135deg, #10b981 0%, #bf5af2 50%, #f59e0b 100%)',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(100, 116, 139, 0.3)',
        'glow-md': '0 0 20px rgba(100, 116, 139, 0.4)',
        'glow-lg': '0 0 30px rgba(100, 116, 139, 0.5)',
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
          '0%': { boxShadow: '0 0 5px rgba(100, 116, 139, 0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(100, 116, 139, 0.6)' },
        },
      },
    },
  },
  plugins: [],
};
