/* Dicionário de traduções.
   pt = textos originais do site, mantidos exatamente como estavam.
   en = opção de inglês adicionada. Nomes próprios, nomes de tecnologias,
   comandos de terminal, nomes de arquivos e links não são traduzidos. */

export const translations = {
  pt: {
    meta: {
      title: "Felipe Gresele - Engenheiro de Software",
    },
    nav: {
      about: "Sobre",
      projects: "Projetos",
      experience: "Experiência",
      github: "Github",
      contact: "Contato",
    },
    hero: {
      greeting: "Olá, eu sou",
      name: "Felipe Gresele",
      intro:
        "Engenheiro de Software com visão sistêmica, conectando arquitetura, APIs, cloud e testes garantindo qualidade para construir soluções robustas e escaláveis. Atualmente, exploro IA generativa, LLMs e agentes para evoluir a forma como desenvolvemos software.",
      cta: "Baixar CV",
      stats: [
        "anos de experiência em tecnologia",
        "repositórios públicos no GitHub",
        "contribuições no último ano",
      ],
    },
    about: {
      label: "01 / sobre",
      title: "Visão Geral.",
      intro:
        "Desenvolvedor Fullstack Júnior com foco em Back-end, atuando com Java, Spring Boot, React e TypeScript. Projeto e desenvolvo APIs REST e microsserviços escaláveis, com mensageria, MongoDB e AWS, aplicando boas práticas de engenharia e orientando as soluções às necessidades do negócio. Atualmente, aprofundo meus estudos em IA aplicada ao desenvolvimento, explorando como ela pode aprimorar a qualidade e a eficiência das soluções que entrego.",
      skills: [
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
      ],
      stacksTitle: "Stacks",
    },
    work: {
      label: "02 / projetos",
      title: "Projetos.",
      intro:
        "Exemplos reais do meu trabalho, com o código disponível no GitHub. Clique em um projeto para ver os detalhes.",
      featured: "{n} projetos em destaque",
      viewDetails: "ver detalhes →",
      close: "Fechar",
      viewCode: "Ver código",
      repository: "Repositório",
      pageOf: "página {n} de {total}",
      ariaPrev: "Página anterior",
      ariaNext: "Próxima página",
      ariaPage: "Ir para a página {n}",
      projectDescriptions: {
        "Restaurante FOODMAN":
          "Este site de restaurante oferece uma experiência personalizada com opções de tema claro e escuro, permitindo que o usuário escolha a interface que mais lhe agrada. O site exibe o cardápio completo, informações sobre o restaurante e suas promoções, proporcionando uma navegação agradável e adaptável ao gosto do visitante",
        SmartTask:
          "Aplicação de gerenciamento de tarefas com board Kanban, autenticação JWT e sugestão de tarefas por IA (Google Gemini).",
        "Gestão de finanças":
          "FinanceOS é um sistema completo de gestão financeira com Spring Boot + React, JWT, WebSocket em tempo real, gráficos interativos, metas financeiras e exportação PDF.",
        "Encurtador URL":
          "Encurtador de URLs serverless na AWS, com duas Lambdas em Java 17 + Spring (criação e redirecionamento), armazenamento em S3 e front-end em React + TypeScript.",
      },
    },
    experience: {
      label: "03 / trajetória",
      title: "Experiência e formação",
      mergeText: "experiência + formação",
      tabs: { exp: "Experiência", edu: "Formação" },
      current: "atual",
      inProgress: "em andamento",
      completed: "concluído",
      languagesTitle: "Idiomas",
      items: [
        {
          title: "Desenvolvedor Full Stack Júnior",
          period: "jan 2026 — hoje",
          bullets: [
            "Desenvolvo e mantenho aplicações com Java 11 e 21, Spring Boot, React e TypeScript.",
            "Liderei a unificação de duas aplicações front-end em um único servidor, reduzindo o tempo de requisições em produção e facilitando a manutenção.",
            "Otimizei consultas no MongoDB, incluindo consultas personalizadas e agregações.",
            "Atuo com microsserviços usando Kafka para comunicação assíncrona e faço deploy no Google Cloud Platform (GCP), incluindo o gerenciamento de buckets de armazenamento.",
          ],
        },
        {
          title: "Desenvolvedor Front-end Estagiário",
          period: "abr 2025 — dez 2025",
          bullets: [
            "Criei componentes reutilizáveis em React, TypeScript e Tailwind CSS, reduzindo o tempo de desenvolvimento de novas telas.",
            "Integrei o front-end com APIs REST em Java e Spring, padronizando a comunicação entre as camadas.",
            "Corrigi bugs, aumentando a estabilidade da interface.",
            "Colaborei com a equipe de back-end na evolução dos sistemas.",
          ],
        },
      ],
      education: [
        {
          title: "Engenharia de Software",
          degree: "Graduação",
          period: "2026 — 2028 (previsto)",
        },
        {
          title: "Análise e Desenvolvimento de Sistemas",
          degree: "Graduação (Tecnólogo)",
          period: "2024 — 2025",
        },
      ],
      languages: [
        { name: "Português", level: "Nativo" },
        { name: "Inglês", level: "Intermediário (B1)" },
      ],
    },
    github: {
      label: "04 / github",
      title: "Atividade no GitHub",
      badge: "dados reais · API do GitHub",
      lastMonths: "últimos 7 meses",
      statusOk: "sincronizado com o GitHub",
      statusError: "falha ao sincronizar",
      statusLoading: "sincronizando...",
      loading: "carregando dados do GitHub...",
      errorTitle: "Não foi possível carregar os dados agora.",
      errorBody:
        "A API do GitHub pode ter atingido o limite de requisições. Tente novamente em alguns minutos ou veja direto no perfil.",
      openProfile: "Abrir perfil no GitHub",
      contributions: "contribuições no último ano",
      activeDays: "dias ativos",
      currentStreak: "sequência atual",
      longestStreak: "maior sequência",
      bestDay: "melhor dia · {date}",
      heatmapAria: "Calendário de contribuições dos últimos 12 meses",
      hoverCount: "{n} contribuições · {date}",
      less: "menos",
      more: "mais",
      reposLabel: "Repositórios atualizados recentemente",
      viewAll: "Ver todos no GitHub ↗",
    },
    contact: {
      label: "05 / contato",
      title: "Vamos conversar",
      intro:
        "Tem um projeto ou quer trocar uma ideia sobre desenvolvimento? Mande uma mensagem pelo formulário ou use um dos canais abaixo. Respondo o mais rápido possível.",
      push: "vamos trabalhar juntos",
      channels: [
        { label: "E-mail", value: "felipehgresele@gmail.com" },
        { label: "LinkedIn", value: "Conectar no LinkedIn" },
        { label: "GitHub", value: "@felipegresele" },
      ],
      name: "Nome",
      email: "E-mail",
      message: "Mensagem",
      namePlaceholder: "Seu nome",
      emailPlaceholder: "voce@email.com",
      messagePlaceholder: "Conte um pouco sobre a vaga ou o projeto...",
      sending: "Enviando...",
      send: "Enviar mensagem",
      success: "Mensagem enviada! Entrarei em contato em breve.",
      error: "Não foi possível enviar agora. Tente pelo e-mail acima.",
      fillAll: "Preencha todos os campos.",
      invalidEmail: "Digite um e-mail válido.",
    },
    navbar: {
      langAria: "Alternar para inglês",
      themeAria: "Alternar tema",
    },
  },

  en: {
    meta: {
      title: "Felipe Gresele - Software Engineer",
    },
    nav: {
      about: "About",
      projects: "Projects",
      experience: "Experience",
      github: "Github",
      contact: "Contact",
    },
    hero: {
      greeting: "Hi, I'm",
      name: "Felipe Gresele",
      intro:
        "Software Engineer with a systemic view, connecting architecture, APIs, cloud and testing to guarantee quality and build robust, scalable solutions. Currently, I explore generative AI, LLMs and agents to evolve the way we develop software.",
      cta: "Download CV",
      stats: [
        "years of experience in tech",
        "public repositories on GitHub",
        "contributions in the last year",
      ],
    },
    about: {
      label: "01 / about",
      title: "Overview.",
      intro:
        "Junior Fullstack Developer focused on Back-end, working with Java, Spring Boot, React and TypeScript. I design and build scalable REST APIs and microservices, with messaging, MongoDB and AWS, applying engineering best practices and steering the solutions towards the needs of the business. Currently, I'm deepening my studies in AI applied to development, exploring how it can improve the quality and efficiency of the solutions I deliver.",
      skills: [
        {
          title: "Back-end",
          core: ["Java", "Spring Boot", "REST APIs", "Microservices"],
          more: ["Spring Security", "Spring Data JPA", "Spring Cloud", "JWT / OAuth2", "OpenAPI"],
        },
        {
          title: "Architecture and quality",
          core: ["Clean Architecture", "SOLID", "JUnit 5", "TDD"],
          more: ["Hexagonal Architecture", "Mockito", "Testcontainers", "Playwright"],
        },
        {
          title: "Data and messaging",
          core: ["PostgreSQL", "MongoDB", "Apache Kafka"],
          more: ["MySQL", "Redis", "RabbitMQ", "Flyway"],
        },
        {
          title: "Cloud and DevOps",
          core: ["AWS", "GCP", "Docker", "GitHub Actions"],
          more: ["Lambda", "S3", "ECS", "SQS", "API Gateway", "CloudWatch"],
        },
        {
          title: "Front-end",
          core: ["React", "TypeScript"],
          more: ["JavaScript", "Tailwind CSS", "React Query", "Zustand"],
        },
        {
          title: "Studying",
          study: ["Generative AI", "LLMs", "AI agents", "AI automation"],
        },
      ],
      stacksTitle: "Stacks",
    },
    work: {
      label: "02 / projects",
      title: "Projects.",
      intro:
        "Real examples of my work, with the code available on GitHub. Click a project to see the details.",
      featured: "{n} featured projects",
      viewDetails: "view details →",
      close: "Close",
      viewCode: "View code",
      repository: "Repository",
      pageOf: "page {n} of {total}",
      ariaPrev: "Previous page",
      ariaNext: "Next page",
      ariaPage: "Go to page {n}",
      projectDescriptions: {
        "Restaurante FOODMAN":
          "This restaurant website offers a personalized experience with light and dark theme options, allowing the user to choose the interface they like best. The site displays the full menu, information about the restaurant and its promotions, providing a pleasant and adaptable browsing experience for the visitor",
        SmartTask:
          "A task management application with a Kanban board, JWT authentication and AI-powered task suggestions (Google Gemini).",
        "Gestão de finanças":
          "FinanceOS is a complete financial management system built with Spring Boot + React, featuring JWT, real-time WebSocket, interactive charts, financial goals and PDF export.",
        "Encurtador URL":
          "A serverless URL shortener on AWS, with two Java 17 + Spring Lambdas (creation and redirection), S3 storage and a React + TypeScript front-end.",
      },
    },
    experience: {
      label: "03 / journey",
      title: "Experience and education",
      mergeText: "experience + education",
      tabs: { exp: "Experience", edu: "Education" },
      current: "current",
      inProgress: "in progress",
      completed: "completed",
      languagesTitle: "Languages",
      items: [
        {
          title: "Junior Full Stack Developer",
          period: "Jan 2026 — present",
          bullets: [
            "I develop and maintain applications with Java 11 and 21, Spring Boot, React and TypeScript.",
            "I led the unification of two front-end applications into a single server, reducing request times in production and making maintenance easier.",
            "I optimized MongoDB queries, including custom queries and aggregations.",
            "I work with microservices using Kafka for asynchronous communication and deploy to Google Cloud Platform (GCP), including managing storage buckets.",
          ],
        },
        {
          title: "Front-end Intern",
          period: "Apr 2025 — Dec 2025",
          bullets: [
            "Created reusable components in React, TypeScript and Tailwind CSS, reducing development time for new screens.",
            "Integrated the front-end with REST APIs in Java and Spring, standardizing communication between layers.",
            "Fixed bugs, improving the stability of the interface.",
            "Collaborated with the back-end team on the evolution of the systems.",
          ],
        },
      ],
      education: [
        {
          title: "Software Engineering",
          degree: "Undergraduate degree",
          period: "2026 — 2028 (expected)",
        },
        {
          title: "Systems Analysis and Development",
          degree: "Undergraduate (Technology degree)",
          period: "2024 — 2025",
        },
      ],
      languages: [
        { name: "Portuguese", level: "Native" },
        { name: "English", level: "Intermediate (B1)" },
      ],
    },
    github: {
      label: "04 / github",
      title: "GitHub activity",
      badge: "real data · GitHub API",
      lastMonths: "last 7 months",
      statusOk: "synced with GitHub",
      statusError: "failed to sync",
      statusLoading: "syncing...",
      loading: "loading GitHub data...",
      errorTitle: "Couldn't load the data right now.",
      errorBody:
        "The GitHub API may have hit its rate limit. Try again in a few minutes or check the profile directly.",
      openProfile: "Open GitHub profile",
      contributions: "contributions in the last year",
      activeDays: "active days",
      currentStreak: "current streak",
      longestStreak: "longest streak",
      bestDay: "best day · {date}",
      heatmapAria: "Contribution calendar for the last 12 months",
      hoverCount: "{n} contributions · {date}",
      less: "less",
      more: "more",
      reposLabel: "Recently updated repositories",
      viewAll: "See all on GitHub ↗",
    },
    contact: {
      label: "05 / contact",
      title: "Let's talk",
      intro:
        "Have a project or want to chat about development? Send a message through the form or use one of the channels below. I reply as soon as I can.",
      push: "let's work together",
      channels: [
        { label: "E-mail", value: "felipehgresele@gmail.com" },
        { label: "LinkedIn", value: "Connect on LinkedIn" },
        { label: "GitHub", value: "@felipegresele" },
      ],
      name: "Name",
      email: "E-mail",
      message: "Message",
      namePlaceholder: "Your name",
      emailPlaceholder: "you@email.com",
      messagePlaceholder: "Tell me a bit about the role or project...",
      sending: "Sending...",
      send: "Send message",
      success: "Message sent! I'll get back to you soon.",
      error: "Couldn't send it right now. Try the e-mail above instead.",
      fillAll: "Fill in all fields.",
      invalidEmail: "Enter a valid e-mail.",
    },
    navbar: {
      langAria: "Switch to Portuguese",
      themeAria: "Toggle theme",
    },
  },
};
