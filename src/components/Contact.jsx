import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import emailjs from "@emailjs/browser";

import { SectionWrapper } from "../hoc";
import { fadeIn, textVariant } from "../utils/motion";
import { useLanguage, t } from "../i18n";
import { pixelPalette } from "../theme";

const ACCENT = "var(--section-label)"; // rótulos mono ("02 / contato", origin...): branco no escuro, quase preto no claro
const COLS = 32;
const ROWS = 32;

const EMAIL = "felipehgresele@gmail.com";
const GITHUB_URL = "https://github.com/felipegresele";
const LINKEDIN_URL = "https://www.linkedin.com/in/felipe-gresele-3065a72a3/";

const EMAILJS_SERVICE = "service_n15sy5h";
const EMAILJS_TEMPLATE = "template_j88mcx1";
const EMAILJS_PUBLIC_KEY = "1UG3eHQ2jXgA1uypM";

const contactLinks = [
  { href: `mailto:${EMAIL}` },
  { href: LINKEDIN_URL },
  { href: GITHUB_URL },
];

/* ---------- Desenho em pixels: envelope ----------
   0 = apagado, 1 = fraco, 2 = médio, 3 = forte */
const makeGrid = (draw) => {
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
  draw({ set, fill, frame });
  return g;
};

const envelope = makeGrid(({ set, fill, frame }) => {
  frame(3, 8, 26, 17, 2); // corpo do envelope

  // aba em "V"
  for (let i = 0; i < 12; i++) {
    set(4 + i, 9 + i, 3);
    set(27 - i, 9 + i, 3);
  }

  // linhas de texto por baixo
  fill(7, 22, 7, 1, 1);
  fill(18, 22, 7, 1, 1);

  // notificação
  fill(25, 4, 4, 4, 3);
});

/* ---------- Canvas ---------- */
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

/* ---------- Campo do formulário ---------- */
const fieldClass =
  "w-full rounded-xl border border-white/10 bg-surface-2 px-4 py-3 text-[15px] text-white placeholder:text-gray-600 outline-none transition-colors focus:border-accent";

const Field = ({ label, children }) => (
  <label className="block">
    <span className="font-mono text-[12px] tracking-widest text-gray-500 uppercase">
      {label}
    </span>
    <div className="mt-2">{children}</div>
  </label>
);

/* ---------- Seção ---------- */
const Contact = () => {
  useLanguage(); // re-renderiza quando o idioma muda
  const [form, setForm] = useState({ nome: "", email: "", message: "" });
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [error, setError] = useState("");

  const update = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (status !== "sending") setStatus("idle");
    setError("");
  };

  const sendEmail = async (e) => {
    e.preventDefault();

    const nome = form.nome.trim();
    const email = form.email.trim();
    const message = form.message.trim();

    if (!nome || !email || !message) {
      setError(t("contact.fillAll"));
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError(t("contact.invalidEmail"));
      return;
    }

    setStatus("sending");
    setError("");

    try {
      await emailjs.send(
        EMAILJS_SERVICE,
        EMAILJS_TEMPLATE,
        { from_name: nome, message, email },
        EMAILJS_PUBLIC_KEY
      );
      setStatus("success");
      setForm({ nome: "", email: "", message: "" });
    } catch (err) {
      console.error("ERRO EMAILJS:", err);
      setStatus("error");
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[2fr_3fr] gap-10 lg:gap-14 items-start">
      {/* Esquerda: animação + legenda */}
      <motion.div
        variants={fadeIn("right", "spring", 0.2, 0.9)}
        className="lg:sticky lg:top-24"
      >
        <PixelCanvas grid={envelope} />

        <div className="mt-5 rounded-2xl border border-white/10 bg-surface-2 px-5 py-4 font-mono text-[14px]">
          <div className="flex justify-between">
            <span style={{ color: ACCENT }}>origin</span>
          </div>
          <p className="mt-1">
            <span className="text-gray-400">push:</span>{" "}
            <span className="text-white">{t("contact.push")}</span>
          </p>
        </div>
      </motion.div>

      {/* Direita */}
      <div>
        <motion.div variants={textVariant()}>
          <div className="flex items-center gap-3 font-mono text-[14px]">
            <span style={{ color: ACCENT }}>{t("contact.label")}</span>
            <div className="flex gap-[3px]">
              {Array.from({ length: 18 }).map((_, i) => (
                <span
                  key={i}
                  className="w-[10px] h-[10px] rounded-[2px]"
                  style={{
                    background: i % 3 === 0 ? "var(--sq-gray)" : `var(--sq-fill-${i % 3})`,
                    opacity: 0.25 + ((i * 47) % 75) / 100,
                  }}
                />
              ))}
            </div>
          </div>
          <h2 className="mt-3 text-white font-black tracking-tight text-[40px] sm:text-[56px] leading-[1.05]">
            {t("contact.title")}
          </h2>
        </motion.div>

        <motion.p
          variants={fadeIn("", "", 0.1, 1)}
          className="mt-4 text-secondary text-[17px] leading-[30px] max-w-3xl"
        >
          {t("contact.intro")}
        </motion.p>

        {/* Canais de contato */}
        <motion.div
          variants={fadeIn("up", "spring", 0.2, 0.75)}
          className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4"
        >
          {contactLinks.map((c, i) => (
            <a
              key={t(`contact.channels.${i}.label`)}
              href={c.href}
              target={c.href.startsWith("mailto:") ? undefined : "_blank"}
              rel="noreferrer"
              className="group block rounded-2xl border border-white/10 bg-surface p-4 hover:border-accent/50 transition-colors"
            >
              <p className="font-mono text-[12px] tracking-widest text-gray-500 uppercase">
                {t(`contact.channels.${i}.label`)}
              </p>
              <p className="mt-2 font-mono text-[13px] font-semibold text-accent-soft group-hover:text-white transition-colors break-all">
                {t(`contact.channels.${i}.value`)} ↗
              </p>
            </a>
          ))}
        </motion.div>

        {/* Formulário */}
        <motion.form
          variants={fadeIn("up", "spring", 0.35, 0.75)}
          onSubmit={sendEmail}
          noValidate
          className="mt-5 rounded-2xl border border-white/10 bg-surface p-5 sm:p-7 space-y-5"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label={t("contact.name")}>
              <input
                type="text"
                placeholder={t("contact.namePlaceholder")}
                className={fieldClass}
                value={form.nome}
                onChange={update("nome")}
                autoComplete="name"
              />
            </Field>
            <Field label={t("contact.email")}>
              <input
                type="email"
                placeholder={t("contact.emailPlaceholder")}
                className={fieldClass}
                value={form.email}
                onChange={update("email")}
                autoComplete="email"
              />
            </Field>
          </div>

          <Field label={t("contact.message")}>
            <textarea
              rows={5}
              placeholder={t("contact.messagePlaceholder")}
              className={`${fieldClass} resize-y min-h-[120px]`}
              value={form.message}
              onChange={update("message")}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-4">
            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-full bg-accent hover:bg-accent-deep disabled:opacity-60 disabled:cursor-not-allowed text-[#0d1117] font-semibold text-[15px] px-6 py-2.5 transition-colors"
            >
              {status === "sending" ? t("contact.sending") : t("contact.send")}
            </button>

            <p
              role="status"
              aria-live="polite"
              className={`font-mono text-[13px] ${
                status === "success"
                  ? "text-accent-soft"
                  : error || status === "error"
                  ? "text-error"
                  : "text-gray-500"
              }`}
            >
              {status === "success" && t("contact.success")}
              {status === "error" && t("contact.error")}
              {error}
            </p>
          </div>
        </motion.form>
      </div>
    </div>
  );
};

export default SectionWrapper(Contact, "contact");