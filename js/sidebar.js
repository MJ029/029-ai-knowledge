const Sidebar = (() => {
  function render(container, { site, categories, topics, blog, activeId, onNavigate }) {
    container.innerHTML = "";

    const header = document.createElement("div");
    header.className = "sidebar-header";
    header.innerHTML = `
      <div class="sidebar-title"><span class="dot"></span>${site.title}</div>
      <div class="sidebar-tagline">${site.tagline}</div>
    `;
    container.appendChild(header);

    const searchBox = document.createElement("div");
    searchBox.className = "search-box";
    searchBox.innerHTML = `<input type="text" placeholder="Search topics & posts" aria-label="Search" />`;
    container.appendChild(searchBox);
    const searchInput = searchBox.querySelector("input");

    const navScroll = document.createElement("div");
    navScroll.className = "nav-scroll";
    container.appendChild(navScroll);

    const groupDefs = categories.map((cat) => ({
      key: cat,
      label: cat,
      items: topics
        .filter((t) => t.category === cat)
        .map((t) => ({ id: t.id, title: t.title, href: `#/topic/${t.id}` })),
    }));
    groupDefs.push({
      key: "__blog",
      label: "Blog",
      items: blog.map((b) => ({ id: b.id, title: b.title, href: `#/blog/${b.id}` })),
    });
    groupDefs.push({
      key: "__meta",
      label: "Browse",
      items: [{ id: "__all-blog", title: "All posts", href: "#/blog" }],
    });

    const groupEls = groupDefs.map((group) => {
      const wrap = document.createElement("div");
      wrap.className = "nav-group";
      wrap.dataset.key = group.key;

      const gHeader = document.createElement("div");
      gHeader.className = "nav-group-header";
      gHeader.innerHTML = `<span class="chevron">▾</span><span>${group.label}</span>`;
      gHeader.addEventListener("click", () => {
        wrap.classList.toggle("collapsed");
      });
      wrap.appendChild(gHeader);

      const itemsWrap = document.createElement("div");
      itemsWrap.className = "nav-items";
      group.items.forEach((item) => {
        const a = document.createElement("a");
        a.className = "nav-item";
        a.href = item.href;
        a.textContent = item.title;
        a.dataset.id = item.id;
        if (item.id === activeId) a.classList.add("active");
        itemsWrap.appendChild(a);
      });
      wrap.appendChild(itemsWrap);
      navScroll.appendChild(wrap);
      return wrap;
    });

    searchInput.addEventListener("input", () => {
      const q = searchInput.value.trim().toLowerCase();
      groupEls.forEach((wrap) => {
        const items = Array.from(wrap.querySelectorAll(".nav-item"));
        let anyVisible = false;
        items.forEach((el) => {
          const match = !q || el.textContent.toLowerCase().includes(q);
          el.classList.toggle("hidden", !match);
          if (match) anyVisible = true;
        });
        wrap.style.display = anyVisible ? "" : "none";
        if (q && anyVisible) wrap.classList.remove("collapsed");
      });
    });

    const footer = document.createElement("div");
    footer.className = "sidebar-footer";
    footer.innerHTML = `<span style="font-size:11px;color:var(--text-dim)">${site.author}</span>`;
    container.appendChild(footer);
  }

  return { render };
})();
