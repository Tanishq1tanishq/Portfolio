// --- Nav scroll state + progress bar ---
const nav = document.getElementById('nav');
const progress = document.getElementById('progress');
const onScroll = () => {
  if (window.scrollY > 12) nav.classList.add('scrolled');
  else nav.classList.remove('scrolled');
  const h = document.documentElement;
  const pct = (window.scrollY / (h.scrollHeight - h.clientHeight)) * 100;
  if (progress) progress.style.width = pct + '%';
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// --- Reveal on scroll ---
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i, 6) * 60}ms`;
  io.observe(el);
});

// --- Counter animation on .stat-n[data-count] ---
const counters = document.querySelectorAll('.stat-n[data-count]');
const cIo = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const end = parseInt(el.dataset.count, 10);
    const suffix = el.dataset.suffix || '';
    const dur = 1200;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(end * eased);
      el.innerHTML = suffix ? `${val}<sup>${suffix}</sup>` : `${val}`;
      if (t < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    cIo.unobserve(el);
  });
}, { threshold: 0.5 });
counters.forEach((c) => cIo.observe(c));

// --- Year ---
const y = document.getElementById('year');
if (y) y.textContent = new Date().getFullYear();

// --- Hero orb parallax (fine pointer only) ---
const hero = document.querySelector('.hero');
const orbs = document.querySelectorAll('.orb');
if (hero && orbs.length && window.matchMedia('(pointer: fine)').matches) {
  let raf = null;
  hero.addEventListener('mousemove', (e) => {
    const rect = hero.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    if (raf) cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      orbs.forEach((o, i) => {
        const depth = (i + 1) * 14;
        o.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    });
  });
  hero.addEventListener('mouseleave', () => {
    orbs.forEach((o) => { o.style.transform = ''; });
  });
}

// --- Smooth anchor offset for sticky nav ---
document.querySelectorAll('a[href^="#"]').forEach((a) => {
  a.addEventListener('click', (e) => {
    const id = a.getAttribute('href');
    if (!id || id === '#' || id.length < 2) return;
    const target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    const top = target.getBoundingClientRect().top + window.scrollY - 64;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

// --- Magnetic buttons + hover cursor state ---
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
const fine = window.matchMedia('(pointer: fine)').matches;

if (fine && cursor && cursorDot) {
  let cx = 0, cy = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', (e) => {
    tx = e.clientX; ty = e.clientY;
    cursorDot.style.transform = `translate3d(${tx - 2}px, ${ty - 2}px, 0)`;
  });
  const loop = () => {
    cx += (tx - cx) * 0.18;
    cy += (ty - cy) * 0.18;
    cursor.style.transform = `translate3d(${cx - 17}px, ${cy - 17}px, 0)`;
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);

  document.querySelectorAll('a, button, .moji, .chips li, .softlist span').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

// Magnetic buttons
if (fine) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    const strength = 18;
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * strength;
      const y = ((e.clientY - r.top) / r.height - 0.5) * strength;
      el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// --- Tilt on emojis ---
if (fine) {
  document.querySelectorAll('[data-tilt]').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width - 0.5) * 30;
      const y = ((e.clientY - r.top) / r.height - 0.5) * -30;
      el.style.transform = `perspective(400px) rotateY(${x}deg) rotateX(${y}deg) translateY(-4px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// --- Module spotlight (mouse-follow radial) ---
document.querySelectorAll('.module').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// --- i18n: English / German translations ---
const I18N = {
  en: {
    "nav.about": "About",
    "nav.work": "Experience",
    "nav.edu": "Education",
    "nav.proj": "Projects",
    "nav.skills": "Skills",
    "nav.journey": "Journey",
    "nav.contact": "Contact",
    "nav.cta": "Hire me",

    "hero.eyebrow": "Portfolio · 2026 · Available for Pflichtpraktikum",
    "hero.t1": "Engineering clarity",
    "hero.t2": "from plan to production.",
    "hero.sub": "Industrial engineering student at THD — European Campus Rottal-Inn. I turn ambiguous briefs into milestone plans, dashboards, and delivered outcomes.",
    "hero.btn1": "See my work",
    "hero.btn2": "Contact",
    "hero.m1k": "Focus",
    "hero.m1v": "Project Management · Operations",
    "hero.m2k": "Location",
    "hero.m2v": "München, DE",
    "hero.m3k": "Availability",
    "hero.m3v": "Mandatory internship · WS 2026/27",

    "about.eyebrow": "About",
    "about.t1": "A structured mind",
    "about.t2": "with a builder's patience.",
    "about.p1": "I'm in my 6th semester of Industrial Engineering, specialising in project management and operations. My work sits where spreadsheets meet shop floors — milestone plans, risk logs, and scenario analyses that help teams ship on time, on scope, and on budget.",
    "about.p2": "I write in English and German, document like it's shipping code, and care about the details that make a project land.",
    "about.s1": "Semester · B.Eng.",
    "about.s2": "Daily guests coordinated",
    "about.s3": "Languages · DE · EN · HI",
    "about.s4": "English study language",

    "work.eyebrow": "Experience",
    "work.t1": "Delivered in the real world,",
    "work.t2": "not just on paper.",
    "work.role": "Working student",
    "work.h3": "Kitchen assistant · Betriebs- und Service GmbH",
    "work.kicker": "A fast, multicultural team of six keeping daily operations running for 200+ guests — the closest thing to cross-functional project work you'll find outside an office.",
    "work.p1": "<strong>Cross-functional coordination</strong> across kitchen, service, and disposition to keep daily operations on track.",
    "work.p2": "<strong>Planning under pressure</strong> — prioritised tasks, escalated bottlenecks, kept throughput steady.",
    "work.p3": "<strong>Documentation discipline</strong> — maintained inventory and handover logs for clean shift transitions.",
    "work.p4": "<strong>Quality &amp; process</strong> — reliable adherence to internal standards in a multicultural team.",
    "work.cs1": "guests / day",
    "work.cs2": "team members",
    "work.cs3": "months on the job",

    "edu.eyebrow": "Education",
    "edu.t1": "Foundations built",
    "edu.t2": "module by module.",
    "edu.degree": "B.Eng. Industrial Engineering",
    "edu.school": "Technische Hochschule Deggendorf — European Campus Rottal-Inn, Pfarrkirchen",
    "edu.dates": "10 / 2023 — exp. 03 / 2027",
    "edu.m1t": "Project Management",
    "edu.m1p": "Agile and classical project management, milestone planning, risk analysis, documentation, English-language presentations — on real team projects.",
    "edu.m2t": "Operations Research &amp; Logistics",
    "edu.m2p": "Cross-functional process control, supply chain management, linear optimisation, decision support with Excel Solver.",
    "edu.m3c": "6. Sem · ongoing",
    "edu.m3t": "Lean Management",
    "edu.m3p": "Waste analysis, continuous improvement (KVP), process visualisation — the foundation for production and development project work.",
    "edu.m4t": "Accounting &amp; Financing",
    "edu.m4p": "Investment calculation, cost analysis, business cases — the finance lens on cross-functional projects.",
    "edu.m5t": "Applied Mathematics",
    "edu.m5p": "Statistical data analysis, KPI evaluation, regression and correlation analysis in MS Excel.",
    "edu.m6c": "Ongoing",
    "edu.m6t": "Production &amp; Development Projects",
    "edu.m6p": "Cross-module teamwork blending lean, operations, and project management into real production &amp; product-development scenarios.",

    "proj.eyebrow": "Selected Projects",
    "proj.t1": "The numbers",
    "proj.t2": "behind the decisions.",
    "proj.sub": "Scientific Writing &amp; Project Management · 2024",
    "proj.title": "Economic feasibility study — PV system, Pfarrkirchen",
    "proj.desc": "A team economic feasibility study for a photovoltaic installation: structured milestone plan, clear task split, progress tracking, and risk register — paired with Excel-based scenario analyses for amortisation, ROI, and break-even points.",
    "proj.badge": "Break-even · ROI · Amortisation",
    "proj.c1": "Milestone planning",
    "proj.c2": "Scenario analysis",
    "proj.c3": "Excel modelling",
    "proj.c4": "Risk analysis",
    "proj.c5": "Technical report · EN",
    "proj.c6": "Team delivery",

    "skills.eyebrow": "Skills &amp; Toolkit",
    "skills.t1": "Tools and methods",
    "skills.t2": "I reach for every week.",

    "skills.g1t": "Project Management",
    "skills.g1_1": "Agile &amp; classical PM",
    "skills.g1_2": "Milestone planning",
    "skills.g1_3": "Risk analysis",
    "skills.g1_4": "Progress tracking",
    "skills.g1_5": "Project documentation",
    "skills.g1_6": "Top-management presentations",
    "skills.g1_7": "Cross-functional collaboration",

    "skills.g2t": "Operations",
    "skills.g2_1": "Operations Research",
    "skills.g2_2": "Supply Chain Management",
    "skills.g2_3": "Production control (Produktionssteuerung)",
    "skills.g2_4": "Process optimisation",
    "skills.g2_5": "Lean Management",
    "skills.g2_6": "Continuous improvement · KVP",
    "skills.g2_7": "Decision support",
    "skills.g2_8": "Linear optimisation",

    "skills.g3t": "Analytics &amp; Finance",
    "skills.g3_1": "KPI evaluation &amp; dashboards",
    "skills.g3_2": "Statistical data analysis",
    "skills.g3_3": "Regression &amp; correlation",
    "skills.g3_4": "Investment calculation",
    "skills.g3_5": "Cost analysis",
    "skills.g3_6": "Business cases",
    "skills.g3_7": "Scenario analysis — ROI · Break-even · Amortisation",

    "skills.g4t": "IT &amp; Tools",
    "skills.g4_1": "· advanced, Solver",

    "skills.g5t": "Languages",
    "skills.g5_de": "German",
    "skills.g5_en": "English",
    "skills.g5_en_tag": "C1 · study language",
    "skills.g5_hi": "Hindi",
    "skills.g5_hi_tag": "Native",

    "skills.g6t": "Working Style",
    "skills.g6_1": "Structured",
    "skills.g6_2": "Outcome-driven",
    "skills.g6_3": "Documentation-first",
    "skills.g6_4": "Team player",
    "skills.g6_5": "Reliable under pressure",
    "skills.g6_6": "Multicultural",
    "skills.g6_7": "Self-starter",
    "skills.g6_8": "Continuous improvement",

    "jny.eyebrow": "Journey",
    "jny.t1": "A short timeline",
    "jny.t2": "of how I got here.",
    "jny.1t": "Started B.Eng. Industrial Engineering",
    "jny.1p": "Enrolled at THD — European Campus Rottal-Inn, Pfarrkirchen. Study language: English.",
    "jny.2t": "PV-Anlage Pfarrkirchen — economic analysis",
    "jny.2p": "Team project on photovoltaic feasibility: milestone plan, risk analysis, ROI &amp; break-even in Excel.",
    "jny.3t": "Working student at Betriebs- und Service GmbH",
    "jny.3p": "13 months coordinating kitchen, service &amp; disposition for 200+ guests a day.",
    "jny.4t": "6. Semester — Lean Management &amp; beyond",
    "jny.4p": "Deepening lean, KVP &amp; process visualisation alongside finance and applied mathematics.",
    "jny.5d": "Next",
    "jny.5t": "Mandatory internship · WS 2026/27",
    "jny.5p": "Looking for a role in project management, operations, or production — München preferred.",

    "contact.eyebrow": "Contact",
    "contact.t1": "Let's build something",
    "contact.t2": "worth documenting.",
    "contact.sub": "Open to mandatory internship (Pflichtpraktikum) and working-student roles in project management, operations, and production — in München and remote across Germany.",
    "contact.k1": "Based in",
    "contact.k2": "Languages",
    "contact.v2": "DE B2 · EN C1 · HI native",
    "contact.k3": "Status",

    "footer.copy": "© <span id=\"year\"></span> Tanishq Tanishq · Designed &amp; built with care.",
    "footer.top": "Back to top ↑",
  },

  de: {
    "nav.about": "Über mich",
    "nav.work": "Erfahrung",
    "nav.edu": "Ausbildung",
    "nav.proj": "Projekte",
    "nav.skills": "Fähigkeiten",
    "nav.journey": "Werdegang",
    "nav.contact": "Kontakt",
    "nav.cta": "Jetzt kontaktieren",

    "hero.eyebrow": "Portfolio · 2026 · Verfügbar für Pflichtpraktikum",
    "hero.t1": "Klarheit im Engineering",
    "hero.t2": "vom Plan zur Produktion.",
    "hero.sub": "Student Wirtschaftsingenieurwesen an der THD — European Campus Rottal-Inn. Ich mache aus unklaren Briefings Meilensteinpläne, Dashboards und gelieferte Ergebnisse.",
    "hero.btn1": "Projekte ansehen",
    "hero.btn2": "Kontakt",
    "hero.m1k": "Schwerpunkt",
    "hero.m1v": "Projektmanagement · Operations",
    "hero.m2k": "Standort",
    "hero.m2v": "München, DE",
    "hero.m3k": "Verfügbarkeit",
    "hero.m3v": "Pflichtpraktikum · WS 2026/27",

    "about.eyebrow": "Über mich",
    "about.t1": "Strukturiertes Denken,",
    "about.t2": "mit der Geduld eines Machers.",
    "about.p1": "Ich bin im 6. Semester Wirtschaftsingenieurwesen und habe meinen Schwerpunkt in Projektmanagement und Operations. Meine Arbeit bewegt sich dort, wo Spreadsheets auf die Werkhalle treffen — Meilensteinpläne, Risiko-Logs und Szenarioanalysen, die Teams dabei helfen, pünktlich, im Scope und im Budget zu liefern.",
    "about.p2": "Ich schreibe auf Englisch und Deutsch, dokumentiere, als würde ich Code ausliefern, und achte auf die Details, die ein Projekt zum Erfolg führen.",
    "about.s1": "Semester · B.Eng.",
    "about.s2": "Täglich koordinierte Gäste",
    "about.s3": "Sprachen · DE · EN · HI",
    "about.s4": "Englisch als Studiensprache",

    "work.eyebrow": "Berufserfahrung",
    "work.t1": "In der Praxis geliefert,",
    "work.t2": "nicht nur auf dem Papier.",
    "work.role": "Werkstudent",
    "work.h3": "Küchenhilfe · Betriebs- und Service GmbH",
    "work.kicker": "Ein schnelles, multikulturelles Team aus sechs Personen, das den Betrieb für 200+ Gäste am Laufen hält — die praxisnächste Form bereichsübergreifender Projektarbeit außerhalb des Büros.",
    "work.p1": "<strong>Bereichsübergreifende Koordination</strong> zwischen Küche, Service und Disposition zur Sicherstellung täglicher Betriebsabläufe.",
    "work.p2": "<strong>Planung unter Zeitdruck</strong> — Aufgaben priorisiert, Engpässe eskaliert, Durchsatz stabil gehalten.",
    "work.p3": "<strong>Dokumentations-Disziplin</strong> — Bestands- und Ablaufdokumentationen gepflegt für saubere Schichtübergaben.",
    "work.p4": "<strong>Qualität &amp; Prozess</strong> — zuverlässige Einhaltung interner Standards im multikulturellen Team.",
    "work.cs1": "Gäste / Tag",
    "work.cs2": "Teammitglieder",
    "work.cs3": "Monate im Einsatz",

    "edu.eyebrow": "Ausbildung",
    "edu.t1": "Grundlagen gelegt —",
    "edu.t2": "Modul für Modul.",
    "edu.degree": "B.Eng. Wirtschaftsingenieurwesen",
    "edu.school": "Technische Hochschule Deggendorf — European Campus Rottal-Inn, Pfarrkirchen",
    "edu.dates": "10 / 2023 — vor. 03 / 2027",
    "edu.m1t": "Projektmanagement",
    "edu.m1p": "Agiles und klassisches Projektmanagement, Meilensteinplanung, Risikoanalyse, Projektdokumentation, Präsentationen auf Englisch — in realen Teamprojekten.",
    "edu.m2t": "Operations Research &amp; Logistik",
    "edu.m2p": "Bereichsübergreifende Prozesssteuerung, Supply Chain Management, lineare Optimierung, Entscheidungsunterstützung mit Excel-Solver.",
    "edu.m3c": "6. Sem · laufend",
    "edu.m3t": "Lean Management",
    "edu.m3p": "Verschwendungsanalyse, KVP, Prozessvisualisierung — Grundlage für Produktions- und Entwicklungsprojektarbeit.",
    "edu.m4t": "Accounting &amp; Financing",
    "edu.m4p": "Investitionsrechnung, Kostenanalyse, Business Cases — die Finance-Perspektive auf bereichsübergreifende Projekte.",
    "edu.m5t": "Applied Mathematics",
    "edu.m5p": "Statistische Datenanalyse, KPI-Auswertung, Regressions- und Korrelationsanalyse mit MS Excel.",
    "edu.m6c": "Laufend",
    "edu.m6t": "Produktions- &amp; Entwicklungsprojekte",
    "edu.m6p": "Modulübergreifende Teamarbeit, die Lean, Operations und Projektmanagement zu echten Produktions- &amp; Produktentwicklungsszenarien verbindet.",

    "proj.eyebrow": "Ausgewählte Projekte",
    "proj.t1": "Die Zahlen",
    "proj.t2": "hinter den Entscheidungen.",
    "proj.sub": "Scientific Writing &amp; Project Management · 2024",
    "proj.title": "Wirtschaftlichkeitsanalyse PV-Anlage Pfarrkirchen",
    "proj.desc": "Team-Wirtschaftlichkeitsstudie für eine Photovoltaikanlage: strukturierte Meilensteinplanung, klare Aufgabenverteilung, Fortschrittskontrolle und Risikoregister — kombiniert mit Excel-basierten Szenarioanalysen für Amortisation, ROI und Break-even.",
    "proj.badge": "Break-even · ROI · Amortisation",
    "proj.c1": "Meilensteinplanung",
    "proj.c2": "Szenarioanalyse",
    "proj.c3": "Excel-Modellierung",
    "proj.c4": "Risikoanalyse",
    "proj.c5": "Technischer Bericht · EN",
    "proj.c6": "Team-Lieferung",

    "skills.eyebrow": "Fähigkeiten &amp; Toolkit",
    "skills.t1": "Werkzeuge und Methoden,",
    "skills.t2": "die ich jede Woche nutze.",

    "skills.g1t": "Projektmanagement",
    "skills.g1_1": "Agiles &amp; klassisches PM",
    "skills.g1_2": "Meilensteinplanung",
    "skills.g1_3": "Risikoanalyse",
    "skills.g1_4": "Fortschrittskontrolle",
    "skills.g1_5": "Projektdokumentation",
    "skills.g1_6": "Präsentationen Top-Management",
    "skills.g1_7": "Bereichsübergreifende Zusammenarbeit",

    "skills.g2t": "Operations",
    "skills.g2_1": "Operations Research",
    "skills.g2_2": "Supply Chain Management",
    "skills.g2_3": "Produktionssteuerung",
    "skills.g2_4": "Prozessoptimierung",
    "skills.g2_5": "Lean Management",
    "skills.g2_6": "Kontinuierliche Verbesserung · KVP",
    "skills.g2_7": "Entscheidungsunterstützung",
    "skills.g2_8": "Lineare Optimierung",

    "skills.g3t": "Analytics &amp; Finance",
    "skills.g3_1": "KPI-Auswertung &amp; Dashboards",
    "skills.g3_2": "Statistische Datenanalyse",
    "skills.g3_3": "Regression &amp; Korrelation",
    "skills.g3_4": "Investitionsrechnung",
    "skills.g3_5": "Kostenanalyse",
    "skills.g3_6": "Business Cases",
    "skills.g3_7": "Szenarioanalyse — ROI · Break-even · Amortisation",

    "skills.g4t": "IT &amp; Tools",
    "skills.g4_1": "· fortgeschritten, Solver",

    "skills.g5t": "Sprachen",
    "skills.g5_de": "Deutsch",
    "skills.g5_en": "Englisch",
    "skills.g5_en_tag": "C1 · Studiensprache",
    "skills.g5_hi": "Hindi",
    "skills.g5_hi_tag": "Muttersprache",

    "skills.g6t": "Arbeitsstil",
    "skills.g6_1": "Strukturiert",
    "skills.g6_2": "Ergebnisorientiert",
    "skills.g6_3": "Dokumentation zuerst",
    "skills.g6_4": "Teamplayer",
    "skills.g6_5": "Zuverlässig unter Druck",
    "skills.g6_6": "Multikulturell",
    "skills.g6_7": "Eigeninitiative",
    "skills.g6_8": "Kontinuierliche Verbesserung",

    "jny.eyebrow": "Werdegang",
    "jny.t1": "Eine kurze Zeitleiste —",
    "jny.t2": "wie ich hierher kam.",
    "jny.1t": "Start des B.Eng. Wirtschaftsingenieurwesen",
    "jny.1p": "Immatrikulation an der THD — European Campus Rottal-Inn, Pfarrkirchen. Studiensprache: Englisch.",
    "jny.2t": "PV-Anlage Pfarrkirchen — Wirtschaftlichkeitsanalyse",
    "jny.2p": "Teamprojekt zur Photovoltaik-Wirtschaftlichkeit: Meilensteinplan, Risikoanalyse, ROI &amp; Break-even in Excel.",
    "jny.3t": "Werkstudent bei Betriebs- und Service GmbH",
    "jny.3p": "13 Monate Koordination zwischen Küche, Service &amp; Disposition für 200+ Gäste täglich.",
    "jny.4t": "6. Semester — Lean Management &amp; mehr",
    "jny.4p": "Vertiefung von Lean, KVP &amp; Prozessvisualisierung neben Finance und Applied Mathematics.",
    "jny.5d": "Nächstes",
    "jny.5t": "Pflichtpraktikum · WS 2026/27",
    "jny.5p": "Auf der Suche nach einer Rolle in Projektmanagement, Operations oder Produktion — München bevorzugt.",

    "contact.eyebrow": "Kontakt",
    "contact.t1": "Lass uns etwas bauen,",
    "contact.t2": "das es wert ist, dokumentiert zu werden.",
    "contact.sub": "Offen für Pflichtpraktikum und Werkstudentenrollen in Projektmanagement, Operations und Produktion — in München und remote deutschlandweit.",
    "contact.k1": "Wohnort",
    "contact.k2": "Sprachen",
    "contact.v2": "DE B2 · EN C1 · HI Muttersprache",
    "contact.k3": "Status",

    "footer.copy": "© <span id=\"year\"></span> Tanishq Tanishq · Mit Sorgfalt gestaltet &amp; gebaut.",
    "footer.top": "Nach oben ↑",
  }
};

function applyLang(lang) {
  const dict = I18N[lang] || I18N.en;
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const key = el.getAttribute('data-i18n');
    if (dict[key] !== undefined) el.innerHTML = dict[key];
  });

  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  document.querySelectorAll('.lang-btn').forEach((b) => {
    const active = b.dataset.lang === lang;
    b.classList.toggle('is-active', active);
    b.setAttribute('aria-pressed', active ? 'true' : 'false');
  });
  const sw = document.querySelector('.lang-switch');
  if (sw) sw.dataset.active = lang;

  try { localStorage.setItem('lang', lang); } catch (_) {}
}

// Restore saved language (defaults to EN on first visit)
(() => {
  let saved = 'en';
  try { saved = localStorage.getItem('lang') || 'en'; } catch (_) {}
  if (saved === 'de') applyLang('de');
  else {
    const sw = document.querySelector('.lang-switch');
    if (sw) sw.dataset.active = 'en';
    document.documentElement.lang = 'en';
  }
})();

// --- Split hero title into per-word elements for staggered reveal ---
function splitWords(el) {
  el.querySelectorAll('[data-i18n]').forEach((line) => {
    const text = line.textContent.trim();
    const words = text.split(/(\s+)/);
    line.innerHTML = words.map((w) =>
      /\s+/.test(w) ? w : `<span class="word-part">${w}</span>`
    ).join('');
  });
  el.querySelectorAll('.word-part').forEach((w, i) => {
    w.style.transitionDelay = `${i * 55}ms`;
  });
}

const heroTitle = document.querySelector('.hero-title[data-split]');
if (heroTitle) {
  splitWords(heroTitle);

  // Reveal once in viewport
  const heroIo = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        heroTitle.classList.add('is-visible');
        heroIo.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });
  heroIo.observe(heroTitle);
}

// --- EN/DE toggle — direct click binding + delegated fallback ---
function handleLangClick(btn) {
  const lang = btn && btn.dataset && btn.dataset.lang;
  if (!lang) return;
  applyLang(lang);
  if (heroTitle) {
    splitWords(heroTitle);
    if (heroTitle.classList.contains('is-visible')) {
      heroTitle.classList.remove('is-visible');
      requestAnimationFrame(() => heroTitle.classList.add('is-visible'));
    }
  }
}

// Direct bind on the two buttons
document.querySelectorAll('.lang-btn').forEach((b) => {
  b.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleLangClick(b);
  });
});

// Delegated fallback (covers any future DOM replacement)
document.addEventListener('click', (e) => {
  const btn = e.target && e.target.closest && e.target.closest('.lang-btn');
  if (!btn) return;
  handleLangClick(btn);
});

// --- Mouse-follow spotlight for cards ---
document.querySelectorAll('.skill-card, .module, .stat').forEach((el) => {
  el.addEventListener('mousemove', (e) => {
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  });
});

// --- Gentle parallax on blobs, locked to scroll ---
const blobs = document.querySelectorAll('.blob');
if (blobs.length) {
  let lastY = 0, ticking = false;
  const update = () => {
    blobs.forEach((b, i) => {
      const depth = (i + 1) * 0.04;
      b.style.translate = `0 ${lastY * depth}px`;
    });
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    lastY = window.scrollY;
    if (!ticking) { requestAnimationFrame(update); ticking = true; }
  }, { passive: true });
}
