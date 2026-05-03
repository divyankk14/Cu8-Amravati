/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#0a0a0a',
        card: '#111111',
        cardalt: '#161616',
        border: '#1f1f1f',
        primary: '#2d6a4f',
        primaryDark: '#1f4d39',
        primaryLight: '#3f8c69',
        accent: '#f4a522',
        accentDim: '#b67c19',
        textmain: '#f5f5f5',
        textmuted: '#a1a1a1',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'Impact', 'sans-serif'],
        body: ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.25s ease-out',
        'slide-up': 'slideUp 0.35s cubic-bezier(0.16,1,0.3,1)',
        'pulse-slow': 'pulse 2.4s ease-in-out infinite',
        'spin-slow': 'spin 14s linear infinite',
        'float': 'float 6s ease-in-out infinite',
        'shimmer': 'shimmer 2.2s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        slideUp: {
          '0%': { opacity: 0, transform: 'translateY(24px) scale(0.98)' },
          '100%': { opacity: 1, transform: 'translateY(0) scale(1)' },
        },
        float: {
          '0%,100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(45, 106, 79, 0.35)',
        gold: '0 0 24px rgba(244, 165, 34, 0.35)',
      },
    },
  },
  plugins: [],
};
