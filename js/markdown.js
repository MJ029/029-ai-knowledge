// Tiny markdown -> HTML. Supports: #/##/### headers, bold, italic, inline code,
// links, unordered lists, paragraphs. Enough for this site's content, no dependency.
const Markdown = (() => {
  function escapeHtml(s) {
    return s
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function inline(text) {
    let out = escapeHtml(text);
    out = out.replace(/`([^`]+)`/g, "<code>$1</code>");
    out = out.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    out = out.replace(/\*([^*]+)\*/g, "<em>$1</em>");
    out = out.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (m, label, href) => {
      const external = /^https?:\/\//.test(href);
      const attrs = external ? ' target="_blank" rel="noopener"' : "";
      return `<a href="${href}"${attrs}>${label}</a>`;
    });
    return out;
  }

  function toHtml(md) {
    const lines = md.replace(/\r\n/g, "\n").split("\n");
    let html = "";
    let inList = false;

    const closeList = () => {
      if (inList) {
        html += "</ul>";
        inList = false;
      }
    };

    for (const raw of lines) {
      const line = raw.trim();

      if (line === "") {
        closeList();
        continue;
      }
      if (line.startsWith("### ")) {
        closeList();
        html += `<h3>${inline(line.slice(4))}</h3>`;
        continue;
      }
      if (line.startsWith("## ")) {
        closeList();
        html += `<h2>${inline(line.slice(3))}</h2>`;
        continue;
      }
      if (line.startsWith("# ")) {
        closeList();
        html += `<h2>${inline(line.slice(2))}</h2>`;
        continue;
      }
      if (line.startsWith("- ")) {
        if (!inList) {
          html += "<ul>";
          inList = true;
        }
        html += `<li>${inline(line.slice(2))}</li>`;
        continue;
      }
      closeList();
      html += `<p>${inline(line)}</p>`;
    }
    closeList();
    return html;
  }

  return { toHtml };
})();
