/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          card: '#FFFFFF',
          subtle: '#F4F1EA',
          border: '#E8E4DC',
          hover: '#F0ECE3',
        },
        ink: {
          900: '#11141A',
          800: '#1E232E',
          700: '#333A48',
          600: '#4F5868',
          500: '#6E7787',
          400: '#949EB0',
          300: '#CBD2DE',
          200: '#E4E7ED',
          100: '#F1F3F7',
        },
        brand: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5', // Electric indigo accent
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
          950: '#1E1B4B',
        },
        emerald: {
          soft: '#E8F5E9',
          text: '#1B5E20',
          dot: '#2E7D32',
        },
        amber: {
          soft: '#FFF8E1',
          text: '#E65100',
          dot: '#F57C00',
        },
        rose: {
          soft: '#FFEBEE',
          text: '#B71C1C',
          dot: '#D32F2F',
        }
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          'sans-serif',
        ],
        serif: [
          '"Newsreader"',
          'Georgia',
          'Cambria',
          'serif',
        ]
      },
      boxShadow: {
        'xs': '0 1px 2px 0 rgba(17, 20, 26, 0.06)',
        'subtle': '0 1px 2px 0 rgba(17, 20, 26, 0.04)',
        'card': '0 1px 3px 0 rgba(17, 20, 26, 0.05), 0 1px 2px -1px rgba(17, 20, 26, 0.05)',
        'card-hover': '0 4px 12px 0 rgba(17, 20, 26, 0.08), 0 2px 4px -2px rgba(17, 20, 26, 0.04)',
        'elevated': '0 10px 40px -8px rgba(17, 20, 26, 0.14), 0 4px 12px -4px rgba(17, 20, 26, 0.06)',
        'glow-brand': '0 0 0 3px rgba(79,70,229,0.15), 0 4px 16px rgba(79,70,229,0.12)',
      },
      borderRadius: {
        'card': '12px',
        'button': '8px',
        'badge': '6px',
      }
    },
  },
  plugins: [],
}
