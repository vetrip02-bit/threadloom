import type { Config } from 'tailwindcss'

/**
 * Design tokens for the wholesale-uniform storefront.
 * White is the page background everywhere; ivory is the only supporting surface.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        ivory: '#F7F4EF',
        navy: {
          DEFAULT: '#132238',
          muted: '#2A3A52',
        },
        burgundy: {
          DEFAULT: '#7A1F33',
          hover: '#611728',
        },
        charcoal: '#3E4147',
        gold: '#B99052',
        hairline: '#E8E8E8',
      },
      fontFamily: {
        sans: ['var(--font-poppins)', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      maxWidth: {
        shell: '1280px',
      },
      borderRadius: {
        image: '18px',
        card: '16px',
      },
      boxShadow: {
        card: '0 1px 2px rgba(19, 34, 56, 0.04), 0 8px 24px -16px rgba(19, 34, 56, 0.16)',
        lifted: '0 2px 4px rgba(19, 34, 56, 0.05), 0 18px 40px -24px rgba(19, 34, 56, 0.28)',
        header: '0 1px 0 rgba(232, 232, 232, 1)',
      },
      letterSpacing: {
        eyebrow: '0.14em',
      },
      transitionTimingFunction: {
        editorial: 'cubic-bezier(0.22, 0.61, 0.36, 1)',
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(8px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(100%)' },
          to: { transform: 'translateX(0)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 280ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
        'fade-in': 'fade-in 200ms ease-out both',
        'slide-in-right': 'slide-in-right 260ms cubic-bezier(0.22, 0.61, 0.36, 1) both',
      },
    },
  },
  plugins: [],
}

export default config
