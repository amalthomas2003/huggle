/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Nunito', 'sans-serif'], // Changed to Nunito
      },
      colors: {
        'bg-creamy-orange': '#FFF8F0', // Very light, warm background
        'card-light-orange': '#FFEDE0', // Soft orange for card backgrounds
        'primary-orange': '#FFA500',   // Vibrant Orange (like a peeled orange)
        'dark-orange': '#FF8C00',      // Darker Orange for accents
        'text-dark': '#4A2B00',        // Deep brown for text
        'text-light': '#FFFFFF',       // White for text on dark backgrounds
        'active-green': '#6ECB63',     // Playful green for active status
        'inactive-gray': '#B0B0B0',    // Muted gray for inactive status
        'accent-pink': '#FF69B4',      // A fun accent color
      },
      keyframes: {
        popIn: {
          '0%': { transform: 'scale(0.8)', opacity: 0 },
          '50%': { transform: 'scale(1.05)', opacity: 1 },
          '100%': { transform: 'scale(1)', opacity: 1 },
        },
        bounceIn: {
          '0%': { opacity: 0, transform: 'translateY(20px)' },
          '60%': { opacity: 1, transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        },
        pulseShine: {
          '0%, 100%': { boxShadow: '0 0 15px rgba(255, 165, 0, 0.7)' },
          '50%': { boxShadow: '0 0 25px rgba(255, 165, 0, 1)' },
        },
      },
      animation: {
        popIn: 'popIn 0.5s ease-out forwards',
        bounceIn: 'bounceIn 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards', // More bouncy ease
        pulseShine: 'pulseShine 2s infinite ease-in-out',
      }
    },
  },
  plugins: [],
}