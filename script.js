(() => {
  const ENDPOINT = window.BREAKWATER_FORM_ENDPOINT || "";
  const forms = document.querySelectorAll("[data-lead-form]");

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

  forms.forEach((form) => {
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
