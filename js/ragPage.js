const RagPage = (() => {
  const cache = {};

  function slugify(text) {
    return (
      text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "section"
    );
  }

  function load(file) {
    if (cache[file]) return Promise.resolve(cache[file]);
    return fetch(file)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((html) => {
        cache[file] = html;
        return html;
      });
  }

  function railHtml(sections) {
    const items = sections
      .map((s) => `<li data-id="${s.id}"><span class="dot"></span><a href="#${s.id}">${s.title}</a></li>`)
      .join("");
    return `<nav class="rag-nav" aria-label="Contents"><div class="rag-nav-label">Contents</div><ol>${items}</ol></nav>`;
  }

  function mount(container, item, parent, footerHtml) {
    container.innerHTML = `<div class="page"><div class="empty-state">Loading…</div></div>`;
    load(item.file)
      .then((html) => {
        container.innerHTML = `
          <div class="rag-page" id="ragPage">
            <button class="rag-toggle" id="ragToggle" type="button" aria-expanded="false">Contents ▾</button>
            <div class="rag-content" id="ragContent">${html}${footerHtml || ""}</div>
            <aside class="rag-rail" id="ragRail"></aside>
          </div>`;
        init(container, item, parent);
      })
      .catch(() => {
        container.innerHTML = `<div class="page"><div class="empty-state">Couldn't load this section.</div></div>`;
      });
  }

  function init(root, item, parent) {
    const page = root.querySelector("#ragPage");
    const content = root.querySelector("#ragContent");
    const rail = root.querySelector("#ragRail");
    const toggle = root.querySelector("#ragToggle");

    if (!content.querySelector(":scope > .hero")) {
      const hero = document.createElement("header");
      hero.className = "hero";
      hero.innerHTML = `<h1>${item.title}</h1>`;
      content.insertBefore(hero, content.firstChild);
    }

    const headings = Array.prototype.slice.call(content.querySelectorAll(":scope > h2"));
    if (!headings.length) {
      page.classList.add("no-rail");
      rail.remove();
      toggle.remove();
      return;
    }

    const sections = headings.map((h) => {
      if (!h.id) h.id = slugify(h.textContent);
      return { id: h.id, title: h.textContent };
    });
    rail.innerHTML = railHtml(sections);

    const scrollEl = document.querySelector(".main");
    const navItems = Array.prototype.slice.call(rail.querySelectorAll(".rag-nav li"));
    const links = Array.prototype.slice.call(rail.querySelectorAll(".rag-nav a"));
    const byId = {};
    headings.forEach((h) => (byId[h.id] = h));

    function prefersReduced() {
      return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    function scrollRailToItem(li) {
      if (!li) return;
      const railRect = rail.getBoundingClientRect();
      const liRect = li.getBoundingClientRect();
      if (liRect.top < railRect.top) {
        rail.scrollTop -= railRect.top - liRect.top;
      } else if (liRect.bottom > railRect.bottom) {
        rail.scrollTop += liRect.bottom - railRect.bottom;
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
      let active = headings[0] && headings[0].id;
      for (let i = 0; i < headings.length; i++) {
        if (headings[i].getBoundingClientRect().top <= line) active = headings[i].id;
      }
      if (scrollEl.scrollTop + scrollEl.clientHeight >= scrollEl.scrollHeight - 4 && headings.length) {
        active = headings[headings.length - 1].id;
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

    function setRailOpen(open) {
      page.classList.toggle("rail-open", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    }
    toggle.addEventListener("click", () => setRailOpen(!page.classList.contains("rail-open")));

    onScroll();
  }

  return { mount };
})();
