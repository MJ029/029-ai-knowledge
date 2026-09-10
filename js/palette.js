const CommandPalette = (() => {
  let items = [];
  const widgets = [];

  function score(item, q) {
    const t = item.title.toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80;
    if (t.includes(q)) return 50;
    if ((item.category || "").toLowerCase().includes(q)) return 20;
    return -1;
  }

  function mount({ barId, inputId, dropdownId }) {
    const bar = document.getElementById(barId);
    const input = document.getElementById(inputId);
    const dropdown = document.getElementById(dropdownId);
    if (!bar || !input || !dropdown) return null;

    let filtered = [];
    let selected = 0;

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
        dropdown.innerHTML = `<div class="palette-empty">No matches</div>`;
        return;
      }
      dropdown.innerHTML = filtered
        .map(
          (item, i) => `
          <div class="palette-row${i === selected ? " selected" : ""}" data-index="${i}">
            <span class="palette-row-icon">${Icons.svg(item.icon, 15)}</span>
            <span class="palette-row-title">${item.title}</span>
            <span class="palette-row-meta">${item.type === "blog" ? "Blog" : item.category}</span>
          </div>`
        )
        .join("");
      Array.from(dropdown.querySelectorAll(".palette-row")).forEach((row) => {
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
      input.value = "";
      close();
      input.blur();
    }

    function open() {
      dropdown.hidden = false;
    }
    function close() {
      dropdown.hidden = true;
    }

    input.addEventListener("input", () => filter(input.value));
    input.addEventListener("focus", () => filter(input.value));
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
        input.blur();
      }
    });
    dropdown.addEventListener("mousedown", (e) => e.preventDefault());

    const widget = {
      bar,
      close,
      focusInput() {
        input.focus();
        input.select();
      },
    };
    widgets.unshift(widget);
    return widget;
  }

  function focusAny() {
    const w = widgets.find((w) => w.bar.isConnected && w.bar.offsetParent !== null);
    if (w) w.focusInput();
  }

  function closeAll() {
    widgets.forEach((w) => w.bar.isConnected && w.close());
  }

  function init(searchItems) {
    items = searchItems;
    document.addEventListener("mousedown", (e) => {
      widgets.forEach((w) => {
        if (w.bar.isConnected && !w.bar.contains(e.target)) w.close();
      });
    });
    window.addEventListener("keydown", (e) => {
      const metaK = (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k";
      if (metaK) {
        e.preventDefault();
        focusAny();
      } else if (e.key === "Escape") {
        closeAll();
      }
    });
  }

  return { init, mount };
})();
