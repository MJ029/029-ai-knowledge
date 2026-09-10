// Hand-rolled force-directed graph renderer. No dependency.
// Graph.mount(container, {nodes, edges, activeId, onSelect}) -> handle
const Graph = (() => {
  const SVG_NS = "http://www.w3.org/2000/svg";

  function simulate(nodes, edges, width, height) {
    const idMap = new Map(nodes.map((n) => [n.id, n]));
    nodes.forEach((n, i) => {
      const angle = (i / nodes.length) * Math.PI * 2;
      n.x = width / 2 + Math.cos(angle) * 120 + (Math.random() - 0.5) * 20;
      n.y = height / 2 + Math.sin(angle) * 120 + (Math.random() - 0.5) * 20;
      n.vx = 0;
      n.vy = 0;
    });

    const REST = 150;
    const iterations = 350;

    for (let iter = 0; iter < iterations; iter++) {
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = a.x - b.x, dy = a.y - b.y;
          let distSq = dx * dx + dy * dy || 0.01;
          const force = 2800 / distSq;
          const dist = Math.sqrt(distSq);
          const fx = (dx / dist) * force, fy = (dy / dist) * force;
          a.vx += fx; a.vy += fy;
          b.vx -= fx; b.vy -= fy;
        }
      }
      edges.forEach((e) => {
        const a = idMap.get(e.source), b = idMap.get(e.target);
        if (!a || !b) return;
        let dx = b.x - a.x, dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const force = (dist - REST) * 0.02;
        const fx = (dx / dist) * force, fy = (dy / dist) * force;
        a.vx += fx; a.vy += fy;
        b.vx -= fx; b.vy -= fy;
      });
      nodes.forEach((n) => {
        n.vx += (width / 2 - n.x) * 0.0015;
        n.vy += (height / 2 - n.y) * 0.0015;
        n.vx *= 0.82; n.vy *= 0.82;
        n.x += n.vx; n.y += n.vy;
      });
    }

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    nodes.forEach((n) => {
      minX = Math.min(minX, n.x); maxX = Math.max(maxX, n.x);
      minY = Math.min(minY, n.y); maxY = Math.max(maxY, n.y);
    });
    const pad = 60;
    const bw = Math.max(maxX - minX, 1), bh = Math.max(maxY - minY, 1);
    const sx = (width - pad * 2) / bw;
    const sy = (height - pad * 2) / bh;
    const s = Math.min(sx, sy, 1.4);
    nodes.forEach((n) => {
      n.x = width / 2 + (n.x - (minX + bw / 2)) * s;
      n.y = height / 2 + (n.y - (minY + bh / 2)) * s;
    });
  }

  function degreeMap(nodes, edges) {
    const deg = new Map(nodes.map((n) => [n.id, 0]));
    edges.forEach((e) => {
      deg.set(e.source, (deg.get(e.source) || 0) + 1);
      deg.set(e.target, (deg.get(e.target) || 0) + 1);
    });
    return deg;
  }

  function mount(container, { nodes, edges, activeId, onSelect }) {
    container.innerHTML = "";
    const rect = container.getBoundingClientRect();
    const width = Math.max(rect.width, 320);
    const height = Math.max(rect.height, 320);

    const nodesCopy = nodes.map((n) => ({ ...n }));
    simulate(nodesCopy, edges, width, height);
    const deg = degreeMap(nodesCopy, edges);
    const idPos = new Map(nodesCopy.map((n) => [n.id, n]));

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("preserveAspectRatio", "xMidYMid meet");

    const viewport = document.createElementNS(SVG_NS, "g");
    svg.appendChild(viewport);

    const edgeLayer = document.createElementNS(SVG_NS, "g");
    const nodeLayer = document.createElementNS(SVG_NS, "g");
    viewport.appendChild(edgeLayer);
    viewport.appendChild(nodeLayer);

    const edgeEls = edges.map((e) => {
      const a = idPos.get(e.source), b = idPos.get(e.target);
      const line = document.createElementNS(SVG_NS, "line");
      line.setAttribute("class", "edge-line");
      if (a && b) {
        line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
        line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      }
      edgeLayer.appendChild(line);
      return { el: line, source: e.source, target: e.target };
    });

    const nodeEls = nodesCopy.map((n) => {
      const g = document.createElementNS(SVG_NS, "g");
      g.setAttribute("class", "node-group");
      g.setAttribute("transform", `translate(${n.x},${n.y})`);
      g.dataset.id = n.id;

      const r = 16 + Math.min(deg.get(n.id) || 0, 6) * 2.6;
      const circle = document.createElementNS(SVG_NS, "circle");
      circle.setAttribute("class", "node-circle" + (n.type === "blog" || n.type === "news" ? " blog" : ""));
      circle.setAttribute("r", r);
      if (n.id === activeId) circle.setAttribute("stroke-width", "3.5");
      g.appendChild(circle);

      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("class", "node-label");
      label.setAttribute("y", r + 14);
      label.textContent = n.title;
      g.appendChild(label);

      g.addEventListener("click", () => onSelect && onSelect(n));
      g.addEventListener("mouseenter", () => highlight(n.id));
      g.addEventListener("mouseleave", () => clearHighlight());

      nodeLayer.appendChild(g);
      return { el: g, id: n.id };
    });

    function highlight(id) {
      const connected = new Set([id]);
      edges.forEach((e) => {
        if (e.source === id) connected.add(e.target);
        if (e.target === id) connected.add(e.source);
      });
      nodeEls.forEach((n) => n.el.classList.toggle("dimmed", !connected.has(n.id)));
      edgeEls.forEach((e) => e.el.classList.toggle("dimmed", !(connected.has(e.source) && connected.has(e.target))));
    }
    function clearHighlight() {
      nodeEls.forEach((n) => n.el.classList.remove("dimmed"));
      edgeEls.forEach((e) => e.el.classList.remove("dimmed"));
    }

    // pan + zoom
    let tx = 0, ty = 0, k = 1;
    let dragging = false, lastX = 0, lastY = 0;

    function applyTransform() {
      viewport.setAttribute("transform", `translate(${tx},${ty}) scale(${k})`);
    }

    svg.addEventListener("mousedown", (e) => {
      if (e.target.closest(".node-group")) return;
      dragging = true;
      lastX = e.clientX; lastY = e.clientY;
    });
    window.addEventListener("mousemove", (e) => {
      if (!dragging) return;
      const ratio = width / svg.clientWidth;
      tx += (e.clientX - lastX) * ratio;
      ty += (e.clientY - lastY) * ratio;
      lastX = e.clientX; lastY = e.clientY;
      applyTransform();
    });
    window.addEventListener("mouseup", () => { dragging = false; });

    svg.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        const ratio = width / svg.clientWidth;
        const pointerX = (e.clientX - svg.getBoundingClientRect().left) * ratio;
        const pointerY = (e.clientY - svg.getBoundingClientRect().top) * ratio;
        const prevK = k;
        const delta = -e.deltaY * 0.0016;
        k = Math.min(2.4, Math.max(0.4, k * (1 + delta)));
        tx = pointerX - ((pointerX - tx) / prevK) * k;
        ty = pointerY - ((pointerY - ty) / prevK) * k;
        applyTransform();
      },
      { passive: false }
    );

    // touch support (basic single-finger pan)
    let touchLast = null;
    svg.addEventListener("touchstart", (e) => {
      if (e.touches.length === 1) touchLast = e.touches[0];
    }, { passive: true });
    svg.addEventListener("touchmove", (e) => {
      if (!touchLast || e.touches.length !== 1) return;
      const t = e.touches[0];
      const ratio = width / svg.clientWidth;
      tx += (t.clientX - touchLast.clientX) * ratio;
      ty += (t.clientY - touchLast.clientY) * ratio;
      touchLast = t;
      applyTransform();
    }, { passive: true });
    svg.addEventListener("touchend", () => { touchLast = null; });

    container.appendChild(svg);

    return {
      destroy() {
        container.innerHTML = "";
      },
    };
  }

  return { mount };
})();
