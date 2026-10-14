(function () {
  const D = window.OPERA;
  const UI = {
    en: {
      overture: "Overture", "nav.about": "About", "nav.concerts": "Concerts", "nav.contact": "Booking",
      act1: "Act I", "about.title": "About", act2: "Act II", "concerts.title": "Concerts",
      "concerts.sub": "Every stage, in order — from the very first performance.",
      finale: "Finale", "contact.title": "Booking & Contact",
      "contact.sub": "For concerts, events and collaborations.",
      watch: "Watch ↗", concert: "Concert", date: "Date", occasion: "Occasion", venue: "Stage", tbc: "—", soon: "Details coming soon", noVideo: "Video coming soon",
    },
    ar: {
      overture: "الافتتاحية", "nav.about": "عنّي", "nav.concerts": "الحفلات", "nav.contact": "الحجز",
      act1: "الفصل الأول", "about.title": "عنّي", act2: "الفصل التاني", "concerts.title": "الحفلات",
      "concerts.sub": "كل مسرح وقفت عليه، بالترتيب — من أول حفلة لحد آخر واحدة.",
      finale: "الختام", "contact.title": "الحجز والتواصل",
      "contact.sub": "للحفلات والمناسبات والتعاون.",
      watch: "شوف الفيديو ↗", concert: "حفلة", date: "التاريخ", occasion: "المناسبة", venue: "المسرح", tbc: "—", soon: "التفاصيل قريبًا", noVideo: "الفيديو قريبًا",
    },
  };
  const $ = (s) => document.querySelector(s);
  const el = (t, c, x) => { const n = document.createElement(t); if (c) n.className = c; if (x != null) n.textContent = x; return n; };
  let lang = "en";
  const t = (o) => (o && typeof o === "object" ? o[lang] || o.en || "" : o || "");

  // things whose text changes with the language — filled once, updated on toggle
  const texts = [];
  const tx = (node, fn) => { texts.push([node, fn]); return node; };

  function build() {
    $("#portrait").src = D.photo;

    $("#stats").replaceChildren(...D.stats.map((s) => {
      const d = el("div");
      d.append(tx(el("dt"), () => t(s.label)), tx(el("dd"), () => t(s.value)));
      return d;
    }));

    const list = [...D.concerts].sort((a, b) => (a.no || 0) - (b.no || 0));
    const row = (k, v) => {
      const p = el("p", "row");
      p.append(tx(el("span", "k"), () => UI[lang][k]), tx(el("span", "v"), () => t(v) || UI[lang].tbc));
      return p;
    };
    $("#timeline").replaceChildren(...list.map((c) => {
      const empty = !t(c.place) && !t(c.occasion) && !t(c.venue);
      const li = el("li", "concert" + (empty ? " empty" : ""));
      const when = el("div", "when");
      when.append(el("span", "yr", String(c.no).padStart(2, "0")), tx(el("span", "md"), () => UI[lang].concert));
      const card = el("div", "card");
      card.append(tx(el("h3"), () => t(c.place) || t(c.occasion) || UI[lang].soon));
      card.append(row("occasion", c.occasion));
      // hide the stage line when it isn't known (filled concerts only)
      if (t(c.venue) || empty) card.append(row("venue", c.venue));
      card.append(row("date", c.date));
      if (t(c.program)) card.append(tx(el("p", "prog"), () => t(c.program)));
      if (c.video) { const a = tx(el("a", "watch"), () => UI[lang].watch); a.href = c.video; a.target = "_blank"; a.rel = "noopener"; card.append(a); }

      // video frame (like the work portfolio)
      const frame = el(c.video && !c.file ? "a" : "div", "vframe" + (c.portrait ? " tall" : ""));
      if (c.video && !c.file) { frame.href = c.video; frame.target = "_blank"; frame.rel = "noopener"; }
      if (c.file) {
        // nothing downloads until she presses play — only the cover image shows
        const v = document.createElement("video");
        v.controls = true; v.preload = "none"; v.playsInline = true;
        if (c.image) v.poster = c.image;
        v.src = c.file;
        frame.append(v);
      } else if (c.image) {
        const img = el("img"); img.src = c.image; img.loading = "lazy"; img.decoding = "async"; frame.append(img);
        tx(img, () => { img.alt = t(c.occasion); });
        if (c.video) frame.append(el("span", "play", "▶"));
      } else {
        frame.classList.add("ph");
        frame.append(el("span", "play", "▶"), tx(el("small"), () => (c.video ? UI[lang].watch : UI[lang].noVideo)));
      }
      card.append(frame);
      li.append(when, card);
      return li;
    }));

    // only one video plays at a time
    document.addEventListener("play", (e) => {
      document.querySelectorAll("video").forEach((v) => { if (v !== e.target) v.pause(); });
    }, true);

    const c = D.contact;
    const links = [
      [c.email, c.email && "mailto:" + c.email],
      [c.whatsapp && "WhatsApp", c.whatsapp && "https://wa.me/" + String(c.whatsapp).replace(/\D/g, "")],
      [c.instagram && "Instagram", c.instagram],
      [c.youtube && "YouTube", c.youtube],
    ].filter(([n, h]) => n && h);
    $("#contactLinks").replaceChildren(...links.map(([n, h]) => {
      const a = el("a", null, n); a.href = h; if (!h.startsWith("mailto:")) { a.target = "_blank"; a.rel = "noopener"; } return a;
    }));
    $("#year").textContent = new Date().getFullYear();
  }

  function applyLang() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    $("#langToggle").textContent = lang === "ar" ? "EN" : "ع";
    $("#portrait").alt = t(D.name);
    document.querySelectorAll("[data-i18n]").forEach((n) => (n.textContent = UI[lang][n.dataset.i18n]));
    document.querySelectorAll("[data-bind]").forEach((n) => (n.textContent = t(D[n.dataset.bind])));
    texts.forEach(([n, fn]) => { const v = fn(); if (v !== undefined) n.textContent = v; });
  }

  // keep the reader on the same spot when the language flips
  function anchor() {
    const mid = window.innerHeight * 0.35;
    const pick = [...document.querySelectorAll(".hero, main > section, .concert")].reverse() // innermost first
      .find((n) => { const r = n.getBoundingClientRect(); return r.top <= mid && r.bottom > mid; });
    if (!pick) return () => {};
    const before = pick.getBoundingClientRect().top;
    const html = document.documentElement;
    const fix = () => {
      const d = pick.getBoundingClientRect().top - before;
      if (Math.abs(d) < 1) return;
      const prev = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollBy(0, d);
      html.style.scrollBehavior = prev;
    };
    // fix once now, and once more when the other language's font is ready
    let stop = false;
    const quit = () => { stop = true; };
    ["wheel", "touchstart", "keydown", "mousedown"].forEach((ev) => addEventListener(ev, quit, { once: true, passive: true }));
    return () => {
      fix(); requestAnimationFrame(() => { if (!stop) fix(); });
      if (document.fonts) document.fonts.ready.then(() => { if (!stop) fix(); });
    };
  }

  // warm the Arabic font early so switching is instant
  const warm = () => { if (document.fonts) ["400 1em Amiri", "700 1em Amiri"].forEach((f) => document.fonts.load(f, "عربي").catch(() => {})); };
  (window.requestIdleCallback || ((f) => setTimeout(f, 1200)))(warm);

  build();
  applyLang();
  $("#langToggle").onclick = () => {
    const restore = anchor();
    lang = lang === "ar" ? "en" : "ar";
    applyLang();
    restore();
  };
})();
