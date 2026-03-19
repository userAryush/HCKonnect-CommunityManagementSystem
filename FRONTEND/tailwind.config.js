/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: 'var(--color-primary)',
          hover: 'var(--color-primary-hover)',
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)',
        },
        surface: {
          dark: 'var(--color-surface-dark)',
          body: 'var(--color-surface-body)',
          muted: 'var(--color-surface-muted)',
          border: 'var(--color-surface-border)',
        },
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        display: 'var(--font-display)',
      },
      borderRadius: {
        standard: 'var(--radius-standard)',
        button: 'var(--radius-button)',
      },
    },
  },
  plugins: [],
}
