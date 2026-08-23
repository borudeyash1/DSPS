import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',      // Black for text/headers
        secondary: '#666666',    // Gray for secondary text
        accent: '#E63946',       // Red accent for CTA buttons
        background: '#FFFFFF',   // White dominant background
        muted: '#F5F5F5',       // Light gray for cards/sections
        border: '#E5E5E5',      // Border color
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
    },
  },
  plugins: [
    typography,
  ],
}
