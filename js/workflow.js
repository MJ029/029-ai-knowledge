const Workflow = (() => {
  const ICONS = {
    data: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><ellipse cx="12" cy="5" rx="7" ry="3"/><path d="M5 5v14c0 1.7 3.1 3 7 3s7-1.3 7-3V5"/><path d="M5 12c0 1.7 3.1 3 7 3s7-1.3 7-3"/></svg>`,
    train: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8.3 11l7.4-4"/><path d="M8.3 13l7.4 4"/></svg>`,
    generate: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 1.9L21.7 17.7l-1.9.8L19 20.4l-.8-1.9-1.9-.8 1.9-.8z"/></svg>`,
    deploy: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2c3 3 4 6 4 9 0 2-.5 3.5-1.3 5H9.3C8.5 14.5 8 13 8 11c0-3 1-6 4-9z"/><path d="M9 16l-2.5 5M15 16l2.5 5M10.3 16h3.4"/></svg>`,
    agent: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="5" y="8" width="14" height="10" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9.5" cy="13" r="1.2"/><circle cx="14.5" cy="13" r="1.2"/></svg>`,
  };

  function render(container, steps, onNavigate) {
    container.innerHTML = "";
    const strip = document.createElement("div");
    strip.className = "workflow-strip";

    steps.forEach((step, i) => {
      const btn = document.createElement("div");
      btn.className = "wf-step";
      btn.innerHTML = `
        <div class="wf-icon">${ICONS[step.icon] || ""}</div>
        <div class="wf-label">${step.label}</div>
      `;
      btn.addEventListener("click", () => onNavigate(step.href));
      strip.appendChild(btn);

      if (i < steps.length - 1) {
        const connector = document.createElement("div");
        connector.className = "wf-connector";
        strip.appendChild(connector);
      }
    });

    container.appendChild(strip);
  }

  return { render };
})();
