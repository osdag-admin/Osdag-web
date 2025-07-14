/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ["./src/**/*.{js,jsx,ts,tsx,html}"],
  theme: {
    extend: {
      colors: {
        osdag: {
          green: '#91B014',
          'dark-green': '#3c4708',
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
  plugins: [
    function({ addUtilities }) {
      addUtilities({
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          'scrollbar-color': '#91B014 transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar': {
          width: '6px',
        },
        '.scrollbar-thin::-webkit-scrollbar-track': {
          background: 'transparent',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb': {
          'background-color': '#91B014',
          'border-radius': '3px',
        },
        '.scrollbar-thin::-webkit-scrollbar-thumb:hover': {
          'background-color': '#A8C517',
        },
      })
    }
  ],
}

