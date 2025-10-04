(function () {
  const form = document.getElementById("rsvp-form");
  if (!form) return;

  const statusNode = form.querySelector(".form__status");
  const submitButton = form.querySelector('button[type="submit"]');
  const successMessage = form.dataset.successMessage || "Ďakujeme za vašu odpoveď!";
  const errorMessage = form.dataset.errorMessage || "Odoslanie zlyhalo.";
  const actionUrl = form.getAttribute("action") || "";
  const isPlaceholderEndpoint = actionUrl.includes("your-form-id");

  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

  const resetStatus = () => {
    if (!statusNode) return;
    statusNode.textContent = "";
    statusNode.classList.remove("is-visible", "is-success", "is-error", "is-pending");
  };

  const setStatus = (type, message) => {
    if (!statusNode) return;
    resetStatus();
    statusNode.textContent = message;
    statusNode.classList.add("is-visible");
    if (type === "success") statusNode.classList.add("is-success");
    if (type === "error") statusNode.classList.add("is-error");
    if (type === "pending") statusNode.classList.add("is-pending");
  };

  const clearFieldErrors = () => {
    form.querySelectorAll(".form__group").forEach((group) => {
      group.dataset.invalid = "false";
      const errorNode = group.querySelector(".form__error");
      if (errorNode) {
        errorNode.remove();
      }
    });
  };

  const showFieldError = (input, message) => {
    const group = input?.closest(".form__group");
    if (!group) return;
    group.dataset.invalid = "true";

    if (!group.querySelector(".form__error")) {
      const error = document.createElement("p");
      error.className = "form__error";
      error.textContent = message;
      group.append(error);
    }
  };

  const validate = () => {
    const errors = [];
    const formData = new FormData(form);

    const name = (formData.get("Meno") || "").toString().trim();
    const email = (formData.get("Email") || "").toString().trim();
    const guestNamesRaw = (formData.get("Mená hostí") || "").toString().trim();
    const notes = (formData.get("Poznámky") || "").toString().trim();
    const songs = (formData.get("Piesne") || "").toString().trim();

    if (!name) {
      errors.push({ field: "guest-name", message: "Zadajte prosím svoje meno." });
    }

    if (!email || !emailRegex.test(email)) {
      errors.push({ field: "guest-email", message: "Zadajte platnú e-mailovú adresu." });
    }

    const guestEntries = guestNamesRaw
      .split(/[\n,;]/)
      .map((entry) => entry.replace(/\s+/g, " ").trim())
      .filter(Boolean);

    if (!guestNamesRaw) {
      errors.push({ field: "guest-names", message: "Napíšte, prosím, mená všetkých hostí." });
    }

    if (guestEntries.length > 10) {
      errors.push({ field: "guest-names", message: "Naraz môžete prihlásiť najviac 10 hostí." });
    }

    if (guestNamesRaw.length > 300) {
      errors.push({ field: "guest-names", message: "Mená prosím skráťte na 300 znakov." });
    }

    if (guestEntries.length > 0) {
      formData.set("Počet hostí", String(guestEntries.length));
    } else {
      formData.delete("Počet hostí");
    }

    if (notes.length > 500) {
      errors.push({ field: "guest-notes", message: "Poznámka môže mať maximálne 500 znakov." });
    }

    if (songs.length > 300) {
      errors.push({ field: "guest-songs", message: "Zoznam piesní môže mať maximálne 300 znakov." });
    }

    return { errors, formData };
  };

  const setPending = (isPending) => {
    if (!submitButton) return;
    submitButton.disabled = isPending;
    submitButton.classList.toggle("is-loading", isPending);
    submitButton.innerText = isPending ? "Odosielame..." : "Odoslať RSVP";
  };

  const simulateDelay = () => new Promise((resolve) => window.setTimeout(resolve, 600));

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearFieldErrors();
    resetStatus();

    const { errors, formData } = validate();

    if (errors.length > 0) {
      errors.forEach(({ field, message }) => {
        const input = form.querySelector(`#${field}`);
        if (input instanceof HTMLElement) {
          showFieldError(input, message);
        }
      });
      setStatus("error", "Skontrolujte zvýraznené polia a skúste znova.");
      return;
    }

    if (isPlaceholderEndpoint) {
      setStatus(
        "error",
        "Formulár ešte nie je prepojený so službou Formspree. Aktualizujte prosím adresu v atribúte action."
      );
      return;
    }

    try {
      setPending(true);
      setStatus("pending", "Odosielame vašu odpoveď...");

      const response = await fetch(actionUrl, {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
        body: formData,
      });

      // Získaj odpoveď aj pri starších prehliadačoch
      let body;
      try {
        body = await response.json();
      } catch (jsonError) {
        body = null;
      }

      await simulateDelay();

      if (response.ok) {
        form.reset();
        setStatus("success", successMessage);
      } else {
        const message = body?.errors?.[0]?.message || errorMessage;
        setStatus("error", message);
      }
    } catch (error) {
      console.error("RSVP submit error", error);
      setStatus("error", errorMessage);
    } finally {
      setPending(false);
    }
  });

  document.addEventListener("gift:selected", (event) => {
    const detail = event?.detail;
    if (!detail || !detail.name) return;
    const input = document.getElementById("gift-choice");
    if (!input) return;
    input.value = detail.name;
    input.focus();
  });
})();
