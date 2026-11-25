import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";

const PURPLE = "#a78bfa"; // roxo claro

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

/* ---------- Pilha de stacks ----------
   x / y   = posição inicial aproximada (em % do container quadrado)
   r       = rotação inicial em graus
   bg      = fundo do card (cor ou gradiente CSS)
   sources = ícones em ordem de tentativa (se um falhar, tenta o próximo):
             "si:slug"   -> Simple Icons, ícone branco (simpleicons.org)
             "dev:caminho"  -> Devicon, forçado para branco (devicon.dev)
             "devc:caminho" -> Devicon, colorido original
   custom  = desenho próprio em SVG (usado na AWS)
   Para trocar/adicionar tecnologia, basta editar esta lista. */
const TILE_SIZE = 20; // % da largura do container

const iconUrl = (source) => {
  const [kind, path] = source.split(":");
  if (kind === "si") return `https://cdn.simpleicons.org/${path}/white`;
  return `https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/${path}.svg`;
};
const iconFilter = (source) =>
  source.startsWith("dev:") ? "brightness(0) invert(1)" : "none";

const stacks = [
  { name: "Java", sources: ["dev:java/java-plain", "si:openjdk", "devc:java/java-original"], bg: "linear-gradient(145deg,#ffa63d,#e5610a)", x: 12, y: 87, r: -8 },
  { name: "Docker", sources: ["si:docker", "devc:docker/docker-original"], bg: "linear-gradient(145deg,#38c6f4,#0a8fd0)", x: 34, y: 88, r: 6 },
  { name: "GitHub Actions", sources: ["si:githubactions", "devc:githubactions/githubactions-original"], bg: "linear-gradient(145deg,#8b5cf6,#5b2fc9)", x: 56, y: 87, r: -5 },
  // { name: "Redis", sources: ["si:redis"], bg: "linear-gradient(145deg,#f0524a,#c2271f)", x: 78, y: 88, r: 10 },
  { name: "Apache Kafka", sources: ["si:apachekafka", "devc:apachekafka/apachekafka-original"], bg: "linear-gradient(145deg,#3b3f5c,#1b1d2e)", x: 22, y: 69, r: 5 },
  { name: "PostgreSQL", sources: ["si:postgresql", "devc:postgresql/postgresql-original"], bg: "linear-gradient(145deg,#4f7cb5,#2d4f80)", x: 44, y: 69, r: -7 },
  { name: "MongoDB", sources: ["si:mongodb", "devc:mongodb/mongodb-original"], bg: "linear-gradient(145deg,#1f8a4c,#0d4f2c)", x: 66, y: 68, r: 9 },
  { name: "Spring Boot", sources: ["si:springboot", "si:spring", "devc:spring/spring-original"], bg: "linear-gradient(145deg,#8fd14f,#4f9a24)", x: 87, y: 69, r: -10 },
  { name: "React", sources: ["si:react", "devc:react/react-original"], bg: "linear-gradient(145deg,#19b5d9,#0a7396)", x: 30, y: 51, r: -6 },
  { name: "TypeScript", sources: ["si:typescript", "devc:typescript/typescript-original"], bg: "linear-gradient(145deg,#4a90e2,#2563b8)", x: 53, y: 50, r: 8 },
  { name: "AWS", custom: "aws", bg: "linear-gradient(145deg,#334357,#18222f)", x: 76, y: 50, r: -4 },
  { name: "GCP", sources: ["si:googlecloud", "devc:googlecloud/googlecloud-original"], bg: "linear-gradient(145deg,#f4685a,#d03427)", x: 42, y: 33, r: 6 },
  { name: "JUnit", sources: ["si:junit5", "devc:junit/junit-original"], bg: "linear-gradient(145deg,#f0508a,#c21f5e)", x: 53, y: 15, r: 4 },
];

/* Logo da AWS desenhado em SVG: "aws" + sorriso laranja com seta */
const AwsLogo = () => (
  <svg viewBox="0 0 64 44" className="h-[62%] w-[62%]" aria-hidden="true">
    <text
      x="32"
      y="24"
      textAnchor="middle"
      fontFamily="'Trebuchet MS', 'Segoe UI', Arial, sans-serif"
      fontWeight="800"
      fontSize="25"
      letterSpacing="-0.5"
      fill="#ffffff"
    >
      aws
    </text>
    <path
      d="M11 30 Q32 42 52 28.5"
      fill="none"
      stroke="#ff9900"
      strokeWidth="3.2"
      strokeLinecap="round"
    />
    <polygon points="49,23.6 57,25 51.6,31.6" fill="#ff9900" />
  </svg>
);

/* ---------- Física da pilha ----------
   Coordenadas normalizadas: a largura do container = 1.
   Cada card é tratado como um círculo na colisão.
   Ajuste o "peso" nas constantes abaixo. */
const HALF = TILE_SIZE / 200; // meia largura do card (0.1)
const R = HALF * 0.94; // raio de colisão
const GRAVITY = 6; // maior = cai mais rápido / mais pesado
const MAX_V = 2.2; // velocidade máxima de qualquer card
const BOUNCE = 0.1; // quique nas paredes e no chão (0 = nenhum)
const FLOOR_FRICTION = 0.88; // quanto menor, mais "agarra" no chão
const CONTACT_FRICTION = 0.35; // atrito entre cards
const SPIN_DAMPING = 0.93; // giro some rápido
const DRAG_FOLLOW = 0.25; // card arrastado segue o mouse com "inércia"
const DRAG_PUSH = 0.5; // força com que o card arrastado empurra os outros
const THROW = 0.5; // quanto da velocidade vira arremesso ao soltar
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const createBodies = () =>
  stacks.map((s, i) => ({
    x: s.x / 100 + (Math.random() - 0.5) * 0.05,
    y: -0.25 - i * 0.14, // começam acima e caem em sequência
    vx: 0,
    vy: 0,
    a: s.r + (Math.random() - 0.5) * 24,
    av: 0,
    entered: false,
  }));

const step = (bodies, drag, dt) => {
  bodies.forEach((b, i) => {
    if (drag && drag.i === i) {
      // card segurado segue o ponteiro com um pouco de inércia
      const nx = clamp(b.x + (drag.tx - b.x) * DRAG_FOLLOW, R, 1 - R);
      const ny = clamp(b.y + (drag.ty - b.y) * DRAG_FOLLOW, R, 1 - R);
      b.vx = b.vx * 0.6 + ((nx - b.x) / dt) * 0.4;
      b.vy = b.vy * 0.6 + ((ny - b.y) / dt) * 0.4;
      b.x = nx;
      b.y = ny;
      b.av *= 0.9;
      b.entered = true;
      return;
    }

    b.vy += GRAVITY * dt;
    b.vx *= 0.995;
    b.vx = clamp(b.vx, -MAX_V, MAX_V);
    b.vy = clamp(b.vy, -MAX_V * 1.5, MAX_V * 1.5);
    b.x += b.vx * dt;
    b.y += b.vy * dt;
    if (b.y > R) b.entered = true;

    // paredes, chão e teto
    if (b.x < R) {
      b.x = R;
      b.vx = Math.abs(b.vx) * BOUNCE;
    } else if (b.x > 1 - R) {
      b.x = 1 - R;
      b.vx = -Math.abs(b.vx) * BOUNCE;
    }
    if (b.y > 1 - R) {
      b.y = 1 - R;
      b.vy = Math.abs(b.vy) > 0.6 ? -Math.abs(b.vy) * BOUNCE : 0;
      b.vx *= FLOOR_FRICTION;
      if (Math.abs(b.vx) < 0.02) b.vx = 0;
      b.av += ((b.vx / R) * 57.3 - b.av) * 0.1; // rolando no chão
    }
    if (b.entered && b.y < R) {
      b.y = R;
      b.vy = Math.abs(b.vy) * 0.2;
    }

    b.a += b.av * dt;
    b.av *= SPIN_DAMPING;
  });

  // colisões entre cards
  for (let it = 0; it < 3; it++) {
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d2 = dx * dx + dy * dy;
        const min = R * 2;
        if (d2 >= min * min || d2 < 1e-9) continue;

        const d = Math.sqrt(d2);
        const nx = dx / d;
        const ny = dy / d;
        const aDrag = drag && drag.i === i;
        const bDrag = drag && drag.i === j;
        const wa = aDrag ? 0 : 1;
        const wb = bDrag ? 0 : 1;
        const sum = wa + wb;
        if (sum === 0) continue;

        // correção de posição limitada: o card arrastado empurra os outros
        // devagar, em vez de arremessá-los
        const ov = Math.min(min - d, 0.02);
        a.x -= (nx * ov * wa) / sum;
        a.y -= (ny * ov * wa) / sum;
        b.x += (nx * ov * wb) / sum;
        b.y += (ny * ov * wb) / sum;

        const rvx = b.vx - a.vx;
        const rvy = b.vy - a.vy;
        const vn = rvx * nx + rvy * ny;
        if (vn < 0) {
          const k = aDrag || bDrag ? DRAG_PUSH : 1;
          const jn = (-vn / sum) * k; // sem quique entre cards
          a.vx -= jn * wa * nx;
          a.vy -= jn * wa * ny;
          b.vx += jn * wb * nx;
          b.vy += jn * wb * ny;
        }

        // atrito: cards não escorregam facilmente uns nos outros
        const vt = rvx * -ny + rvy * nx;
        const jt = (-vt * CONTACT_FRICTION) / sum;
        a.vx -= jt * wa * -ny;
        a.vy -= jt * wa * nx;
        b.vx += jt * wb * -ny;
        b.vy += jt * wb * nx;
        a.av += jt * 6 * wa;
        b.av += jt * 6 * wb;
      }
    }
  }
};

const StackPile = () => {
  const boxRef = useRef(null);
  const outerRefs = useRef([]);
  const tileRefs = useRef([]);
  const bodiesRef = useRef([]);
  const dragRef = useRef(null);
  const [hovered, setHovered] = useState(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const box = boxRef.current;
    let W = box.clientWidth;
    const ro = new ResizeObserver(() => {
      W = box.clientWidth;
      render();
    });
    ro.observe(box);

    const bodies = createBodies();
    bodiesRef.current = bodies;

    function render() {
      bodies.forEach((b, i) => {
        const o = outerRefs.current[i];
        const t = tileRefs.current[i];
        if (!o || !t) return;
        o.style.transform = `translate3d(${(b.x - HALF) * W}px, ${(b.y - HALF) * W}px, 0)`;
        t.style.transform = `rotate(${b.a}deg)`;
      });
    }

    // com "reduzir movimento": já começa assentado, sem a queda
    if (reduceMotion) {
      for (let k = 0; k < 900; k++) step(bodies, null, 1 / 120);
    }
    render();

    let raf = 0;
    let last = 0;
    const frame = (t) => {
      const dt = Math.min(0.033, (t - last) / 1000 || 0.016);
      last = t;
      step(bodies, dragRef.current, dt / 2);
      step(bodies, dragRef.current, dt / 2);
      render();
      raf = requestAnimationFrame(frame);
    };

    // só simula enquanto a seção está visível
    const io = new IntersectionObserver(
      ([entry]) => {
        cancelAnimationFrame(raf);
        if (entry.isIntersecting) {
          last = performance.now();
          raf = requestAnimationFrame(frame);
        }
      },
      { threshold: 0.2 }
    );
    io.observe(box);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
    };
  }, [reduceMotion]);

  const toLocal = (e) => {
    const rect = boxRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.width,
    };
  };

  const onTilePointerDown = (e, i) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    const b = bodiesRef.current[i];
    const p = toLocal(e);
    dragRef.current = { i, ox: b.x - p.x, oy: b.y - p.y, tx: b.x, ty: b.y };
    b.vx = 0;
    b.vy = 0;
    e.currentTarget.style.zIndex = 50;
    setHovered(i);
  };

  const onTilePointerMove = (e, i) => {
    const d = dragRef.current;
    if (!d || d.i !== i) return;
    const p = toLocal(e);
    d.tx = p.x + d.ox;
    d.ty = p.y + d.oy;
  };

  const onTilePointerUp = (e, i) => {
    const d = dragRef.current;
    if (!d || d.i !== i) return;
    const b = bodiesRef.current[i];
    b.vx = clamp(b.vx * THROW, -1.2, 1.2); // arremesso suave
    b.vy = clamp(b.vy * THROW, -1.2, 1.2);
    dragRef.current = null;
    e.currentTarget.style.zIndex = "";
  };

  return (
    <div>
      <div className="rounded-2xl border border-white/10 bg-[#0d1117] p-5">
        <h3 className="text-white text-[20px] font-bold">Stacks</h3>

        {/* área quadrada onde a pilha cai e se mexe */}
        <div
          ref={boxRef}
          className="relative mt-2 w-full"
          style={{ aspectRatio: "1 / 1", clipPath: "inset(0 -24px -24px -24px)" }}
        >
          {stacks.map((item, i) => (
            <div
              key={item.name}
              ref={(el) => (outerRefs.current[i] = el)}
              onPointerDown={(e) => onTilePointerDown(e, i)}
              onPointerMove={(e) => onTilePointerMove(e, i)}
              onPointerUp={(e) => onTilePointerUp(e, i)}
              onPointerCancel={(e) => onTilePointerUp(e, i)}
              onPointerEnter={() => setHovered(i)}
              onPointerLeave={() => {
                if (!dragRef.current) setHovered(null);
              }}
              className="absolute left-0 top-0 cursor-grab active:cursor-grabbing select-none hover:z-40"
              style={{ width: `${TILE_SIZE}%`, aspectRatio: "1 / 1", touchAction: "none" }}
              aria-label={item.name}
            >
              {/* nome da stack no hover */}
              {hovered === i && (
                <span className="pointer-events-none absolute left-1/2 -top-8 -translate-x-1/2 whitespace-nowrap rounded-full bg-[#a78bfa] px-2.5 py-1 font-mono text-[11px] font-bold text-[#0d1117] shadow-lg">
                  {item.name}
                </span>
              )}

              <div className="h-full w-full transition-transform duration-200 hover:scale-105">
                <div
                  ref={(el) => (tileRefs.current[i] = el)}
                  className="flex h-full w-full items-center justify-center"
                  style={{
                    borderRadius: "24%",
                    background: item.bg,
                    border: "1px solid rgba(255,255,255,0.14)",
                    boxShadow:
                      "0 12px 24px -10px rgba(0,0,0,0.7), inset 0 1px 0 rgba(255,255,255,0.28)",
                  }}
                >
                  {item.custom === "aws" ? (
                    <AwsLogo />
                  ) : (
                    <>
                      <img
                        src={iconUrl(item.sources[0])}
                        alt={item.name}
                        draggable={false}
                        className="pointer-events-none h-[58%] w-[58%] object-contain"
                        style={{ filter: iconFilter(item.sources[0]) }}
                        onError={(e) => {
                          // tenta o próximo ícone; se acabar, mostra o nome
                          const el = e.currentTarget;
                          const next = Number(el.dataset.idx || 0) + 1;
                          if (next < item.sources.length) {
                            el.dataset.idx = next;
                            el.style.filter = iconFilter(item.sources[next]);
                            el.src = iconUrl(item.sources[next]);
                          } else {
                            el.style.display = "none";
                            if (el.nextSibling) el.nextSibling.style.display = "block";
                          }
                        }}
                      />
                      <span
                        style={{ display: "none" }}
                        className="px-1 text-center font-mono text-[10px] font-bold leading-tight text-white"
                      >
                        {item.name}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <p className="mt-3 font-mono text-[12px] text-gray-500">
        arraste os cards para mexer na pilha
      </p>
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

      {/* Abaixo: pilha de stacks à esquerda (40%) + skills à direita (60%) */}
      <div className="mt-12 grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
        <motion.div variants={fadeIn("right", "spring", 0.2, 0.9)}>
          <StackPile />
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