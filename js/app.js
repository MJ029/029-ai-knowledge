(function () {
  Theme.init();

  const state = { manifest: null, graphData: null };

  const el = {
    app: document.getElementById("app"),
    sidebar: document.getElementById("sidebar"),
    main: document.getElementById("main-content"),
    breadcrumb: document.getElementById("breadcrumb"),
    themeToggle: document.getElementById("theme-toggle"),
    navToggle: document.getElementById("nav-toggle"),
  };

  function topicById(id) {
    return state.manifest.topics.find((t) => t.id === id);
  }
  function blogById(id) {
    return state.manifest.blog.find((b) => b.id === id);
  }
  function nodeTitle(id) {
    const t = topicById(id);
    if (t) return t.title;
    const b = blogById(id);
    if (b) return b.title;
    return id;
  }

  function buildGraphData(manifest) {
    const nodes = manifest.topics
      .map((t) => ({ id: t.id, title: t.title, type: "topic", category: t.category }))
      .concat(manifest.blog.map((b) => ({ id: b.id, title: b.title, type: "blog" })));

    const seen = new Set();
    const edges = [];
    function addEdge(a, b) {
      if (a === b) return;
      const key = [a, b].sort().join("|");
      if (seen.has(key)) return;
      seen.add(key);
      edges.push({ source: a, target: b });
    }
    manifest.topics.forEach((t) => (t.related || []).forEach((r) => addEdge(t.id, r)));
    manifest.blog.forEach((b) => (b.related || []).forEach((r) => addEdge(b.id, r)));
    return { nodes, edges };
  }

  function buildSearchItems(manifest) {
    const topicItems = manifest.topics.map((t) => ({
      id: t.id,
      title: t.title,
      type: "topic",
      category: t.category,
      icon: t.icon,
      href: `#/topic/${t.id}`,
    }));
    const blogItems = manifest.blog.map((b) => ({
      id: b.id,
      title: b.title,
      type: "blog",
      category: "Blog",
      icon: b.icon || "post",
      href: `#/blog/${b.id}`,
    }));
    return topicItems.concat(blogItems);
  }

  function parseHash() {
    const h = location.hash.replace(/^#\/?/, "");
    const parts = h.split("/").filter(Boolean);
    if (parts.length === 0) return { name: "home" };
    if (parts[0] === "topic" && parts[1]) return { name: "topic", id: parts[1] };
    if (parts[0] === "blog" && parts[1]) return { name: "blog-post", id: parts[1] };
    if (parts[0] === "blog") return { name: "blog-list" };
    return { name: "home" };
  }

  function setBreadcrumb(trail) {
    const home = `<a href="#/" class="crumb-home">Home</a>`;
    el.breadcrumb.innerHTML = trail ? `${home}<span style="opacity:.5"> / </span>${trail}` : home;
  }

  function relatedChipsHtml(relatedIds, currentId) {
    if (!relatedIds || !relatedIds.length) return "";
    const chips = relatedIds
      .filter((id) => id !== currentId)
      .map((id) => {
        const isTopic = !!topicById(id);
        const href = isTopic ? `#/topic/${id}` : `#/blog/${id}`;
        const cls = isTopic ? "chip" : "chip blog";
        return `<a class="${cls}" href="${href}">${nodeTitle(id)}</a>`;
      })
      .join("");
    return `<div class="related-chips">${chips}</div>`;
  }

  function relatedPostsFor(topicId) {
    return state.manifest.blog.filter((b) => (b.related || []).includes(topicId));
  }

  function renderHome() {
    setBreadcrumb();
    el.main.innerHTML = `
      <div class="hero">
        <h1>${state.manifest.site.title}</h1>
        <p>${state.manifest.site.tagline} — click any node to jump straight into a topic.</p>
      </div>
      <div class="graph-wrap" id="graph-wrap">
        <div class="graph-canvas" id="graph-canvas"></div>
        <div class="graph-controls">
          <button class="icon-btn" id="graph-reset" title="Re-layout">↻</button>
        </div>
        <span class="graph-hint">drag to pan · scroll to zoom · click a node</span>
      </div>
    `;

    const mountGraph = () => {
      Graph.mount(document.getElementById("graph-canvas"), {
        nodes: state.graphData.nodes,
        edges: state.graphData.edges,
        onSelect: (n) => {
          location.hash = n.type === "blog" ? `#/blog/${n.id}` : `#/topic/${n.id}`;
        },
      });
    };
    mountGraph();
    document.getElementById("graph-reset").addEventListener("click", mountGraph);
  }

  function renderTopic(id) {
    const topic = topicById(id);
    if (!topic) return renderNotFound();
    setBreadcrumb(`Topics <span style="opacity:.5">/</span> <b>${topic.title}</b>`);
    el.main.innerHTML = `<div class="page"><div class="empty-state">Loading…</div></div>`;

    fetch(topic.file)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((md) => {
        const posts = relatedPostsFor(id);
        const postChips = posts
          .map((p) => `<a class="chip blog" href="#/blog/${p.id}">${p.title}</a>`)
          .join("");
        el.main.innerHTML = `
          <div class="page">
            <div class="page-eyebrow">${topic.category}</div>
            <h1>${topic.title}</h1>
            <div class="page-summary">${topic.summary}</div>
            <div class="md-body">${Markdown.toHtml(md)}</div>
            ${relatedChipsHtml(topic.related, id)}
            ${postChips ? `<div class="related-chips">${postChips}</div>` : ""}
          </div>
        `;
      })
      .catch(() => {
        el.main.innerHTML = `<div class="page"><div class="empty-state">Couldn't load this topic's content.</div></div>`;
      });
  }

  function renderBlogList() {
    setBreadcrumb("Blog");
    const posts = [...state.manifest.blog].sort((a, b) => (a.date < b.date ? 1 : -1));
    const cards = posts
      .map(
        (p) => `
        <a class="blog-card" href="#/blog/${p.id}">
          <div class="date">${p.date}</div>
          <h3>${p.title}</h3>
          <div class="summary">${p.summary}</div>
        </a>`
      )
      .join("");
    el.main.innerHTML = `
      <div class="page">
        <div class="page-eyebrow">Blog</div>
        <h1>Articles</h1>
        <div class="blog-list">${cards || '<div class="empty-state">No posts yet.</div>'}</div>
      </div>
    `;
  }

  function renderBlogPost(id) {
    const post = blogById(id);
    if (!post) return renderNotFound();
    setBreadcrumb(`Blog <span style="opacity:.5">/</span> <b>${post.title}</b>`);
    el.main.innerHTML = `<div class="page"><div class="empty-state">Loading…</div></div>`;

    fetch(post.file)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((md) => {
        el.main.innerHTML = `
          <div class="page">
            <div class="page-eyebrow">Blog</div>
            <h1>${post.title}</h1>
            <div class="page-meta">${post.date} · ${(post.tags || []).join(", ")}</div>
            <div class="md-body">${Markdown.toHtml(md)}</div>
            ${relatedChipsHtml(post.related, id)}
          </div>
        `;
      })
      .catch(() => {
        el.main.innerHTML = `<div class="page"><div class="empty-state">Couldn't load this post.</div></div>`;
      });
  }

  function renderNotFound() {
    setBreadcrumb("Not found");
    el.main.innerHTML = `<div class="page"><div class="empty-state">Nothing here. <a href="#/">Back home</a></div></div>`;
  }

  function refreshSidebar(activeId) {
    Sidebar.render(el.sidebar, {
      site: state.manifest.site,
      categories: state.manifest.categories,
      topics: state.manifest.topics,
      blog: state.manifest.blog,
      activeId,
      onNavigate: () => {},
    });
  }

  function route() {
    const r = parseHash();
    el.main.scrollTop = 0;
    if (r.name === "home") {
      refreshSidebar(null);
      renderHome();
    } else if (r.name === "topic") {
      refreshSidebar(r.id);
      renderTopic(r.id);
    } else if (r.name === "blog-list") {
      refreshSidebar("__all-blog");
      renderBlogList();
    } else if (r.name === "blog-post") {
      refreshSidebar(r.id);
      renderBlogPost(r.id);
    } else {
      refreshSidebar(null);
      renderNotFound();
    }
    if (window.innerWidth <= 760) el.app.classList.add("sidebar-collapsed");
  }

  function initChrome() {
    el.themeToggle.addEventListener("click", () => {
      const mode = Theme.toggle();
      el.themeToggle.textContent = mode === "dark" ? "☀" : "☾";
    });
    el.themeToggle.textContent = Theme.resolved() === "dark" ? "☀" : "☾";

    el.navToggle.addEventListener("click", () => {
      el.app.classList.toggle("sidebar-collapsed");
    });

    document.getElementById("search-bar-icon").innerHTML = Icons.svg("search", 15);

    if (window.innerWidth <= 760) el.app.classList.add("sidebar-collapsed");

    window.addEventListener("hashchange", route);
  }

  fetch("data/manifest.json")
    .then((r) => r.json())
    .then((manifest) => {
      state.manifest = manifest;
      state.graphData = buildGraphData(manifest);
      document.title = manifest.site.title;
      CommandPalette.init(buildSearchItems(manifest));
      initChrome();
      route();
    })
    .catch((err) => {
      el.main.innerHTML = `<div class="page"><div class="empty-state">Failed to load site data.<br><small>${err}</small></div></div>`;
    });
})();
