import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

import { github } from "../assets";
import { SectionWrapper } from "../hoc";
import { projects } from "../constants";
import { fadeIn, textVariant } from "../utils/motion";
import { useLanguage, t } from "../i18n";
import { pixelPalette } from "../theme";

const ACCENT = "var(--section-label)"; // rótulos mono ("02 / projetos", 7c02e8d...): branco no escuro, quase preto no claro
const COLS = 32;
const ROWS = 32;
const PER_PAGE = 2; // projetos por página

const Tag = ({ children }) => (
  <span className="font-mono text-[12px] font-semibold text-white bg-accent/15 border border-accent/50 rounded-full px-2.5 py-0.5">
    {children}
  </span>
);

/* ---------- Desenho em pixels: janela de terminal ----------
   0 = apagado, 1 = fraco, 2 = médio, 3 = forte */
const makeGrid = (draw) => {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const set = (x, y, v = 3) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y][x] = v;
  };
  const fill = (x, y, w, h, v = 3) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v);
  };
  const frame = (x, y, w, h, v = 1) => {
    for (let i = 0; i < w; i++) {
      set(x + i, y, v);
      set(x + i, y + h - 1, v);
    }
    for (let j = 0; j < h; j++) {
      set(x, y + j, v);
      set(x + w - 1, y + j, v);
    }
  };
  draw({ set, fill, frame });
  return g;
};

const terminal = makeGrid(({ set, fill, frame }) => {
  frame(3, 4, 26, 24, 2); // janela
  fill(4, 5, 24, 3, 1); // barra de título
  set(5, 6, 3);
  set(7, 6, 2);
  set(9, 6, 2); // botões

  // prompt ">"
  for (let i = 0; i < 5; i++) {
    set(8 + i, 12 + i, 3);
    set(8 + i, 20 - i, 3);
  }
  fill(15, 20, 6, 1, 3); // cursor "_"

  // linhas de código
  fill(16, 11, 9, 1, 1);
  fill(16, 13, 6, 1, 1);
  fill(8, 23, 12, 1, 2);
  fill(8, 25, 8, 1, 1);
});

/* ---------- Componente do canvas ---------- */
const PixelTerminal = () => {
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
          const target = levels[terminal[r][c]];
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
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-surface-2 p-4">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

/* ---------- Card quadrado do projeto ---------- */
const ProjectThumb = ({ project, onSelect }) => (
  <button
    onClick={onSelect}
    className="group relative aspect-square overflow-hidden rounded-2xl border border-white/10 hover:border-accent/60 text-left transition-colors"
  >
    <img
      src={project.image}
      alt={project.name}
      className="w-full h-full object-cover opacity-80 transition-all duration-300 group-hover:scale-105 group-hover:opacity-100"
    />
    <div className="absolute inset-0 bg-gradient-to-t from-surface-2 via-surface-2/30 to-transparent" />

    <div className="absolute bottom-0 left-0 right-0 p-4">
      <p className="text-white font-bold text-[18px] leading-tight group-hover:text-accent-soft transition-colors">
        {project.name}
      </p>
      <p className="mt-1 font-mono text-[12px] text-gray-400 group-hover:text-accent transition-colors">
        {t("work.viewDetails")}
      </p>
    </div>
  </button>
);

/* ---------- Modal com as informações do projeto ---------- */
const ProjectModal = ({ project, onClose }) => {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);

    // trava a rolagem da página enquanto o modal está aberto
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  return createPortal(
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={project.name}
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 30, scale: 0.96 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-surface p-5 sm:p-6"
      >
        <button
          onClick={onClose}
          aria-label={t("work.close")}
          className="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-surface-2/80 border border-white/10 hover:border-accent/60 text-white flex items-center justify-center transition-colors"
        >
          ✕
        </button>

        <div className="w-full h-[200px] sm:h-[280px] overflow-hidden rounded-xl border border-white/10">
          <img
            src={project.image}
            alt={project.name}
            className="w-full h-full object-cover"
          />
        </div>

        <h3 className="mt-5 text-white font-black tracking-tight text-[26px] sm:text-[32px] leading-tight">
          {project.name}
        </h3>

        <p className="mt-3 text-secondary text-[15px] leading-[26px]">
          {t(`work.projectDescriptions.${project.name}`, undefined, project.description)}
        </p>

        <div className="mt-5 flex flex-wrap gap-1.5">
          {project.tags.map((tag) => (
            <Tag key={`${project.name}-${tag.name}`}>{tag.name}</Tag>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {project.source_code_link && (
            <a
              href={project.source_code_link}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-full bg-accent hover:bg-accent-deep text-[#0d1117] font-semibold text-[14px] px-4 py-2 transition-colors"
            >
              <img src={github} alt="github" className="w-4 h-4 object-contain" />
              {t("work.viewCode")}
            </a>
          )}
          {project.repository_link && (
            <a
              href={project.repository_link}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/15 hover:border-accent/60 text-white font-semibold text-[14px] px-4 py-2 transition-colors"
            >
              {t("work.repository")}
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>,
    document.body
  );
};

/* ---------- Seção ---------- */
const Works = () => {
  useLanguage(); // re-renderiza quando o idioma muda
  const [page, setPage] = useState(0);
  const [direction, setDirection] = useState(1);
  const [selected, setSelected] = useState(null); // projeto aberto no modal

  const totalPages = Math.max(1, Math.ceil(projects.length / PER_PAGE));
  const visible = projects.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);
  const pad = (n) => String(n).padStart(2, "0");

  const goTo = (next) => {
    if (next < 0 || next >= totalPages || next === page) return;
    setDirection(next > page ? 1 : -1);
    setPage(next);
  };

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
        {/* Esquerda: animação + legenda */}
        <motion.div
          variants={fadeIn("right", "spring", 0.2, 0.9)}
          className="lg:sticky lg:top-24"
        >
          <PixelTerminal />

          <div className="mt-5 rounded-2xl border border-white/10 bg-surface-2 px-5 py-4 font-mono text-[14px]">
            <div className="flex justify-between">
              <span style={{ color: ACCENT }}>7c02e8d</span>
              <span className="text-gray-500">
                {pad(page + 1)} / {pad(totalPages)}
              </span>
            </div>
            <p className="mt-1">
              <span className="text-gray-400">feat(projects):</span>{" "}
              <span className="text-white">
                {t("work.featured", { n: projects.length })}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Direita: título + projetos paginados */}
        <div>
          <motion.div variants={textVariant()}>
            <div className="flex items-center gap-3 font-mono text-[14px]">
              <span style={{ color: ACCENT }}>{t("work.label")}</span>
              <div className="flex gap-[3px]">
                {Array.from({ length: 18 }).map((_, i) => (
                  <span
                    key={i}
                    className="w-[10px] h-[10px] rounded-[2px]"
                    style={{
                      background: i % 3 === 1 ? "var(--sq-gray)" : `var(--sq-fill-${i % 3})`,
                      opacity: 0.25 + ((i * 53) % 75) / 100,
                    }}
                  />
                ))}
              </div>
            </div>
            <h2 className="mt-3 text-white font-black tracking-tight text-[40px] sm:text-[56px] leading-[1.05]">
              {t("work.title")}
            </h2>
          </motion.div>

          <motion.p
            variants={fadeIn("", "", 0.1, 1)}
            className="mt-4 text-secondary text-[17px] leading-[30px] max-w-3xl"
          >
            {t("work.intro")}
          </motion.p>

          {/* Projetos da página atual (2 por página) */}
          <motion.div variants={fadeIn("up", "spring", 0.2, 0.75)}>
            <div className="mt-8 overflow-hidden">
              <AnimatePresence mode="wait" initial={false} custom={direction}>
                <motion.div
                  key={page}
                  custom={direction}
                  initial={{ opacity: 0, x: direction * 40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -40 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                >
                  {visible.map((project) => (
                    <ProjectThumb
                      key={project.name}
                      project={project}
                      onSelect={() => setSelected(project)}
                    />
                  ))}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <span className="font-mono text-[13px] text-gray-500">
                  {t("work.pageOf", { n: pad(page + 1), total: pad(totalPages) })}
                </span>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {Array.from({ length: totalPages }).map((_, i) => (
                      <button
                        key={i}
                        onClick={() => goTo(i)}
                        aria-label={t("work.ariaPage", { n: i + 1 })}
                        className={`h-2 rounded-full transition-all ${
                          i === page
                            ? "w-6 bg-accent"
                            : "w-2 bg-white/20 hover:bg-white/40"
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => goTo(page - 1)}
                    disabled={page === 0}
                    aria-label={t("work.ariaPrev")}
                    className="w-10 h-10 rounded-full border border-white/10 text-white flex items-center justify-center hover:border-accent/60 transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => goTo(page + 1)}
                    disabled={page === totalPages - 1}
                    aria-label={t("work.ariaNext")}
                    className="w-10 h-10 rounded-full border border-white/10 text-white flex items-center justify-center hover:border-accent/60 transition-colors disabled:opacity-30 disabled:hover:border-white/10 disabled:cursor-not-allowed"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <ProjectModal
            key={selected.name}
            project={selected}
            onClose={() => setSelected(null)}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SectionWrapper(Works, "projects");