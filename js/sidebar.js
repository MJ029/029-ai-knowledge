const Sidebar = (() => {
  function itemRow(item, activeId) {
    const a = document.createElement("a");
    a.className = "nav-item";
    a.href = item.href;
    a.innerHTML = `<span class="nav-item-icon">${Icons.svg(item.icon, 14)}</span><span class="nav-item-text">${item.title}</span>`;
    a.dataset.id = item.id;
    if (item.id === activeId) a.classList.add("active");
    return a;
  }

  function render(container, { site, blog, activeId, onNavigate }) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "sidebar-header";
    header.innerHTML = `
      <a class="sidebar-title" href="#/"><span class="dot"></span>${site.title}</a>
      <div class="sidebar-tagline">${site.tagline}</div>
    `;
    container.appendChild(header);

    const searchBox = document.createElement("div");
    searchBox.className = "search-box";
    searchBox.innerHTML = `<input type="text" placeholder="Search blog posts" aria-label="Search" />`;
    container.appendChild(searchBox);
    const searchInput = searchBox.querySelector("input");

    const navScroll = document.createElement("div");
    navScroll.className = "nav-scroll";
    container.appendChild(navScroll);

    const RECENT_BLOG_COUNT = 8;
    const recentBlog = [...blog]
      .filter((b) => !b.hidden)
      .sort((a, b) => (a.date < b.date ? 1 : -1))
      .slice(0, RECENT_BLOG_COUNT);

    const byCategory = new Map();
    recentBlog.forEach((b) => {
      const cat = b.category || "General";
      if (!byCategory.has(cat)) byCategory.set(cat, []);
      byCategory.get(cat).push({ id: b.id, title: b.title, icon: b.icon || "post", href: `#/blog/${b.id}` });
    });

    const blogWrap = document.createElement("div");
    blogWrap.className = "nav-group";
    blogWrap.dataset.key = "__blog";

    const blogHeader = document.createElement("div");
    blogHeader.className = "nav-group-header";
    blogHeader.innerHTML = `<span class="chevron">▾</span><span>Blogs</span>`;
    blogHeader.addEventListener("click", () => blogWrap.classList.toggle("collapsed"));
    blogWrap.appendChild(blogHeader);

    const blogItemsWrap = document.createElement("div");
    blogItemsWrap.className = "nav-items";

    let blogContainsActive = false;
    byCategory.forEach((items, cat) => {
      if (cat === "General") {
        items.forEach((item) => {
          if (item.id === activeId) blogContainsActive = true;
          blogItemsWrap.appendChild(itemRow(item, activeId));
        });
        return;
      }

      const sub = document.createElement("div");
      sub.className = "nav-subgroup";

      const subHeader = document.createElement("div");
      subHeader.className = "nav-subgroup-header";
      subHeader.innerHTML = `<span class="chevron">▾</span><span>${cat}</span>`;
      subHeader.addEventListener("click", () => sub.classList.toggle("collapsed"));
      sub.appendChild(subHeader);

      const subItemsWrap = document.createElement("div");
      subItemsWrap.className = "nav-items";
      items.forEach((item) => {
        if (item.id === activeId) blogContainsActive = true;
        subItemsWrap.appendChild(itemRow(item, activeId));
      });
      sub.appendChild(subItemsWrap);
      blogItemsWrap.appendChild(sub);
    });

    blogWrap.appendChild(blogItemsWrap);
    if (activeId && !blogContainsActive) blogWrap.classList.add("collapsed");
    navScroll.appendChild(blogWrap);

    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      const items = Array.from(blogItemsWrap.querySelectorAll(".nav-item"));
      let anyVisible = false;
      items.forEach((el) => {
        const match = !q || el.textContent.toLowerCase().includes(q);
        el.classList.toggle("hidden", !match);
        if (match) anyVisible = true;
      });
      Array.from(blogItemsWrap.querySelectorAll(".nav-subgroup")).forEach((sub) => {
        const visibleCount = sub.querySelectorAll(".nav-item:not(.hidden)").length;
        sub.style.display = visibleCount ? "" : "none";
        if (q && visibleCount) sub.classList.remove("collapsed");
      });
      blogWrap.style.display = anyVisible ? "" : "none";
      if (q && anyVisible) blogWrap.classList.remove("collapsed");
    });

    const pinned = document.createElement("div");
    pinned.className = "sidebar-pinned";
    const graphLink = document.createElement("a");
    graphLink.className = "nav-item";
    graphLink.href = "#/graph";
    graphLink.innerHTML = `<span class="nav-item-icon">${Icons.svg("network", 14)}</span><span class="nav-item-text">Graph (Preview)</span>`;
    graphLink.dataset.id = "__graph";
    if (activeId === "__graph") graphLink.classList.add("active");
    pinned.appendChild(graphLink);
    container.appendChild(pinned);

    const footer = document.createElement("div");
    footer.className = "sidebar-footer";
    footer.innerHTML = `<span style="font-size:11px;color:var(--text-dim)">${site.author}</span>`;
    container.appendChild(footer);
  }

  return { render };
})();
