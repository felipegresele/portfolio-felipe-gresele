import { useEffect, useState } from "react";

export const GITHUB_USERNAME = "felipegresele";
const CACHE_KEY = "gh-section-v1";

let inflight = null; // evita requisições duplicadas entre componentes

const fetchGithubData = async () => {
  const [calRes, userRes, reposRes] = await Promise.all([
    fetch(
      `https://github-contributions-api.jogruber.de/v4/${GITHUB_USERNAME}?y=last`
    ),
    fetch(`https://api.github.com/users/${GITHUB_USERNAME}`),
    fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=pushed&per_page=30`
    ),
  ]);

  if (!calRes.ok || !userRes.ok || !reposRes.ok) throw new Error("api");

  const cal = await calRes.json();
  const user = await userRes.json();
  const repos = await reposRes.json();

  const days = (cal.contributions || [])
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date));
  if (!days.length) throw new Error("empty");

  const total =
    cal.total?.lastYear ?? days.reduce((sum, d) => sum + d.count, 0);

  return {
    days,
    total,
    publicRepos: user.public_repos,
    repos: repos.filter((r) => !r.fork).slice(0, 4),
  };
};

export const loadGithubData = () => {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) return Promise.resolve(JSON.parse(cached));
  } catch {
    /* ignora cache inválido */
  }

  if (!inflight) {
    inflight = fetchGithubData()
      .then((payload) => {
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(payload));
        } catch {
          /* ignora falha de storage */
        }
        return payload;
      })
      .catch((err) => {
        inflight = null; // permite tentar de novo depois
        throw err;
      });
  }
  return inflight;
};

export default function useGithubData() {
  const [state, setState] = useState({ data: null, status: "loading" });

  useEffect(() => {
    let alive = true;
    loadGithubData()
      .then((data) => alive && setState({ data, status: "ok" }))
      .catch(() => alive && setState({ data: null, status: "error" }));
    return () => {
      alive = false;
    };
  }, []);

  return state; // { data, status: "loading" | "ok" | "error" }
}