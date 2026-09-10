const CommandPalette = (() => {
  let items = [];
  let filtered = [];
  let selected = 0;
  let els = null;

  function build() {
    const overlay = document.createElement("div");
    overlay.className = "palette-overlay";
    overlay.hidden = true;
    overlay.innerHTML = `
      <div class="palette-modal" role="dialog" aria-label="Search">
        <div class="palette-input-row">
          <span class="palette-search-icon">${Icons.svg("search", 16)}</span>
          <input type="text" class="palette-input" placeholder="Jump to a topic or post…" autocomplete="off" />
          <kbd class="palette-esc">esc</kbd>
        </div>
        <div class="palette-results"></div>
      </div>
    `;
    document.body.appendChild(overlay);

    const modal = overlay.querySelector(".palette-modal");
    const input = overlay.querySelector(".palette-input");
    const results = overlay.querySelector(".palette-results");

    overlay.addEventListener("mousedown", (e) => {
      if (e.target === overlay) close();
    });
    modal.addEventListener("mousedown", (e) => e.stopPropagation());

    input.addEventListener("input", () => {
      filter(input.value);
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        move(1);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        move(-1);
      } else if (e.key === "Enter") {
        e.preventDefault();
        commit(selected);
      } else if (e.key === "Escape") {
        close();
      }
    });

    els = { overlay, modal, input, results };
  }

  function score(item, q) {
    const t = item.title.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 50;
    if ((item.category || "").toLowerCase().includes(q)) return 20;
    return -1;
  }

  function filter(query) {
    const q = query.trim().toLowerCase();
    filtered = !q
      ? items.slice(0, 8)
      : items
          .map((item) => ({ item, s: score(item, q) }))
          .filter((x) => x.s > 0)
          .sort((a, b) => b.s - a.s)
          .slice(0, 8)
          .map((x) => x.item);
    selected = 0;
    renderResults();
  }

  function renderResults() {
    if (!filtered.length) {
      els.results.innerHTML = `<div class="palette-empty">No matches</div>`;
      return;
    }
    els.results.innerHTML = filtered
      .map(
        (item, i) => `
        <div class="palette-row${i === selected ? " selected" : ""}" data-index="${i}">
          <span class="palette-row-icon">${Icons.svg(item.icon, 15)}</span>
          <span class="palette-row-title">${item.title}</span>
          <span class="palette-row-meta">${item.type === "blog" ? "Blog" : item.category}</span>
        </div>`
      )
      .join("");
    Array.from(els.results.querySelectorAll(".palette-row")).forEach((row) => {
      row.addEventListener("mouseenter", () => {
        selected = Number(row.dataset.index);
        renderResults();
      });
      row.addEventListener("click", () => commit(Number(row.dataset.index)));
    });
  }

  function move(delta) {
    if (!filtered.length) return;
    selected = (selected + delta + filtered.length) % filtered.length;
    renderResults();
  }

  function commit(index) {
    const item = filtered[index];
    if (!item) return;
    location.hash = item.href;
    close();
  }

  function open() {
    els.overlay.hidden = false;
    els.input.value = "";
    filter("");
    setTimeout(() => els.input.focus(), 0);
  }

  function close() {
    els.overlay.hidden = true;
  }

  function init(searchItems) {
    items = searchItems;
    if (!els) build();
    window.addEventListener("keydown", (e) => {
      const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (metaK) {
        e.preventDefault();
        els.overlay.hidden ? open() : close();
      } else if (e.key === "Escape" && !els.overlay.hidden) {
        close();
      }
    });
  }

  return { init, open, close };
})();
