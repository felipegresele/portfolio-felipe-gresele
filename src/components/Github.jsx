import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import useGithubData, { GITHUB_USERNAME as USERNAME } from "../api/UseGitHubData";

const PURPLE = "#a78bfa"; // roxo claro
const HOVER_RGB = [233, 223, 255];
const BASE_RGB = [167, 139, 250];
const COLS = 32;
const ROWS = 32;

/* ---------- Helpers ---------- */
const parseDate = (s) => new Date(`${s}T00:00:00`);
const fmtDay = (s) =>
  parseDate(s).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
const fmtMonth = (s) =>
  new Date(s).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
const fmtMonthShort = (s) =>
  parseDate(s).toLocaleDateString("pt-BR", { month: "short", year: "numeric" }).replace(".", "");
const fmtNumber = (n) => new Intl.NumberFormat("pt-BR").format(n);

const computeStats = (days) => {
  const active = days.filter((d) => d.count > 0).length;

  let longest = 0;
  let run = 0;
  days.forEach((d) => {
    if (d.count > 0) {
      run += 1;
      longest = Math.max(longest, run);
    } else run = 0;
  });

  // sequência atual: se hoje ainda está zerado, não quebra a sequência
  let current = 0;
  let i = days.length - 1;
  if (i >= 0 && days[i].count === 0) i -= 1;
  while (i >= 0 && days[i].count > 0) {
    current += 1;
    i -= 1;
  }

  const best = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);
  return { active, longest, current, best };
};

// soma das contribuições dos últimos 7 meses (para o gráfico de pixels)
const monthlyTotals = (days, months = 7) => {
  const map = new Map();
  days.forEach((d) => {
    const key = d.date.slice(0, 7);
    map.set(key, (map.get(key) || 0) + d.count);
  });
  return Array.from(map.values()).slice(-months);
};

/* ---------- Desenho em pixels: gráfico de barras ----------
   0 = apagado, 1 = fraco, 2 = médio, 3 = forte */
const buildChartGrid = (values) => {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const set = (x, y, v = 3) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y][x] = v;
  };
  const fill = (x, y, w, h, v = 3) => {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) set(x + i, y + j, v);
  };
  const frame = (x, y, w, h, v = 2) => {
    for (let i = 0; i < w; i++) {
      set(x + i, y, v);
      set(x + i, y + h - 1, v);
    }
    for (let j = 0; j < h; j++) {
      set(x, y + j, v);
      set(x + w - 1, y + j, v);
    }
  };

  frame(3, 4, 26, 24, 2);
  fill(6, 6, 9, 1, 3); // "título"
  fill(6, 8, 5, 1, 1);
  fill(5, 26, 22, 1, 1); // linha de base

  const max = Math.max(...values, 1);
  values.forEach((v, i) => {
    const h = Math.max(2, Math.round((v / max) * 16));
    const x = 7 + i * 3;
    fill(x, 25 - h + 1, 2, h, i === values.length - 1 ? 3 : 2);
  });
  return g;
};

const placeholderValues = [4, 7, 5, 9, 6, 11, 8];

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

          const cr = Math.round(BASE_RGB[0] + (HOVER_RGB[0] - BASE_RGB[0]) * h);
          const cg = Math.round(BASE_RGB[1] + (HOVER_RGB[1] - BASE_RGB[1]) * h);
          const cb = Math.round(BASE_RGB[2] + (HOVER_RGB[2] - BASE_RGB[2]) * h);

          ctx.fillStyle =
            b < 0.03
              ? "rgba(255,255,255,0.05)"
              : `rgba(${cr},${cg},${cb},${0.15 + 0.85 * b})`;

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
    <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
      <canvas ref={canvasRef} className="block" />
    </div>
  );
};

/* ---------- Calendário de contribuições (SVG responsivo) ---------- */
const LEVEL_FILL = [
  "rgba(255,255,255,0.06)",
  "rgba(167,139,250,0.30)",
  "rgba(167,139,250,0.55)",
  "rgba(167,139,250,0.80)",
  "rgba(196,181,253,1)",
];

const Heatmap = ({ days, onHover }) => {
  const SIZE = 11;
  const GAP = 3;
  const STEP = SIZE + GAP;

  const offset = parseDate(days[0].date).getDay(); // 0 = domingo
  const weeks = Math.ceil((days.length + offset) / 7);
  const width = weeks * STEP - GAP;
  const height = 7 * STEP - GAP;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-auto block"
      role="img"
      aria-label="Calendário de contribuições dos últimos 12 meses"
      onMouseLeave={() => onHover(null)}
    >
      {days.map((d, i) => {
        const idx = i + offset;
        const col = Math.floor(idx / 7);
        const row = idx % 7;
        return (
          <rect
            key={d.date}
            x={col * STEP}
            y={row * STEP}
            width={SIZE}
            height={SIZE}
            rx={2.5}
            fill={LEVEL_FILL[d.level] ?? LEVEL_FILL[0]}
            onMouseEnter={() => onHover(d)}
            className="transition-opacity hover:opacity-70"
          />
        );
      })}
    </svg>
  );
};

/* ---------- Cards pequenos ---------- */
const StatBox = ({ value, label, className = "" }) => (
  <div className={`p-5 ${className}`}>
    <p className="text-white font-bold text-[26px] leading-none">{value}</p>
    <p className="mt-2 text-gray-500 text-[13px]">{label}</p>
  </div>
);

const RepoCard = ({ repo }) => (
  <a
    href={repo.html_url}
    target="_blank"
    rel="noreferrer"
    className="block rounded-2xl border border-white/10 bg-[#151a22] p-5 hover:border-[#a78bfa]/50 transition-colors"
  >
    <p className="font-mono text-[15px] font-semibold text-[#c4b5fd] truncate">
      {repo.name}
    </p>
    <p className="mt-3 font-mono text-[12px] text-gray-500">
      {repo.language || "—"} · ★ {repo.stargazers_count} ·{" "}
      {fmtMonth(repo.pushed_at)}
    </p>
  </a>
);

/* ---------- Seção ---------- */
const Github = () => {
  const { data, status } = useGithubData();
  const [hovered, setHovered] = useState(null);

  const stats = useMemo(() => (data ? computeStats(data.days) : null), [data]);
  const grid = useMemo(
    () => buildChartGrid(data ? monthlyTotals(data.days) : placeholderValues),
    [data]
  );

  const lastDay = data?.days[data.days.length - 1];
  const firstDay = data?.days[0];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
      {/* Esquerda: gráfico em pixels + legenda */}
      <motion.div
        variants={fadeIn("right", "spring", 0.2, 0.9)}
        className="lg:sticky lg:top-24"
      >
        <PixelCanvas grid={grid} />

        <div className="mt-5 rounded-2xl border border-white/10 bg-[#0d1117] px-5 py-4 font-mono text-[14px]">
          <div className="flex justify-between">
            <span style={{ color: PURPLE }}>@{USERNAME}</span>
            <span className="text-gray-500">últimos 7 meses</span>
          </div>
          <p className="mt-1">
            <span className="text-gray-400">chore(github):</span>{" "}
            <span className="text-white">
              {status === "ok"
                ? "sincronizado com o GitHub"
                : status === "error"
                ? "falha ao sincronizar"
                : "sincronizando..."}
            </span>
          </p>
        </div>
      </motion.div>

      {/* Direita */}
      <div>
        <motion.div variants={textVariant()}>
          <div className="flex items-center gap-3 font-mono text-[14px]">
            <span style={{ color: PURPLE }}>04 / github</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{
                    background: i % 4 === 1 ? "#6b7280" : PURPLE,
                    opacity: 0.25 + ((i * 29) % 75) / 100,
                  }}
                />
              ))}
            </div>
          </div>
          <h2 className="mt-3 text-white font-black tracking-tight text-[40px] sm:text-[56px] leading-[1.05]">
            Atividade no GitHub
          </h2>
          <span className="mt-4 inline-block font-mono text-[12px] text-gray-400 border border-dashed border-white/20 rounded-md px-2 py-1">
            dados reais · API do GitHub
          </span>
        </motion.div>

        <motion.div variants={fadeIn("up", "spring", 0.2, 0.75)} className="mt-8">
          {status === "loading" && (
            <div className="rounded-2xl border border-white/10 bg-[#151a22] p-8 font-mono text-[14px] text-gray-400 animate-pulse">
              carregando dados do GitHub...
            </div>
          )}

          {status === "error" && (
            <div className="rounded-2xl border border-white/10 bg-[#151a22] p-8">
              <p className="text-white font-semibold">
                Não foi possível carregar os dados agora.
              </p>
              <p className="mt-2 text-secondary text-[15px]">
                A API do GitHub pode ter atingido o limite de requisições. Tente
                novamente em alguns minutos ou veja direto no perfil.
              </p>
              <a
                href={`https://github.com/${USERNAME}`}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-block rounded-full bg-[#a78bfa] hover:bg-[#8b5cf6] text-[#0d1117] font-semibold text-[14px] px-4 py-2 transition-colors"
              >
                Abrir perfil no GitHub
              </a>
            </div>
          )}

          {status === "ok" && data && stats && (
            <>
              {/* Total + 4 métricas */}
              <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                <div className="shrink-0">
                  <p className="font-black tracking-tight text-[64px] sm:text-[84px] leading-none text-[#a78bfa]">
                    {fmtNumber(data.total)}
                  </p>
                  <p className="mt-2 text-secondary text-[16px]">
                    contribuições no último ano
                  </p>
                </div>

                <div className="flex-1 grid grid-cols-2 rounded-2xl border border-white/10 bg-[#151a22] overflow-hidden">
                  <StatBox
                    value={stats.active}
                    label="dias ativos"
                    className="border-r border-b border-white/10"
                  />
                  <StatBox
                    value={stats.current}
                    label="sequência atual"
                    className="border-b border-white/10"
                  />
                  <StatBox
                    value={stats.longest}
                    label="maior sequência"
                    className="border-r border-white/10"
                  />
                  <StatBox
                    value={stats.best.count}
                    label={`melhor dia · ${fmtDay(stats.best.date)}`}
                  />
                </div>
              </div>

              {/* Calendário */}
              <div className="mt-6 rounded-2xl border border-white/10 bg-[#151a22] p-5 sm:p-6">
                <Heatmap days={data.days} onHover={setHovered} />

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 font-mono text-[12px] text-gray-500">
                  <span>
                    {hovered
                      ? `${hovered.count} contribuições · ${fmtDay(hovered.date)}`
                      : `${fmtMonthShort(firstDay.date)} — ${fmtMonthShort(
                          lastDay.date
                        )}`}
                  </span>
                  <span className="flex items-center gap-1.5">
                    menos
                    {LEVEL_FILL.map((c) => (
                      <span
                        key={c}
                        className="w-[11px] h-[11px] rounded-[3px]"
                        style={{ background: c }}
                      />
                    ))}
                    mais
                  </span>
                </div>
              </div>

              {/* Repositórios */}
              <div className="mt-8 flex items-center justify-between">
                <p className="font-mono text-[12px] tracking-widest text-gray-500 uppercase">
                  Repositórios atualizados recentemente
                </p>
                <a
                  href={`https://github.com/${USERNAME}?tab=repositories`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-[13px] text-[#c4b5fd] hover:text-white transition-colors"
                >
                  Ver todos no GitHub ↗
                </a>
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.repos.map((repo) => (
                  <RepoCard key={repo.id} repo={repo} />
                ))}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SectionWrapper(Github, "github");