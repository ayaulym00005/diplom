/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        cream: {
          50:  '#FDFAF6',
          100: '#FAF5EE',
          200: '#F5EDE0',
          300: '#EDE0CC',
          400: '#E0CDB5',
        },
        blush: {
          100: '#F9EDE8',
          200: '#F2D9CF',
          300: '#E8C1B0',
          400: '#D9A08A',
          500: '#C47D62',
        },
        bark: {
          100: '#E8DDD5',
          200: '#C9B9AC',
          300: '#A8927F',
          400: '#8A7260',
          500: '#5C4A3A',
          600: '#3D2F23',
        },
        sage: {
          100: '#E8EDE6',
          200: '#C5D3BF',
          300: '#9AB592',
          400: '#6E9465',
        },
        sky: {
          skin: '#E8F0F5',
        },
      },
      fontFamily: {
        display: ['Cormorant Garamond', 'Georgia', 'serif'],
        body: ['Outfit', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'monospace'],
      },
      fontSize: {
        '2xs': '0.65rem',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
        '4xl': '3rem',
      },
      boxShadow: {
        'soft': '0 2px 40px 0 rgba(92,74,58,0.06)',
        'card': '0 4px 24px 0 rgba(92,74,58,0.08)',
        'hover': '0 8px 40px 0 rgba(92,74,58,0.14)',
        'glow': '0 0 0 4px rgba(196,125,98,0.15)',
      },
      backgroundImage: {
        'grain': "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease both',
        'fade-in': 'fadeIn 0.4s ease both',
        'shimmer': 'shimmer 2s infinite',
        'pulse-soft': 'pulseSoft 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.6' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
      },
    },
  },
  plugins: [],
}
