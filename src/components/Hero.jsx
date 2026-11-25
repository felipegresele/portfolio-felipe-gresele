import { styles } from "../styles";
import useGithubData from "../api/UseGitHubData";
import { useLanguage, t } from "../i18n";

const GITHUB_URL = "https://github.com/felipegresele";
const LINKEDIN_URL = "https://www.linkedin.com/in/felipe-gresele-3065a72a3/";

const fmtNumber = (n, locale = "pt-BR") => new Intl.NumberFormat(locale).format(n);

const GithubIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M12 .5A11.5 11.5 0 0 0 .5 12.2c0 5.2 3.3 9.6 7.9 11.1.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.4-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.8 0-1.3.5-2.3 1.2-3.2-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.2 11.2 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.6.2 2.8.1 3.1.8.9 1.2 1.9 1.2 3.2 0 4.5-2.7 5.5-5.3 5.8.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6a11.7 11.7 0 0 0 7.9-11.1A11.5 11.5 0 0 0 12 .5Z" />
  </svg>
);

const LinkedinIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
    <path d="M20.4 20.5h-3.6v-5.6c0-1.3 0-3-1.8-3s-2.1 1.4-2.1 2.9v5.7H9.3V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.4-1.8 3.6 0 4.3 2.4 4.3 5.5v6.2ZM5.3 7.4a2.1 2.1 0 1 1 0-4.2 2.1 2.1 0 0 1 0 4.2ZM7.1 20.5H3.6V9h3.5v11.5ZM22.2 0H1.8C.8 0 0 .8 0 1.7v20.6c0 .9.8 1.7 1.8 1.7h20.4c1 0 1.8-.8 1.8-1.7V1.7C24 .8 23.2 0 22.2 0Z" />
  </svg>
);

const socialClass =
  "inline-flex items-center gap-2 rounded-full border border-white/15 hover:border-[#915EFF] hover:text-white text-white/80 px-4 py-2 transition-colors";

export default function Hero() {
  const { data, status } = useGithubData();
  const lang = useLanguage();
  const locale = lang === "en" ? "en-US" : "pt-BR";

  // enquanto carrega ou se a API falhar, mostra "—" em vez de número falso
  const ghValue = (value) =>
    status === "ok" && data ? fmtNumber(value, locale) : "—";

  const stats = [
    {
      value: "2+",
      label: t("hero.stats.0"),
    },
    {
      value: ghValue(data?.publicRepos),
      label: t("hero.stats.1"),
      loading: status === "loading",
    },
    {
      value: ghValue(data?.total),
      label: t("hero.stats.2"),
      loading: status === "loading",
    },
  ];

  return (
    <section className={`relative w-full min-h-screen mx-auto mb-6`}>
      <div
        className={`absolute inset-0 top-[120px] max-w-7xl mx-auto ${styles.paddingX} flex flex-row items-start gap-5`}
      >
        <div className="flex flex-col justify-center items-center mt-5">
          <div className="w-5 h-5 rounded-full bg-[#915EFF]" />
          <div className="w-1 sm:h-80 h-40 violet-gradient" />
        </div>

        <div className="w-full">
          <h1 className={`${styles.heroHeadText} text-white`}>
            {t("hero.greeting")} <span className="text-[#915EFF]">{t("hero.name")}</span>
          </h1>
          <p className={`${styles.heroSubText} mt-2 text-white-100 max-w-2xl !text-[18px] sm:!text-[20px] !leading-[30px]`}>
            {t("hero.intro")}
          </p>

          {/* Botões */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <a
              className="bg-indigo-400 hover:bg-indigo-600 text-white px-4 py-2 rounded-full inline-block transition-colors"
              href="Curriculo-Backend-Felipe-Gresele.pdf"
              download={"Currículo-BackEnd-Felipe-Gresele.pdf"}
            >
              {t("hero.cta")}
            </a>

            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noreferrer"
              className={socialClass}
            >
              <GithubIcon />
              GitHub
            </a>

            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              className={socialClass}
            >
              <LinkedinIcon />
              LinkedIn
            </a>
          </div>

          {/* Estatísticas (3 itens centralizados) */}
          <div className="mt-10 border-t border-white/10 pt-6 grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-6 text-center">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p
                  className={`text-white font-bold text-[32px] sm:text-[40px] leading-none tracking-tight ${
                    stat.loading ? "animate-pulse text-white/40" : ""
                  }`}
                >
                  {stat.value}
                </p>
                <p className="mt-2 text-secondary text-[14px] sm:text-[15px] leading-6">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}