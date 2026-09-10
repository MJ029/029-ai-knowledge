const EvalsRoadmap = (() => {
  const MODULES = [
    { id: "m0", era: "e0", title: "How to think about evals", yr: "the mental model" },
    { id: "m1", era: "e1", title: "Information retrieval", yr: "1966–1999" },
    { id: "m2", era: "e2", title: "Traditional ML", yr: "1990–2015" },
    { id: "m3", era: "e3", title: "Text generation", yr: "2002–2020" },
    { id: "m4", era: "e4", title: "Neural retrieval & embeddings", yr: "2018–2023" },
    { id: "m5", era: "e5", title: "RAG", yr: "2023–2025" },
    { id: "m6", era: "e6", title: "LLM-as-a-judge", yr: "2023–now" },
    { id: "m7", era: "e7", title: "Agents & tool calling", yr: "2023–2026" },
    { id: "m8", era: "e8", title: "Skills, multi-agent, production", yr: "2025–2026" },
    { id: "m9", era: "e9", title: "Statistics & golden sets", yr: "cross-cutting" },
    { id: "m10", era: "e0", title: "Interview drills", yr: "answers, tables" },
  ];

  let cache = null;

  function railHtml() {
    const items = MODULES.map(
      (m) => `
      <li style="--m:var(--${m.era})" data-id="${m.id}">
        <span class="dot"></span>
        <a href="#${m.id}">${m.title}<span class="yr">${m.yr}</span></a>
      </li>`
    ).join("");
    return `
      <nav class="evals-nav" aria-label="Modules"><ol>${items}</ol></nav>`;
  }

  function load() {
    if (cache) return Promise.resolve(cache);
    return fetch("content/evals/roadmap.html")
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((html) => {
        cache = html;
        return html;
      });
  }

  function mount(container, section) {
    container.innerHTML = `<div class="page"><div class="empty-state">Loading…</div></div>`;
    load()
      .then((html) => {
        container.innerHTML = `
          <div class="evals-page" id="evalsPage">
            <button class="evals-toggle" id="evalsToggle" type="button" aria-expanded="false">Contents ▾</button>
            <div class="evals-content">${html}</div>
            <aside class="evals-rail" id="evalsRail">${railHtml()}</aside>
          </div>`;
        init(container, section);
      })
      .catch(() => {
        container.innerHTML = `<div class="page"><div class="empty-state">Couldn't load the EVALS roadmap.</div></div>`;
      });
  }

  function init(root, initialSection) {
    const page = root.querySelector("#evalsPage");
    const scrollEl = document.querySelector(".main");
    const toggle = root.querySelector("#evalsToggle");
    const railEl = root.querySelector("#evalsRail");
    const navItems = Array.prototype.slice.call(root.querySelectorAll(".evals-nav li"));
    const links = Array.prototype.slice.call(root.querySelectorAll(".evals-nav a"));
    const sections = Array.prototype.slice.call(root.querySelectorAll(".evals-content .module"));
    const byId = {};
    sections.forEach((sec) => (byId[sec.id] = sec));

    function prefersReduced() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    /* ---------- scrollspy ---------- */
    // Keeps the rail's own scroll in sync with the active item without ever
    // touching .main's scroll position (Element.scrollIntoView on the rail
    // item can otherwise bubble up and fight the section-scroll animation).
    function scrollRailToItem(li) {
      if (!li || !railEl) return;
      const railRect = railEl.getBoundingClientRect();
      const liRect = li.getBoundingClientRect();
      if (liRect.top < railRect.top) {
        railEl.scrollTop -= railRect.top - liRect.top;
      } else if (liRect.bottom > railRect.bottom) {
        railEl.scrollTop += liRect.bottom - railRect.bottom;
      }
    }

    let current = null;
    function setActive(id) {
      if (id === current) return;
      current = id;
      let activeLi = null;
      navItems.forEach((li) => {
        const isActive = li.dataset.id === id;
        li.classList.toggle("active", isActive);
        if (isActive) activeLi = li;
      });
      scrollRailToItem(activeLi);
    }

    function scrollToSection(id, smooth) {
      const target = byId[id];
      if (!target) return;
      target.scrollIntoView({ behavior: smooth && !prefersReduced() ? "smooth" : "auto", block: "start" });
      history.replaceState(null, "", "#/evals/roadmap/" + id);
      setActive(id);
    }

    links.forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        scrollToSection(a.closest("li").dataset.id, true);
        if (page.classList.contains("rail-open")) setRailOpen(false);
      });
    });

    function onScroll() {
      const line = window.innerHeight * 0.28;
      let active = sections[0] && sections[0].id;
      for (let i = 0; i < sections.length; i++) {
        const sec = sections[i];
        if (sec.getBoundingClientRect().top <= line) active = sec.id;
      }
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4 && sections.length) {
        active = sections[sections.length - 1].id;
      }
      if (active) setActive(active);
    }

    let ticking = false;
    function onScrollThrottled() {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(() => {
        onScroll();
        ticking = false;
      });
    }
    scrollEl.addEventListener("scroll", onScrollThrottled, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    /* ---------- mobile contents toggle ---------- */
    function setRailOpen(open) {
      page.classList.toggle("rail-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", () => setRailOpen(!page.classList.contains("rail-open")));

    if (initialSection && byId[initialSection]) {
      requestAnimationFrame(() => scrollToSection(initialSection, false));
    } else {
      onScroll();
    }
  }

  return { mount };
})();
