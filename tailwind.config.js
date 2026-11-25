/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  mode: "jit",
  theme: {
    extend: {
      colors: {
        /* Cores mapeadas em variáveis CSS (ver :root em src/index.css).
           O tema escuro mantém os valores originais; o tema claro sobrescreve
           as mesmas variáveis via html[data-theme="light"]. */
        primary: "var(--bg-page)",
        secondary: "var(--text-secondary)",
        tertiary: "#151030",
        "black-100": "#100d25",
        "black-200": "#090325",
        "white-100": "var(--text-soft)",
        /* O trinco branco (text-white, border-white/10, bg-white/20...)
           vira a cor de texto forte de cada tema via --mono-rgb. */
        white: "rgb(var(--mono-rgb) / <alpha-value>)",
        /* Cor de destaque (roxo no tema original, laranja no tema claro). */
        accent: "rgb(var(--accent-rgb) / <alpha-value>)",
        "accent-soft": "rgb(var(--accent-soft-rgb) / <alpha-value>)",
        "accent-deep": "rgb(var(--accent-deep-rgb) / <alpha-value>)",
        /* Superfícies de cards (#151a22 e #0d1117 no tema escuro). */
        surface: "rgb(var(--surface-rgb) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2-rgb) / <alpha-value>)",
        error: "rgb(var(--error-rgb) / <alpha-value>)",
        /* Escala cinza ajustada por tema para manter a legibilidade. */
        gray: {
          300: "rgb(var(--gray-300-rgb) / <alpha-value>)",
          400: "rgb(var(--gray-400-rgb) / <alpha-value>)",
          500: "rgb(var(--gray-500-rgb) / <alpha-value>)",
          600: "#4b5563",
        },
      },
      boxShadow: {
        card: "0px 35px 120px -15px #211e35",
      },
      screens: {
        xs: "450px",
      },
      backgroundImage: {
        "hero-pattern": "url('/src/assets/herobg.png')",
      },
    },
  },
  plugins: [],
};