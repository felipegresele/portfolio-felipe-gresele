import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { useLanguage, t } from "../i18n";
import { pixelPalette } from "../theme";

const ACCENT = "var(--accent)"; // cor de destaque do tema (roxo escuro / laranja claro)
const COLS = 32;
const ROWS = 32;

/* ---------- Dados (baseados no currículo) ---------- */
const experiences = [
  {
    current: true,
    title: "Desenvolvedor Full Stack Júnior",
    org: "ITM Channel",
    period: "jan 2026 — hoje",
    bullets: [
      "Desenvolvo e mantenho aplicações com Java 11 e 21, Spring Boot, React e TypeScript.",
      "Liderei a unificação de duas aplicações front-end em um único servidor, reduzindo o tempo de requisições em produção e facilitando a manutenção.",
      "Otimizei consultas no MongoDB, incluindo consultas personalizadas e agregações.",
      "Atuo com microsserviços usando Kafka para comunicação assíncrona e faço deploy no Google Cloud Platform (GCP), incluindo o gerenciamento de buckets de armazenamento.",
    ],
    tags: ["Java", "Spring Boot", "React", "TypeScript", "MongoDB", "Kafka", "GCP"],
  },
  {
    title: "Desenvolvedor Front-end Estagiário",
    org: "ITM Channel",
    period: "abr 2025 — dez 2025",
    bullets: [
      "Criei componentes reutilizáveis em React, TypeScript e Tailwind CSS, reduzindo o tempo de desenvolvimento de novas telas.",
      "Integrei o front-end com APIs REST em Java e Spring, padronizando a comunicação entre as camadas.",
      "Corrigi bugs, aumentando a estabilidade da interface.",
      "Colaborei com a equipe de back-end na evolução dos sistemas.",
    ],
    tags: ["React", "TypeScript", "Tailwind CSS", "Java", "Spring Boot"],
  },
];

const education = [
  {
    current: true,
    title: "Engenharia de Software",
    degree: "Graduação",
    org: "FIAP",
    period: "2026 — 2028 (previsto)",
  },
  {
    title: "Análise e Desenvolvimento de Sistemas",
    degree: "Graduação (Tecnólogo)",
    org: "FIAP",
    period: "2024 — 2025",
  },
];

const languages = [
  { name: "Português", level: "Nativo" },
  { name: "Inglês", level: "Intermediário (B1)" },
];

const tabs = [
  { id: "exp", label: "Experiência" },
  { id: "edu", label: "Formação" },
];

/* ---------- Tag ---------- */
const Tag = ({ children }) => (
  <span className="font-mono text-[12px] font-semibold text-white bg-accent/15 border border-accent/50 rounded-full px-2.5 py-0.5">
    {children}
  </span>
);

/* ---------- Desenho em pixels: grafo de commits (git) ----------
   0 = apagado, 1 = fraco, 2 = médio, 3 = forte */
const makeGrid = (draw) => {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const set = (x, y, v = 3) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y][x] = v;
  };
  const fill = (x, y, w, h, v = 3) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v);
  };
  draw({ set, fill });
  return g;
};

const gitGraph = makeGrid(({ set, fill }) => {
  // tronco principal
  for (let y = 3; y <= 28; y++) set(10, y, 2);

  // branch: sai do tronco, desce e volta (merge)
  for (let x = 10; x <= 21; x++) {
    set(x, 11, 2);
    set(x, 21, 2);
  }
  for (let y = 11; y <= 21; y++) set(21, y, 2);

  // commits (nós)
  fill(8, 3, 5, 5, 3); // topo
  fill(8, 14, 5, 5, 3); // meio
  fill(8, 24, 5, 5, 3); // base
  fill(19, 14, 5, 5, 3); // commit na branch

  // "mensagens" dos commits
  fill(15, 4, 9, 1, 1);
  fill(15, 6, 6, 1, 1);
  fill(15, 25, 10, 1, 1);
  fill(15, 27, 6, 1, 1);
  fill(25, 16, 5, 1, 1);
});

/* ---------- Componente do canvas ---------- */
const PixelCanvas = ({ grid }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let size = 0;

    const mouse = { x: -999, y: -999 };

    const resize = () => {
      const w = canvas.parentElement.clientWidth;
      const dpr = window.devicePixelRatio || 1;
      size = w;
      canvas.width = w * dpr;
      canvas.height = w * dpr;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${w}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    };
    const onLeave = () => {
      mouse.x = -999;
      mouse.y = -999;
    };
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onMove);
    canvas.addEventListener("pointerleave", onLeave);
    canvas.addEventListener("pointerup", onLeave);

    const total = COLS * ROWS;
    const cur = new Float32Array(total);
    const delay = new Float32Array(total);
    const heat = new Float32Array(total);
    const levels = [0, 0.35, 0.65, 1];
    const maxD = Math.hypot(COLS, ROWS);
    const RADIUS = 3.5;

    // onda de entrada: começa no canto inferior direito
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        delay[r * COLS + c] =
          (Math.hypot(COLS - c, ROWS - r) / maxD) * 1100 + Math.random() * 200;

    let t0 = null;

    const loop = (now) => {
      if (t0 === null) t0 = now;
      const cell = size / COLS;
      const gap = cell * 0.16;
      const s = cell - gap;

      // cores de destaque do tema atual (roxo escuro / laranja claro)
      const [pr, pg, pb] = pixelPalette().accent;
      const [hr, hg, hb] = pixelPalette().hover;
      const offColor = `rgba(${pixelPalette().off.join(",")},0.05)`;

      const mc = mouse.x / cell;
      const mr = mouse.y / cell;
      const scanRow = ((now / 70) % (ROWS + 14)) - 7;

      ctx.clearRect(0, 0, size, size);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          const target = levels[grid[r][c]];
          if (now - t0 >= delay[i]) cur[i] += (target - cur[i]) * 0.12;

          const d = Math.hypot(c + 0.5 - mc, r + 0.5 - mr);
          const near = d < RADIUS ? (1 - d / RADIUS) ** 2 : 0;
          heat[i] = Math.max(heat[i] * 0.93, near);
          const h = heat[i];

          let b = cur[i];
          if (b > 0.05) {
            b *= 0.88 + 0.12 * Math.sin(now / 450 + i * 1.7);
            const scan = Math.max(0, 1 - Math.abs(r - scanRow) / 3);
            b = Math.min(1, b + scan * 0.5);
          }
          b = Math.min(1, Math.max(b, h * 0.85) + h * 0.25);

          const cr = Math.round(pr + (hr - pr) * h);
          const cg = Math.round(pg + (hg - pg) * h);
          const cb = Math.round(pb + (hb - pb) * h);

          ctx.fillStyle = b < 0.03 ? offColor : `rgba(${cr},${cg},${cb},${0.15 + 0.85 * b})`;

          const s2 = s * (1 + h * 0.4);
          const x = c * cell + cell / 2 - s2 / 2;
          const y = r * cell + cell / 2 - s2 / 2;

          ctx.beginPath();
          ctx.roundRect(x, y, s2, s2, s2 * 0.28);
          ctx.fill();
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
      canvas.removeEventListener("pointerup", onLeave);
    };
  }, [grid]);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-2 p-4">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

/* ---------- Card de experiência (expansível) ---------- */
const ExperienceCard = ({ item, idx, open, onToggle }) => (
  <div
    className={`rounded-2xl border bg-surface transition-colors ${
      open ? "border-accent/50" : "border-white/10 hover:border-accent/30"
    }`}
  >
    <button
      onClick={onToggle}
      aria-expanded={open}
      className="w-full flex items-start gap-4 p-5 text-left"
    >
      {/* nó */}
      <span
        className={`mt-1 shrink-0 w-[22px] h-[22px] rounded-md border ${
          item.current
            ? "bg-accent border-accent shadow-[0_0_14px_rgb(var(--accent-rgb)/0.55)]"
            : "bg-accent/25 border-accent/60"
        }`}
      />

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h3 className="text-white font-bold text-[18px] sm:text-[20px] leading-tight">
            {t(`experience.items.${idx}.title`)}
          </h3>
          {item.current && (
            <span className="font-mono text-[11px] text-accent-soft border border-accent/50 rounded-full px-2 py-0.5">
              {t("experience.current")}
            </span>
          )}
        </div>
        <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="text-accent-soft font-semibold text-[15px]">
            {item.org}
          </span>
          <span className="font-mono text-[12px] text-gray-500">
            {t(`experience.items.${idx}.period`)}
          </span>
        </div>
      </div>

      {/* seta */}
      <motion.span
        animate={{ rotate: open ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="mt-1 shrink-0 text-gray-400"
        aria-hidden
      >
        ▾
      </motion.span>
    </button>

    <AnimatePresence initial={false}>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="overflow-hidden"
        >
          <div className="px-5 pb-5 pl-[58px]">
            <ul className="space-y-2">
              {item.bullets.map((b, j) => (
                <li
                  key={b}
                  className="relative pl-4 text-secondary text-[15px] leading-[26px] before:content-[''] before:absolute before:left-0 before:top-[11px] before:w-1.5 before:h-1.5 before:rounded-full before:bg-accent/60"
                >
                  {t(`experience.items.${idx}.bullets.${j}`)}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {item.tags.map((tg) => (
                <Tag key={tg}>{tg}</Tag>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/* ---------- Aba: Experiência ---------- */
const ExperienceTab = () => {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {experiences.map((item, i) => (
        <ExperienceCard
          key={`${item.title}-${item.period}`}
          item={item}
          idx={i}
          open={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
};

/* ---------- Aba: Formação ---------- */
const EducationTab = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {education.map((item, i) => (
        <div
          key={item.title}
          className={`rounded-2xl border bg-surface p-5 transition-colors ${
            item.current
              ? "border-accent/50"
              : "border-white/10 hover:border-accent/30"
          }`}
        >
          <div className="flex items-center justify-between gap-3">
            <span className="font-mono text-[12px] text-gray-500">
              {t(`experience.education.${i}.degree`)}
            </span>
            {item.current ? (
              <span className="font-mono text-[11px] text-accent-soft border border-accent/50 rounded-full px-2 py-0.5">
                {t("experience.inProgress")}
              </span>
            ) : (
              <span className="font-mono text-[11px] text-gray-400 border border-white/15 rounded-full px-2 py-0.5">
                {t("experience.completed")}
              </span>
            )}
          </div>
          <h3 className="mt-3 text-white font-bold text-[18px] leading-snug">
            {t(`experience.education.${i}.title`)}
          </h3>
          <p className="mt-2 text-accent-soft font-semibold text-[15px]">
            {item.org}
          </p>
          <p className="mt-1 font-mono text-[12px] text-gray-500">
            {t(`experience.education.${i}.period`)}
          </p>
        </div>
      ))}
    </div>

    {/* Idiomas */}
    <div className="rounded-2xl border border-white/10 bg-surface p-5">
      <h3 className="text-white font-bold text-[18px]">{t("experience.languagesTitle")}</h3>
      <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {languages.map((l, i) => (
          <div
            key={l.name}
            className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-surface-2 px-4 py-3"
          >
            <p className="text-white text-[15px] font-semibold">
              {t(`experience.languages.${i}.name`)}
            </p>
            <Tag>{t(`experience.languages.${i}.level`)}</Tag>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ---------- Seção ---------- */
const Experience = () => {
  useLanguage(); // re-renderiza quando o idioma muda
  const [tab, setTab] = useState("exp");

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
      {/* Esquerda: animação + legenda */}
      <motion.div
        variants={fadeIn("right", "spring", 0.2, 0.9)}
        className="lg:sticky lg:top-24"
      >
        <PixelCanvas grid={gitGraph} />

        <div className="mt-5 rounded-2xl border border-white/10 bg-surface-2 px-5 py-4 font-mono text-[14px]">
          <span style={{ color: ACCENT }}>HEAD</span>
          <p className="mt-1">
            <span className="text-gray-400">merge:</span>{" "}
            <span className="text-white">{t("experience.mergeText")}</span>
          </p>
        </div>
      </motion.div>

      {/* Direita */}
      <div>
        <motion.div variants={textVariant()}>
          <div className="flex items-center gap-3 font-mono text-[14px]">
            <span style={{ color: ACCENT }}>{t("experience.label")}</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{
                    background: i % 3 === 2 ? "#6b7280" : ACCENT,
                    opacity: 0.25 + ((i * 41) % 75) / 100,
                  }}
                />
              ))}
            </div>
          </div>
          <h2 className="mt-3 text-white font-black tracking-tight text-[40px] sm:text-[56px] leading-[1.05]">
            {t("experience.title")}
          </h2>
        </motion.div>

        <motion.div variants={fadeIn("up", "spring", 0.2, 0.75)}>
          {/* Abas */}
          <div
            role="tablist"
            className="mt-8 inline-flex rounded-full border border-white/10 bg-surface-2 p-1"
          >
            {tabs.map((tb) => (
              <button
                key={tb.id}
                role="tab"
                aria-selected={tab === tb.id}
                onClick={() => setTab(tb.id)}
                className="relative px-5 py-2 rounded-full text-[14px] font-semibold transition-colors"
              >
                {tab === tb.id && (
                  <motion.span
                    layoutId="exp-tab-pill"
                    className="absolute inset-0 rounded-full bg-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 32 }}
                  />
                )}
                <span
                  className={`relative ${
                    tab === tb.id ? "text-[#0d1117]" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {t(`experience.tabs.${tb.id}`)}
                </span>
              </button>
            ))}
          </div>

          {/* Conteúdo da aba */}
          <div className="mt-5">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={tab}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                {tab === "exp" ? <ExperienceTab /> : <EducationTab />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SectionWrapper(Experience, "experience");