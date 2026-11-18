import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const PURPLE = "#a78bfa"; // roxo claro
const PURPLE_RGB = "167,139,250";
const HOVER_RGB = [233, 223, 255]; // cor dos pixels sob o mouse
const BASE_RGB = [167, 139, 250];
const COLS = 32;
const ROWS = 32;

/* Skills curadas:
   core  = tecnologias principais (destacadas em roxo)
   more  = complementares (cinza)
   study = em estudo (borda tracejada)
   Mantenha só o que você consegue defender numa entrevista. */
const skills = [
  {
    title: "Back-end",
    core: ["Java", "Spring Boot", "APIs REST", "Microsserviços"],
    more: ["Spring Security", "Spring Data JPA", "Spring Cloud", "JWT / OAuth2", "OpenAPI"],
  },
  {
    title: "Arquitetura e qualidade",
    core: ["Clean Architecture", "SOLID", "JUnit 5", "TDD"],
    more: ["Arquitetura Hexagonal", "Mockito", "Testcontainers", "Playwright"],
  },
  {
    title: "Dados e mensageria",
    core: ["PostgreSQL", "MongoDB", "Apache Kafka"],
    more: ["MySQL", "Redis", "RabbitMQ", "Flyway"],
  },
  {
    title: "Cloud e DevOps",
    core: ["AWS", "GCP", "Docker", "GitHub Actions"],
    more: ["Lambda", "S3", "ECS", "SQS", "API Gateway", "CloudWatch"],
  },
  {
    title: "Front-end",
    core: ["React", "TypeScript"],
    more: ["JavaScript", "Tailwind CSS", "React Query", "Zustand"],
  },
  {
    title: "Em estudo",
    study: ["IA generativa", "LLMs", "Agentes de IA", "Automação com IA"],
  },
];

const Tag = ({ children, variant = "more" }) => {
  const styles = {
    core: "text-white bg-[#a78bfa]/15 border-[#a78bfa]/50",
    more: "text-gray-300 bg-[#0d1117] border-white/10",
    study: "text-[#c4b5fd] bg-transparent border-dashed border-[#a78bfa]/50",
  };
  return (
    <span
      className={`font-mono text-[12px] font-semibold border rounded-full px-2.5 py-0.5 ${styles[variant]}`}
    >
      {children}
    </span>
  );
};

/* ---------- Desenho em pixels: banco de dados ----------
   0 = apagado, 1 = fraco, 2 = médio, 3 = forte */
const makeGrid = (draw) => {
  const g = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  const set = (x, y, v = 3) => {
    if (x >= 0 && x < COLS && y >= 0 && y < ROWS) g[y][x] = v;
  };
  draw({ set });
  return g;
};

const database = makeGrid(({ set }) => {
  const cx = 15.5, rx = 10.5, ry = 3.2;
  const left = 5, right = 26;

  const dyAt = (x) =>
    Math.round(ry * Math.sqrt(Math.max(0, 1 - ((x - cx) / rx) ** 2)));

  // arco da elipse: metade de cima e/ou de baixo
  const arc = (yc, upper, lower, v) => {
    for (let x = left; x <= right; x++) {
      const dy = dyAt(x);
      if (upper) set(x, yc - dy, v);
      if (lower) set(x, yc + dy, v);
    }
  };

  // tampa (elipse completa + preenchimento fraco)
  arc(8, true, true, 3);
  for (let x = left + 1; x < right; x++) {
    const dy = dyAt(x);
    for (let y = 8 - dy + 1; y < 8 + dy; y++) set(x, y, 1);
  }

  // laterais
  for (let y = 8; y <= 26; y++) {
    set(left, y, 2);
    set(right, y, 2);
  }

  // divisórias das camadas e base
  arc(14, false, true, 2);
  arc(20, false, true, 2);
  arc(26, false, true, 3);

  // traços de dados + LEDs em cada camada
  [13, 19, 25].forEach((y) => {
    for (let x = 9; x <= 14; x++) set(x, y, 1);
    set(22, y, 3);
  });
});

/* ---------- Componente do canvas ---------- */
const PixelDatabase = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let raf;
    let size = 0;

    // posição do mouse em pixels CSS dentro do canvas (fora = -999)
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
    const heat = new Float32Array(total); // intensidade do efeito de hover
    const levels = [0, 0.35, 0.65, 1];
    const maxD = Math.hypot(COLS, ROWS);
    const RADIUS = 3.5; // raio do efeito, em células

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

      // posição do mouse em coordenadas de célula
      const mc = mouse.x / cell;
      const mr = mouse.y / cell;

      // faixa de luz descendo (loop contínuo)
      const scanRow = ((now / 70) % (ROWS + 14)) - 7;

      ctx.clearRect(0, 0, size, size);

      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const i = r * COLS + c;
          const target = levels[database[r][c]];
          if (now - t0 >= delay[i]) cur[i] += (target - cur[i]) * 0.12;

          // hover: calcula proximidade e deixa o rastro decair
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
          // o hover acende até os pixels apagados
          b = Math.min(1, Math.max(b, h * 0.85) + h * 0.25);

          // cor: do roxo base para o roxo claro conforme o hover
          const cr = Math.round(BASE_RGB[0] + (HOVER_RGB[0] - BASE_RGB[0]) * h);
          const cg = Math.round(BASE_RGB[1] + (HOVER_RGB[1] - BASE_RGB[1]) * h);
          const cb = Math.round(BASE_RGB[2] + (HOVER_RGB[2] - BASE_RGB[2]) * h);

          ctx.fillStyle =
            b < 0.03
              ? "rgba(255,255,255,0.05)"
              : `rgba(${cr},${cg},${cb},${0.15 + 0.85 * b})`;

          // o pixel cresce um pouco sob o mouse
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
    <div>
      <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-4">
        <canvas ref={canvasRef} className="block" />
      </div>

      {/* Legenda */}
      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 font-mono text-[12px] text-gray-500">
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-[#a78bfa]/50 bg-[#a78bfa]/15" />
          uso principal
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-white/10 bg-[#0d1117]" />
          complementar
        </span>
        <span className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full border border-dashed border-[#a78bfa]/50" />
          em estudo
        </span>
      </div>
    </div>
  );
};

/* ---------- Seção ---------- */
const About = () => {
  return (
    <>
      {/* Topo: título + texto */}
      <motion.div variants={textVariant()}>
        <div className="flex items-center gap-3 font-mono text-[14px]">
          <span style={{ color: PURPLE }}>01 / sobre</span>
          <div className="flex gap-[3px]">
            {Array.from({ length: 18 }).map((_, i) => (
              <span
                key={i}
                className="w-[10px] h-[10px] rounded-[2px]"
                style={{
                  background: i % 3 === 0 ? "#6b7280" : PURPLE,
                  opacity: 0.25 + ((i * 37) % 75) / 100,
                }}
              />
            ))}
          </div>
        </div>
        <h2 className="mt-3 text-white font-black tracking-tight text-[40px] sm:text-[56px] leading-[1.05]">
          Visão Geral.
        </h2>
      </motion.div>

      <motion.p
        variants={fadeIn("", "", 0.1, 1)}
        className="mt-4 text-secondary text-[17px] leading-[30px] max-w-4xl"
      >
        Desenvolvedor Fullstack Júnior com foco em Back-end, atuando com Java,
        Spring Boot, React e TypeScript. Projeto e desenvolvo APIs REST e
        microsserviços escaláveis, com mensageria, MongoDB e AWS, aplicando
        boas práticas de engenharia e orientando as soluções às necessidades do
        negócio. Atualmente, aprofundo meus estudos em IA aplicada ao
        desenvolvimento, explorando como ela pode aprimorar a qualidade e a
        eficiência das soluções que entrego.
      </motion.p>

      {/* Abaixo: animação à esquerda (40%) + skills à direita (60%) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
        <motion.div variants={fadeIn("right", "spring", 0.2, 0.9)}>
          <PixelDatabase />
        </motion.div>

        <motion.div variants={fadeIn("up", "spring", 0.2, 0.75)}>
          {/* Skills em lista compacta com hierarquia */}
          <div className="rounded-2xl border border-white/10 bg-[#151a22] overflow-hidden">
            {skills.map((item) => (
              <div
                key={item.title}
                className="group flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-6 px-5 py-4 border-t border-white/10 first:border-t-0 hover:bg-white/[0.02] transition-colors"
              >
                <h3 className="sm:w-44 shrink-0 text-white text-[16px] font-bold sm:pt-[3px] group-hover:text-[#a78bfa] transition-colors">
                  {item.title}
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {item.core?.map((tag) => (
                    <Tag key={tag} variant="core">{tag}</Tag>
                  ))}
                  {item.more?.map((tag) => (
                    <Tag key={tag} variant="more">{tag}</Tag>
                  ))}
                  {item.study?.map((tag) => (
                    <Tag key={tag} variant="study">{tag}</Tag>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default SectionWrapper(About, "about");