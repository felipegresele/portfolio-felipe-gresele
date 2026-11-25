/* Sistema de temas. O tema escuro (padrão) é o visual original do site;
   o tema claro troca as variáveis CSS declaradas em src/index.css.
   A escolha fica salva no localStorage e, na primeira visita, respeita
   o prefers-color-scheme do sistema. */

const THEME_KEY = "portfolio-theme";

export const THEMES = ["dark", "light"];

export const currentTheme = () =>
  document.documentElement.dataset.theme === "light" ? "light" : "dark";

export const applyTheme = (theme) => {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    /* storage bloqueado */
  }
};

/** Lê uma variável CSS no formato "r g b" e devolve [r, g, b].
    Usado pelos canvases de pixels, que pintam via JS (fora do CSS). */
export const readRgbVar = (name) => {
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  const parts = raw.split(/\s+/).map(Number);
  return parts.length === 3 && parts.every(Number.isFinite) ? parts : [0, 0, 0];
};

/** Paleta atual dos canvases de pixels, conforme o tema ativo. */
export const pixelPalette = () => ({
  accent: readRgbVar("--accent-rgb"),
  hover: readRgbVar("--pixel-hover-rgb"),
  off: readRgbVar("--pixel-off-rgb"),
});
