/** @type {import('tailwindcss').Config} */
//
// Theme colors mirror the project palette (src/styles/palette.css, sourced from
// task-research/palette.css). `brand` is the royalblue primary; `logo`/`sky` are
// the sredi cyan brand colors; semantic names map to the Bootstrap-derived set.
//
module.exports = {
  content: [
    './src/**/*.{html,ts}',
    './node_modules/flowbite/**/*.js',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Inter is the UI typeface; keep a system fallback for the FOUT window.
        sans: ['Inter', 'ui-sans-serif', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      boxShadow: {
        // Soft, low-alpha card elevation (replaces Tailwind's default `shadow`).
        DEFAULT: '0 1px 2px rgba(16, 24, 40, 0.04), 0 1px 3px rgba(16, 24, 40, 0.08)',
      },
      colors: {
        // Primary — royalblue (#007bff family).
        brand: {
          50: '#e6f2ff',
          100: '#cce5ff', // lavender-100
          200: '#b8daff', // lightsteelblue-100
          300: '#80bdff', // lightskyblue-200
          400: '#339bff',
          500: '#007bff', // royalblue-100 (primary)
          600: '#0069d9', // royalblue-300
          700: '#0062cc', // royalblue-400
          800: '#0056b3', // royalblue-200
          900: '#004085', // darkslateblue-100
        },
        // sredi logo / accent cyans.
        logo: '#00b7ff',   // deepskyblue
        sky: '#53c9e9',    // brand skyblue
        ink: '#324455',    // brand darkslategray (dark surfaces / headings)
        // Semantic (Bootstrap-derived).
        success: { DEFAULT: '#28a745', dark: '#218838' },
        danger: { DEFAULT: '#dc3545', dark: '#c82333' },
        warning: { DEFAULT: '#ffc107', dark: '#e0a800' },
        info: { DEFAULT: '#17a2b8', dark: '#138496' },
      },
    },
  },
  plugins: [
    require('flowbite/plugin'),
  ],
};
