(function () {
  const giftsRoot = document.getElementById("gift-list");
  if (!giftsRoot) return;

  const dataSource = giftsRoot.getAttribute("data-gifts-source");
  if (!dataSource) {
    giftsRoot.innerHTML =
      '<p class="gift-error">Chýba údaj o zdroji darčekov. Skontrolujte atribút <code>data-gifts-source</code>.</p>';
    return;
  }

  const createBadge = (status) => {
    const badge = document.createElement("span");
    badge.className = `gift-badge gift-badge--${status}`;
    badge.textContent =
      status === "volne"
        ? "Voľné"
        : status === "rezervovane"
        ? "Rezervované"
        : status === "darovane"
        ? "Darované"
        : status;
    return badge;
  };

  const renderGifts = (gifts) => {
    if (!Array.isArray(gifts) || gifts.length === 0) {
      giftsRoot.innerHTML = `
        <div class="gift-empty">
          <p>Darčekový zoznam je zatiaľ prázdny. Pridajte položky do súboru <code>data/darceky.json</code>.</p>
        </div>
      `;
      return;
    }

    const table = document.createElement("div");
    table.className = "gift-table__inner";

    const header = document.createElement("header");
    header.className = "gift-table__header";
    header.innerHTML = `
      <h3>Vyberte si darček</h3>
      <div class="gift-filters">
        <button type="button" data-filter="all" class="is-active" aria-pressed="true">Všetky</button>
        <button type="button" data-filter="volne" aria-pressed="false">Voľné</button>
        <button type="button" data-filter="rezervovane" aria-pressed="false">Rezervované</button>
        <button type="button" data-filter="darovane" aria-pressed="false">Darované</button>
      </div>
    `;

    const list = document.createElement("ul");
    list.className = "gift-list";

    const renderFilter = (filter) => {
      list.innerHTML = "";
      const filtered = gifts.filter((gift) => filter === "all" || gift.stav === filter);

      if (filtered.length === 0) {
        const emptyItem = document.createElement("li");
        emptyItem.className = "gift-list__empty";
        emptyItem.textContent = "Žiadne položky pre tento filter.";
        list.append(emptyItem);
        return;
      }

      filtered.forEach((gift) => {
        const item = document.createElement("li");
        item.className = "gift-list__item";
        item.dataset.status = gift.stav;

        const title = document.createElement("h4");
        title.textContent = gift.nazov;

        const description = document.createElement("p");
        description.className = "gift-list__description";
        description.textContent = gift.popis || "";

        const actions = document.createElement("div");
        actions.className = "gift-list__actions";

        const link = document.createElement("a");
        link.href = gift.odkaz || "#";
        link.textContent = "Zobraziť";
        link.className = "text-link";
        link.target = "_blank";
        link.rel = "noopener";

        const button = document.createElement("button");
        button.type = "button";
        button.className = "button button--outline button--reserve";
        button.textContent =
          gift.stav === "volne" ? "Chcem darovať" : gift.stav === "rezervovane" ? "Rezervované" : "Darované";
        button.disabled = gift.stav !== "volne";

        button.addEventListener("click", () => {
          const event = new CustomEvent("gift:selected", {
            bubbles: true,
            detail: { id: gift.id, name: gift.nazov },
          });
          document.dispatchEvent(event);
          window.location.hash = "rsvp";
        });

        actions.append(link, button);

        const metadata = document.createElement("div");
        metadata.className = "gift-list__meta";
        metadata.append(createBadge(gift.stav));

        item.append(title, description, actions, metadata);
        list.append(item);
      });
    };

    table.append(header, list);
    giftsRoot.innerHTML = "";
    giftsRoot.append(table);

    const filterButtons = header.querySelectorAll("[data-filter]");
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        filterButtons.forEach((btn) => btn.classList.remove("is-active"));
        filterButtons.forEach((btn) => btn.setAttribute("aria-pressed", "false"));
        button.classList.add("is-active");
        button.setAttribute("aria-pressed", "true");
        renderFilter(button.getAttribute("data-filter"));
      });
    });

    renderFilter("all");
  };

  fetch(dataSource, { cache: "no-store" })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`Nepodarilo sa načítať darčeky (status ${response.status}).`);
      }
      return response.json();
    })
    .then((data) => {
      const randomId = () =>
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
          ? crypto.randomUUID()
          : `gift-${Math.random().toString(16).slice(2)}`;

      const normalized = Array.isArray(data)
        ? data.map((gift) => ({
            id: gift.id || randomId(),
            nazov: gift.nazov || "Bez názvu",
            popis: gift.popis || "",
            odkaz: gift.odkaz || "",
            stav: gift.stav || "volne",
          }))
        : [];
      renderGifts(normalized);
    })
    .catch((error) => {
      console.error("Chyba pri načítaní darčekov", error);
      giftsRoot.innerHTML = `
        <div class="gift-error">
          <p>Nepodarilo sa načítať darčekový zoznam. Skúste obnoviť stránku alebo kontaktujte organizátorov.</p>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    });
})();
