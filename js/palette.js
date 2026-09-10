const CommandPalette = (() => {
  let items = [];
  let filtered = [];
  let selected = 0;
  let els = null;

  function build() {
    els = {
      bar: document.getElementById("search-bar"),
      input: document.getElementById("global-search"),
      dropdown: document.getElementById("search-dropdown"),
    };

    els.input.addEventListener("input", () => filter(els.input.value));
    els.input.addEventListener("focus", () => filter(els.input.value));
    els.input.addEventListener("keydown", (e) => {
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
        els.input.blur();
      }
    });

    els.dropdown.addEventListener("mousedown", (e) => e.preventDefault());

    document.addEventListener("mousedown", (e) => {
      if (!els.bar.contains(e.target)) close();
    });
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
    open();
  }

  function renderResults() {
    if (!filtered.length) {
      els.dropdown.innerHTML = `<div class="palette-empty">No matches</div>`;
      return;
    }
    els.dropdown.innerHTML = filtered
      .map(
        (item, i) => `
        <div class="palette-row${i === selected ? " selected" : ""}" data-index="${i}">
          <span class="palette-row-icon">${Icons.svg(item.icon, 15)}</span>
          <span class="palette-row-title">${item.title}</span>
          <span class="palette-row-meta">${item.type === "blog" ? "Blog" : item.category}</span>
        </div>`
      )
      .join("");
    Array.from(els.dropdown.querySelectorAll(".palette-row")).forEach((row) => {
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
    els.input.value = "";
    close();
    els.input.blur();
  }

  function open() {
    els.dropdown.hidden = false;
  }

  function close() {
    els.dropdown.hidden = true;
  }

  function init(searchItems) {
    items = searchItems;
    if (!els) build();
    window.addEventListener("keydown", (e) => {
      const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (metaK) {
        e.preventDefault();
        els.input.focus();
        els.input.select();
      }
    });
  }

  return { init, open, close };
})();
