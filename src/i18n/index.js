import { useSyncExternalStore } from "react";

import { translations } from "./translations";

/* Sistema de idiomas: o padrão é o português (textos originais, sem
   alteração) e "en" ativa o dicionário de inglês. A escolha fica salva
   no localStorage para persistir ao recarregar a página. */

const LANG_KEY = "portfolio-lang";

export const LANGUAGES = ["pt", "en"];

const translationsByLang = {
  pt: translations.pt,
  en: translations.en,
};

const walk = (obj, path) =>
  path.split(".").reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

const interpolate = (text, params) =>
  text.replace(/\{(\w+)\}/g, (match, key) => (params && key in params ? String(params[key]) : match));

export const translate = (lang, path, params, fallback) => {
  const raw = walk(translationsByLang[lang], path) ?? walk(translationsByLang.pt, path);
  if (raw == null) return fallback != null ? fallback : path;
  return interpolate(raw, params);
};

const listeners = new Set();

const readInitialLanguage = () => {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved === "pt" || saved === "en") return saved;
  } catch {
    /* storage bloqueado: mantém o padrão */
  }
  return "pt"; // português continua sendo o idioma padrão
};

let language = readInitialLanguage();

const getSnapshot = () => language;

const subscribe = (listener) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const applyDocumentLanguage = (lang) => {
  document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  document.title = translate(lang, "meta.title");
};

// aplica o idioma salvo carregando a página
applyDocumentLanguage(language);

export const setLanguage = (lang) => {
  if (lang === language) return;
  language = lang;
  try {
    localStorage.setItem(LANG_KEY, lang);
  } catch {
    /* storage bloqueado */
  }
  applyDocumentLanguage(lang);
  listeners.forEach((listener) => listener());
};

export const t = (path, params, fallback) => translate(language, path, params, fallback);

/** Idioma atual da sessão; re-renderiza o componente quando muda. */
export const useLanguage = () => useSyncExternalStore(subscribe, getSnapshot);
