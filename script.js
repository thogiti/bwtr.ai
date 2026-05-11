(() => {
  const ENDPOINT = window.BREAKWATER_FORM_ENDPOINT || "";
  const forms = document.querySelectorAll("[data-lead-form]");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeLabel = document.querySelector("[data-theme-label]");
  const requestLinks = document.querySelectorAll("[data-select-request]");

  const setTheme = (theme) => {
    const nextTheme = theme === "dark" ? "dark" : "light";
    document.documentElement.dataset.theme = nextTheme;
    if (themeLabel) {
      themeLabel.textContent = nextTheme === "dark" ? "Dark" : "Light";
    }
    try {
      localStorage.setItem("breakwater-theme", nextTheme);
    } catch (_) {
      // Ignore storage failures; the visual toggle still works for this page view.
    }
  };

  const setStatus = (form, message, tone = "neutral") => {
    const status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.textContent = message;
    status.dataset.tone = tone;
  };

  const serialize = (form) => {
    const data = new FormData(form);
    data.append("submitted_at", new Date().toISOString());
    data.append("page_url", window.location.href);
    return data;
  };

  const updateRequestMode = (form) => {
    const selected = form.querySelector("input[name='form_type']:checked")?.value || "request_demo";
    const isPilot = selected === "start_pilot";
    const submit = form.querySelector("[data-submit-label]");
    form.dataset.requestMode = selected;
    form.querySelectorAll("[data-pilot-field]").forEach((field) => {
      field.hidden = !isPilot;
      field.querySelectorAll("input, select, textarea").forEach((control) => {
        if (!isPilot) control.value = "";
      });
    });
    if (submit) {
      submit.textContent = isPilot ? "Send CCTV+ pilot request" : "Send private demo request";
    }
  };

  const selectRequestMode = (value) => {
    const form = document.querySelector("[data-lead-form]");
    const radio = form?.querySelector(`input[name='form_type'][value='${value}']`);
    if (!form || !radio) return;
    radio.checked = true;
    updateRequestMode(form);
  };

  if (themeToggle) {
    setTheme(document.documentElement.dataset.theme || "light");
    themeToggle.addEventListener("click", () => {
      const current = document.documentElement.dataset.theme === "dark" ? "dark" : "light";
      setTheme(current === "dark" ? "light" : "dark");
    });
  }

  requestLinks.forEach((link) => {
    link.addEventListener("click", () => {
      selectRequestMode(link.dataset.selectRequest);
    });
  });

  forms.forEach((form) => {
    updateRequestMode(form);
    form.querySelectorAll("input[name='form_type']").forEach((radio) => {
      radio.addEventListener("change", () => {
        updateRequestMode(form);
        setStatus(form, "");
      });
    });

    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const submit = form.querySelector("button[type='submit']");
      const honey = form.querySelector("input[name='website']");
      if (honey && honey.value) {
        setStatus(form, "Thanks. We'll follow up shortly.", "success");
        form.reset();
        return;
      }

      if (!ENDPOINT || ENDPOINT.includes("PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE")) {
        setStatus(
          form,
          "Form endpoint is not configured yet. Email hello@bwtr.ai and we'll route this manually.",
          "error",
        );
        return;
      }

      submit.disabled = true;
      setStatus(form, "Sending request...", "neutral");

      try {
        await fetch(ENDPOINT, {
          method: "POST",
          mode: "no-cors",
          body: serialize(form),
        });
        setStatus(form, "Thanks. We'll follow up shortly.", "success");
        form.reset();
        updateRequestMode(form);
      } catch (error) {
        console.error(error);
        setStatus(
          form,
          "We could not submit the form. Please email hello@bwtr.ai and we'll follow up.",
          "error",
        );
      } finally {
        submit.disabled = false;
      }
    });
  });
})();
