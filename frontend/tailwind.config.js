/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: '#FF0000',
        yellow: { brut: '#FFE500' },
        dark: {
          100: '#111111',
          200: '#0d0d0d',
          300: '#1a1a1a',
          400: '#080808',
          500: '#050505',
        },
      },
      fontFamily: {
        brut: ['"Arial Black"', 'Impact', '"Helvetica Neue"', 'sans-serif'],
        mono: ['"Courier New"', 'Courier', 'monospace'],
      },
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-fast': 'marquee 15s linear infinite',
        'slide-up': 'slideUp 0.7s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-left': 'slideInLeft 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-in-right': 'slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'fade-in': 'fadeIn 0.5s ease forwards',
        'glitch': 'glitch 3s ease infinite',
        'flicker': 'flicker 4s ease infinite',
        'bounce-brut': 'bounceBrut 0.4s ease',
        'spin-slow': 'spin 8s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(50px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-80px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(80px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        glitch: {
          '0%, 90%, 100%': { transform: 'translateX(0)', filter: 'none' },
          '92%': { transform: 'translateX(-3px)', filter: 'drop-shadow(3px 0 #FF0000)' },
          '94%': { transform: 'translateX(3px)', filter: 'drop-shadow(-3px 0 #00FFFF)' },
          '96%': { transform: 'translateX(-2px)', filter: 'none' },
          '98%': { transform: 'translateX(2px)', filter: 'drop-shadow(2px 0 #FF0000)' },
        },
        flicker: {
          '0%, 95%, 100%': { opacity: '1' },
          '96%': { opacity: '0.4' },
          '97%': { opacity: '1' },
          '98%': { opacity: '0.2' },
          '99%': { opacity: '1' },
        },
        bounceBrut: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
      },
      boxShadow: {
        'brut': '4px 4px 0px #000000',
        'brut-white': '4px 4px 0px #ffffff',
        'brut-red': '4px 4px 0px #FF0000',
        'brut-yellow': '4px 4px 0px #FFE500',
        'brut-lg': '8px 8px 0px #000000',
        'brut-lg-white': '8px 8px 0px #ffffff',
        'brut-lg-red': '8px 8px 0px #FF0000',
        'brut-xl': '12px 12px 0px #000000',
        'brut-xl-white': '12px 12px 0px #ffffff',
      },
      borderWidth: {
        '3': '3px',
      },
    },
  },
  plugins: [],
};
