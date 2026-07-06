// PostCSS-pijplijn voor Vite: Tailwind (v3, coexistentie met MUI — zie
// tailwind.config.js) + autoprefixer. ESM omdat package.json "type":"module" is.
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
