/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx}",
    ],
    theme: {
        extend: {
            colors: {
                bg: {
                    primary: '#FAFAF8',
                    card: '#FFFFFF',
                    subtle: '#F4F4F1',
                },
                tx: {
                    primary: '#0F0F0E',
                    secondary: '#6B6B63',
                    tertiary: '#9B9B93',
                },
                accent: {
                    DEFAULT: '#1A1A18',
                    green: '#16A34A',
                    amber: '#D97706',
                },
                border: {
                    DEFAULT: '#E8E8E4',
                },
            },
            fontFamily: {
                display: ['"Playfair Display"', 'Georgia', 'serif'],
                sans: ['"DM Sans"', 'system-ui', 'sans-serif'],
            },
            borderRadius: {
                'card': '16px',
                'pill': '9999px',
            },
            boxShadow: {
                'card': '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.04)',
                'card-hover': '0 2px 8px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.06)',
                'button': '0 1px 2px rgba(0,0,0,0.08)',
            },
            transitionDuration: {
                '150': '150ms',
                '200': '200ms',
            },
            keyframes: {
                'fade-in': {
                    '0%': { opacity: '0', transform: 'translateY(8px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in-scale': {
                    '0%': { opacity: '0', transform: 'scale(0.96)' },
                    '100%': { opacity: '1', transform: 'scale(1)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(16px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'check-draw': {
                    '0%': { 'stroke-dashoffset': '36' },
                    '100%': { 'stroke-dashoffset': '0' },
                },
                'pulse-soft': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.5' },
                },
            },
            animation: {
                'fade-in': 'fade-in 200ms ease-out forwards',
                'fade-in-scale': 'fade-in-scale 200ms ease-out forwards',
                'slide-up': 'slide-up 300ms ease-out forwards',
                'check-draw': 'check-draw 400ms ease-out forwards',
                'pulse-soft': 'pulse-soft 1.8s ease-in-out infinite',
            },
        },
    },
    plugins: [],
}
