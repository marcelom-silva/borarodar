/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'br-bg':     '#0A0A0A',
        'br-card':   '#141414',
        'br-card2':  '#1C1C1C',
        'br-green':  '#39FF14',
        'br-orange': '#FF6B35',
        'br-blue':   '#00D4FF',
        'br-purple': '#B24BF3',
      },
      fontFamily: {
        syne: ['var(--font-syne)', 'sans-serif'],
        dm:   ['var(--font-dm)',   'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      boxShadow: {
        'neon-green':  '0 0 24px rgba(57, 255, 20, 0.35)',
        'neon-orange': '0 0 24px rgba(255, 107, 53, 0.35)',
        'neon-blue':   '0 0 24px rgba(0, 212, 255, 0.35)',
        'card':        '0 4px 32px rgba(0,0,0,0.5)',
      },
      animation: {
        'float':      'float 3s ease-in-out infinite',
        'pulse-neon': 'pulse-neon 2s ease-in-out infinite',
        'slide-up':   'slide-up 0.5s ease forwards',
        'fade-in':    'fade-in 0.4s ease forwards',
      },
      keyframes: {
        float:        { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-8px)' } },
        'pulse-neon': { '0%,100%': { opacity: '1' }, '50%': { opacity: '0.5' } },
        'slide-up':   { from: { opacity: '0', transform: 'translateY(24px)' }, to: { opacity: '1', transform: 'translateY(0)' } },
        'fade-in':    { from: { opacity: '0' }, to: { opacity: '1' } },
      },
    },
  },
  plugins: [],
};
