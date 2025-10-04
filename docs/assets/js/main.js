document.addEventListener("DOMContentLoaded", () => {
  const navToggle = document.querySelector(".nav-toggle");
  const navList = document.querySelector(".nav-list");
  const navLinks = navList ? navList.querySelectorAll("a[href^='#']") : [];

  if (navToggle && navList) {
    if (!navToggle.hasAttribute("aria-label")) {
      navToggle.setAttribute("aria-label", "Zobraziť menu");
    }
    navToggle.addEventListener("click", () => {
      const isOpen = navList.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Zavrieť menu" : "Zobraziť menu");
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && navList.classList.contains("is-open")) {
        navList.classList.remove("is-open");
        navToggle.setAttribute("aria-expanded", "false");
        navToggle.setAttribute("aria-label", "Zobraziť menu");
        navToggle.focus();
      }
    });
  }

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const targetEl = document.querySelector(targetId);
      if (!targetEl) return;

      event.preventDefault();
      targetEl.scrollIntoView({ behavior: "smooth", block: "start" });

      if (navList && navList.classList.contains("is-open")) {
        navList.classList.remove("is-open");
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.setAttribute("aria-label", "Zobraziť menu");
      }

      const focusableHeading = targetEl.querySelector("h1, h2, h3");
      if (focusableHeading && focusableHeading instanceof HTMLElement) {
        focusableHeading.setAttribute("tabindex", "-1");
        focusableHeading.focus({ preventScroll: true });
        focusableHeading.addEventListener(
          "blur",
          () => focusableHeading.removeAttribute("tabindex"),
          { once: true }
        );
      }
    });
  });
});
