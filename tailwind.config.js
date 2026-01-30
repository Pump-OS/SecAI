/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light American theme
        'usa-red': '#B22234',
        'usa-blue': '#3C3B6E',
        'usa-gold': '#C9A227',
        'usa-navy': '#1a2744',
        // Light backgrounds
        'cream': '#FFFEF7',
        'paper': '#FDF8F3',
        'envelope': '#E8DCC4',
        'envelope-dark': '#D4C4A8',
        'envelope-flap': '#C9B896',
        // Receipt colors
        'receipt': '#FFFFF0',
        'receipt-text': '#333333',
      },
      fontFamily: {
        'display': ['Georgia', 'Times New Roman', 'serif'],
        'mono': ['Courier New', 'monospace'],
      },
      boxShadow: {
        'envelope': '0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)',
        'receipt': '0 4px 20px rgba(0, 0, 0, 0.1)',
        'stamp': '2px 2px 4px rgba(0, 0, 0, 0.3)',
      },
      animation: {
        'receipt-slide': 'receiptSlide 0.8s ease-out forwards',
        'envelope-open': 'envelopeOpen 0.5s ease-out forwards',
      },
      keyframes: {
        receiptSlide: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        envelopeOpen: {
          '0%': { transform: 'rotateX(0deg)' },
          '100%': { transform: 'rotateX(180deg)' },
        },
      },
    },
  },
  plugins: [],
};
