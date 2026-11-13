/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        osdag: {
          'dark-color': '#333333',
          green: '#91B014',
          'dark-green': '#7f9915',
          'light-green': '#A8C517',
          'bg-gray': '#F8F9FA',
          'card-bg': '#FFFFFF',
          'text-primary': '#1A1A1A',
          'text-secondary': '#666666',
          'text-muted': '#999999',
          'border': '#E5E7EB',
          'shadow': '#00000008',
        },
      },
      fontSize: {
        'osdag-xl': ['4rem', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
        'card-title': ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
        'item-text': ['0.875rem', { lineHeight: '1.4', fontWeight: '500' }],
        'subtitle': ['0.75rem', { lineHeight: '1.3', fontWeight: '400' }],
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'search': '0 2px 4px -1px rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.06)',
        'auth': '0 10px 25px rgb(0 0 0 / 5%), 0 20px 48px rgb(0 0 0 / 5%), 0 1px 4px rgb(0 0 0 / 10%)',
      },
      width: {
        'sidebar': '288px',
        'search': '600px',
      },
      height: {
        'card-content': '320px',
      },
    },
  },
  plugins: [],
}
