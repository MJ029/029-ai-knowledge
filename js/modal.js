const Modal = (() => {
  function scrollEl() {
    return document.querySelector(".main");
  }

  function open(id) {
    const backdrop = document.getElementById(id);
    if (!backdrop) return;
    backdrop.classList.add("open");
    const s = scrollEl();
    if (s) s.style.overflow = "hidden";
  }

  function close(from) {
    const backdrop = from && from.classList && from.classList.contains("modal-backdrop") ? from : from && from.closest(".modal-backdrop");
    if (!backdrop) return;
    backdrop.classList.remove("open");
    const s = scrollEl();
    if (s) s.style.overflow = "";
  }

  function closeAll() {
    document.querySelectorAll(".modal-backdrop.open").forEach((b) => b.classList.remove("open"));
    const s = scrollEl();
    if (s) s.style.overflow = "";
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });

  window.openModal = open;
  window.closeModal = close;

  return { open, close, closeAll };
})();
