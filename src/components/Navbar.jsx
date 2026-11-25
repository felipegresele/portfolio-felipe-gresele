import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { styles } from "../styles";
import { navLinks } from "../constants";
import { useLanguage, setLanguage, t } from "../i18n";
import { applyTheme, currentTheme } from "../theme";
import { logo, menu, close } from "../assets";

const SunIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2" />
    <path d="M12 20v2" />
    <path d="m4.93 4.93 1.41 1.41" />
    <path d="m17.66 17.66 1.41 1.41" />
    <path d="M2 12h2" />
    <path d="M20 12h2" />
    <path d="m6.34 17.66-1.41 1.41" />
    <path d="m19.07 4.93-1.41 1.41" />
  </svg>
);

const MoonIcon = () => (
  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
  </svg>
);

const Navbar = () => {
  const [active, setActive] = useState("");
  const [toggle, setToggle] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [theme, setTheme] = useState(() => currentTheme());
  const lang = useLanguage(); // re-renderiza quando o idioma muda

  const toggleTheme = () => {
    const next = currentTheme() === "dark" ? "light" : "dark";
    applyTheme(next);
    setTheme(next);
  };

  const toggleLanguage = () => setLanguage(lang === "pt" ? "en" : "pt");

  /* Botões de idioma (EN/PT) e de tema (sol/lua) da barra de navegação, à
     direita da navegação. Botão ativo na cor de destaque do tema. */
  const themeControls = (className) => (
    <div className={`flex items-center gap-4 font-mono ${className}`}>
      <button
        type='button'
        onClick={toggleLanguage}
        aria-label={t("navbar.langAria")}
        title={t("navbar.langAria")}
        className='text-[16px] font-bold tracking-wider text-secondary hover:text-accent transition-colors'
      >
        {lang === "pt" ? "EN" : "PT"}
      </button>

      <button
        type='button'
        onClick={toggleTheme}
        aria-label={t("navbar.themeAria")}
        title={t("navbar.themeAria")}
        className='flex items-center justify-center text-[var(--accent)] transition-opacity hover:opacity-70'
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>
    </div>
  );

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      if (scrollTop > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`${
        styles.paddingX
      } w-full flex items-center py-5 fixed top-0 z-20 ${
        scrolled ? "bg-primary" : "bg-transparent"
      }`}
    >
      <div className='w-full flex justify-between items-center max-w-7xl mx-auto'>
        <Link
          to='/'
          className='flex items-center gap-2'
          onClick={() => {
            setActive("");
            window.scrollTo(0, 0);
          }}
        >
          <p className='text-white text-[18px] font-bold cursor-pointer flex '>
            Felipe &nbsp;
            <span className='sm:block hidden'> | Fullstack Developer</span>
          </p>
        </Link>

        <ul className='list-none hidden sm:flex flex-row gap-10'>
          {navLinks.map((nav) => (
            <li
              key={nav.id}
              className={`${
                active === nav.title ? "text-white" : "text-secondary"
              } hover:text-white text-[18px] font-medium cursor-pointer`}
              onClick={() => setActive(nav.title)}
            >
              <a href={`#${nav.id}`}>{t(`nav.${nav.id}`)}</a>
            </li>
          ))}
        </ul>

        {/* Idioma e tema: à direita, depois do "Contato" */}
        {themeControls("hidden sm:flex")}

        <div className='sm:hidden flex flex-1 justify-end items-center gap-4'>
          {themeControls("")}
          <img
            src={toggle ? close : menu}
            alt='menu'
            className='w-[28px] h-[28px] object-contain'
            onClick={() => setToggle(!toggle)}
          />

          <div
            className={`${
              !toggle ? "hidden" : "flex"
            } p-6 black-gradient absolute top-20 right-0 mx-4 my-2 min-w-[140px] z-10 rounded-xl`}
          >
            <ul className='list-none flex justify-end items-start flex-1 flex-col gap-4'>
              {navLinks.map((nav) => (
                <li
                  key={nav.id}
                  className={`font-poppins font-medium cursor-pointer text-[16px] ${
                    active === nav.title ? "text-white" : "text-secondary"
                  }`}
                  onClick={() => {
                    setToggle(!toggle);
                    setActive(nav.title);
                  }}
                >
                  <a href={`#${nav.id}`}>{t(`nav.${nav.id}`)}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;