function onlyDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

const BUSINESS_WHATSAPP_E164 = "919351120019"; // WhatsApp-enabled number (no + sign)

function withBusyButton(button, busyText, fn) {
  if (!button) return fn();
  const prevDisabled = button.disabled;
  const prevText = button.textContent;
  button.disabled = true;
  button.textContent = busyText;
  try {
    return fn();
  } finally {
    window.setTimeout(() => {
      button.disabled = prevDisabled;
      button.textContent = prevText;
    }, 900);
  }
}

function buildLeadText({ name, mobile, service, email, message }) {
  const lines = [];
  lines.push("Hello Gupta Accounting Solution,");
  if (service) lines.push(`Service: ${service}`);
  if (name) lines.push(`Name: ${name}`);
  if (mobile) lines.push(`Mobile: ${mobile}`);
  if (email) lines.push(`Email: ${email}`);
  if (message) lines.push(`Message: ${message}`);
  return lines.join("\n");
}

function openWhatsApp({ phoneE164, text }) {
  const url = `https://wa.me/${phoneE164}?text=${encodeURIComponent(text)}`;
  window.open(url, "_blank", "noopener,noreferrer");
}

function setUpMobileNav() {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector("[data-nav-links]");
  if (!toggle || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(isOpen));
  });

  links.querySelectorAll("a[href^='#']").forEach((a) => {
    a.addEventListener("click", close);
  });

  document.addEventListener("click", (e) => {
    if (!links.classList.contains("is-open")) return;
    if (toggle.contains(e.target) || links.contains(e.target)) return;
    close();
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
}

function setUpForms() {
  const leadForm = document.getElementById("leadForm");
  if (leadForm) {
    leadForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = leadForm.querySelector("button[type='submit']");
      const fd = new FormData(leadForm);
      const name = String(fd.get("name") || "").trim();
      const mobile = onlyDigits(fd.get("mobile"));
      const service = String(fd.get("service") || "").trim();

      if (mobile.length < 10) {
        alert("Please enter a valid mobile number.");
        return;
      }
      if (!service) {
        alert("Please select a service.");
        return;
      }

      withBusyButton(submitBtn, "Opening WhatsApp…", () => {
        const text = buildLeadText({ name, mobile, service });
        openWhatsApp({ phoneE164: BUSINESS_WHATSAPP_E164, text });
        leadForm.reset();
      });
    });
  }

  const contactForm = document.getElementById("contactForm");
  const whatsAppBtn = document.getElementById("whatsAppBtn");

  const getContactData = () => {
    if (!contactForm) return null;
    const fd = new FormData(contactForm);
    const name = String(fd.get("name") || "").trim();
    const mobile = onlyDigits(fd.get("mobile"));
    const email = String(fd.get("email") || "").trim();
    const message = String(fd.get("message") || "").trim();
    return { name, mobile, email, message };
  };

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const submitBtn = contactForm.querySelector("button[type='submit']");
      const data = getContactData();
      if (!data) return;

      if (data.mobile.length < 10) {
        alert("Please enter a valid mobile number.");
        return;
      }
      if (!data.message) {
        alert("Please enter your message.");
        return;
      }

      withBusyButton(submitBtn, "Opening WhatsApp…", () => {
        const text = buildLeadText({ ...data, service: "General enquiry" });
        openWhatsApp({ phoneE164: BUSINESS_WHATSAPP_E164, text });
        contactForm.reset();
      });
    });
  }

  if (whatsAppBtn) {
    whatsAppBtn.addEventListener("click", () => {
      const data = getContactData() || {};
      withBusyButton(whatsAppBtn, "Opening WhatsApp…", () => {
        const text = buildLeadText({ ...data, service: "General enquiry" });
        openWhatsApp({ phoneE164: BUSINESS_WHATSAPP_E164, text });
        if (contactForm) contactForm.reset();
      });
    });
  }
}

function setUpRevealAnimations() {
  const reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const targets = document.querySelectorAll(".hero__content, .hero__card, .section, .card, .mini, footer");
  targets.forEach((el, idx) => {
    el.classList.add("reveal");
    el.style.transitionDelay = `${Math.min(idx * 35, 240)}ms`;
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    targets.forEach((el) => el.classList.add("is-visible"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -10% 0px" }
  );

  targets.forEach((el) => io.observe(el));
}

function setUpFloatingActions() {
  const wa = document.getElementById("fabWhatsApp");
  if (!wa) return;

  wa.addEventListener("click", () => {
    const text = buildLeadText({ service: "Quick enquiry" });
    openWhatsApp({ phoneE164: BUSINESS_WHATSAPP_E164, text });
  });
}

document.addEventListener("DOMContentLoaded", () => {
  setUpMobileNav();
  setUpForms();
  setUpRevealAnimations();
  setUpFloatingActions();
});
