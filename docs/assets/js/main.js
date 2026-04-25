// Hero video autoplay fallback for iOS Chrome/Safari
function initHeroVideo() {
  const video = document.querySelector(".hero__media video");
  if (!video) return;

  // iOS WKWebView vyžaduje muted ako DOM atribút, nestačí len JS property
  video.muted = true;
  video.setAttribute("muted", "");
  video.setAttribute("playsinline", "");
  video.setAttribute("webkit-playsinline", "");

  const tryPlay = () => {
    if (!video.paused) return;
    const p = video.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {}); // tiché potlačenie chyby, retry rieši interaction listener nižšie
    }
  };

  // Skús okamžite (funguje na desktope + niektorých iOS)
  tryPlay();

  // Záloha: skús po plnom načítaní stránky
  window.addEventListener("load", tryPlay, { once: true });

  // Stránka sa stala viditeľnou (otvorenie tabu, návrat z inej appky)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") tryPlay();
  });

  // pageshow pokrýva back/forward cache aj otvorenie cez link
  window.addEventListener("pageshow", () => {
    tryPlay();
  });

  // iOS Chrome/Safari blokuje autoplay bez interakcie — spusti na prvý dotyk/klik
  const events = ["touchstart", "pointerdown", "click"];
  const resumeOnInteraction = () => {
    tryPlay();
    events.forEach((e) =>
      document.removeEventListener(e, resumeOnInteraction)
    );
  };
  events.forEach((e) =>
    document.addEventListener(e, resumeOnInteraction, { passive: true, once: true })
  );
}

document.addEventListener("DOMContentLoaded", () => {
  initHeroVideo();

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
