const Icons = (() => {
  const SET = {
    network: `<circle cx="6" cy="12" r="2.2"/><circle cx="18" cy="6" r="2.2"/><circle cx="18" cy="18" r="2.2"/><path d="M8.1 11l7.4-3.8"/><path d="M8.1 13l7.4 3.8"/>`,
    layers: `<path d="M12 3l8 4-8 4-8-4z"/><path d="M4 12l8 4 8-4"/><path d="M4 16l8 4 8-4"/>`,
    chat: `<path d="M4 5h16v11H8l-4 4z"/>`,
    eye: `<path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="2.6"/>`,
    spark: `<path d="M12 3l1.8 4.2L18 9l-4.2 1.8L12 15l-1.8-4.2L6 9l4.2-1.8z"/><path d="M19 15l.8 1.9 1.9.8-1.9.8L19 20.4l-.8-1.9-1.9-.8 1.9-.8z"/>`,
    cpu: `<rect x="7" y="7" width="10" height="10" rx="1.4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M5 19l2-2M17 7l2-2"/>`,
    bot: `<rect x="5" y="8" width="14" height="10" rx="2"/><path d="M12 8V4M9 4h6"/><circle cx="9.5" cy="13" r="1.1"/><circle cx="14.5" cy="13" r="1.1"/>`,
    shield: `<path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6z"/>`,
    post: `<path d="M6 3h9l3 3v15H6z"/><path d="M15 3v3h3"/><path d="M9 12h6M9 15h6M9 9h3"/>`,
    search: `<circle cx="10.5" cy="10.5" r="6.5"/><path d="M20 20l-5-5"/>`,
  };

  function svg(key, size) {
    const s = size || 15;
    const body = SET[key] || SET.post;
    return `<svg viewBox="0 0 24 24" width="${s}" height="${s}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
  }

  return { svg };
})();
