(function () {
  const galleryRoot = document.querySelector("[data-gallery]");
  if (!galleryRoot) return;

  const overlay = document.createElement("div");
  overlay.className = "lightbox";
  overlay.innerHTML = `
    <button class="lightbox__close" aria-label="Zatvoriť galériu">&times;</button>
    <div class="lightbox__content">
      <img src="" alt="" />
      <p class="lightbox__caption"></p>
    </div>
  `;
  document.body.append(overlay);

  const closeButton = overlay.querySelector(".lightbox__close");
  const overlayImage = overlay.querySelector("img");
  const overlayCaption = overlay.querySelector(".lightbox__caption");
  let previouslyFocusedElement = null;

  const closeLightbox = () => {
    overlay.classList.remove("is-visible");
    document.body.classList.remove("lightbox-open");
    if (previouslyFocusedElement instanceof HTMLElement) {
      previouslyFocusedElement.focus({ preventScroll: true });
    }
  };

  closeButton?.addEventListener("click", closeLightbox);
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeLightbox();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-visible")) {
      closeLightbox();
    }
  });

  galleryRoot.querySelectorAll("[data-gallery-item]").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.preventDefault();
      const link = event.currentTarget;
      if (!(link instanceof HTMLAnchorElement)) return;

      const image = link.querySelector("img");
      if (!image) return;

      overlayImage?.setAttribute("src", link.href);
      overlayImage?.setAttribute("alt", image.getAttribute("alt") || "Fotografia");
      if (overlayCaption) {
        overlayCaption.textContent =
          image.closest("figure")?.querySelector("figcaption")?.textContent || "";
      }

      previouslyFocusedElement = document.activeElement;

      document.body.classList.add("lightbox-open");
      window.requestAnimationFrame(() => overlay.classList.add("is-visible"));
      closeButton?.focus({ preventScroll: true });
    });
  });
})();
