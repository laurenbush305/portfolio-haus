/* The Haus Signal: the Portfolio Haus guided project router.
   Rule-based, fully static: no backend, no API, no keys, no cost. Works on
   GitHub Pages as uploaded. See docs/INTAKE-SETUP.md.
   Removal: delete this file, assets/css/haus-signal.css, _includes/haus-signal.html,
   the signal hooks in _layouts/default.html, and signal: true in page front matter. */

(function () {
  "use strict";

  // Motion gate: reveals and draw-ins activate only with IO support and no reduced-motion preference
  (function () {
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !("IntersectionObserver" in window)) return;
    document.documentElement.classList.add("ph-motion");
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("revealed"); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    document.querySelectorAll(".rv").forEach(function (el) { io.observe(el); });
  })();

  var root = document.getElementById("haus-signal-root");
  if (!root) return;

  var CONTACT_URL = document.body.dataset.contactUrl;

  var GREETING = "Hi, I\u2019m the Haus Signal. Tell me what you\u2019re trying to clarify, explain, fund, launch, or strengthen, and I\u2019ll route you to the right Portfolio Haus next step.";
  var UNSURE = "Tell Portfolio Haus what you are working on, who needs to understand it, and what needs to become clearer.";
  var PRICING = "Pricing depends on scope, timeline, and the level of strategic support the work needs. Share your starting point and deadline in an inquiry.";

  var LANES = {
    institutions: { label: "Institutional communications", questions: [
      { q: "What needs to become clearer?", opts: ["Research or evidence", "Stakeholder direction", "Messaging or a website brief", "A transition or handoff"] }
    ], path: "institutions", diagnosis: "Missing Headline" },
    founders: { label: "Founder messaging", questions: [
      { q: "What has the business outgrown?", opts: ["The core explanation", "The website language", "How other people introduce it"] }
    ], path: "founders", diagnosis: "Missing Headline" },
    funding: { label: "A proposal, funding, or opportunity deadline", questions: [
      { q: "Where does the work stand?", opts: ["A draft needs strengthening", "There are partial pieces", "We are starting from the beginning"] }
    ], path: "opportunity", diagnosis: "Deadline Mode" },
    proof: { label: "Proof that needs to travel", questions: [
      { q: "Who is the proof for?", opts: ["An expert-led business / founder", "An institution or organization", "Not sure yet"] }
    ], path: "unsure", diagnosis: "Receipt Gap" },
    unsure: { label: "Not sure where to begin", questions: [], path: "unsure", diagnosis: "" }
  };
  var LANE_ORDER = ["institutions", "founders", "funding", "proof", "unsure"];

  var state = { lane: null, step: 0, open: false, history: [], audience: null };

  /* ---------- DOM ---------- */

  var launcher = el("button", "hs-launcher");
  launcher.type = "button";
  launcher.setAttribute("aria-expanded", "false");
  launcher.setAttribute("aria-controls", "hs-panel");
  launcher.innerHTML = '<span class="hs-lines" aria-hidden="true"><span></span><span></span></span><span>Check the Signal</span>';

  var panel = el("div", "hs-panel");
  panel.id = "hs-panel";
  panel.hidden = true;
  panel.setAttribute("role", "dialog");
  panel.setAttribute("aria-label", "The Haus Signal intake assistant");
  panel.innerHTML =
    '<div class="hs-head">' +
      '<div><p class="hs-title">The Haus Signal</p>' +
      '<p class="hs-sub">Find a starting point. Your messages stay here.</p></div>' +
      '<button class="hs-close" type="button" aria-label="Close the Haus Signal">&times;</button>' +
    '</div>' +
    '<div class="hs-body" role="log" aria-label="Routing conversation" aria-live="polite" aria-relevant="additions"></div>' +
    '<div class="hs-foot">' +
      '<label class="sr-only" for="hs-input" style="position:absolute;left:-9999px;">Type your message</label>' +
      '<input class="hs-input" id="hs-input" type="text" maxlength="500" placeholder="Or type it in your own words" autocomplete="off">' +
      '<button class="hs-send" type="button">Send</button>' +
    '</div>';

  root.appendChild(panel);
  root.appendChild(launcher);

  var body = panel.querySelector(".hs-body");
  var input = panel.querySelector(".hs-input");

  /* ---------- Helpers ---------- */

  function el(tag, cls) { var n = document.createElement(tag); if (cls) n.className = cls; return n; }

  function say(text) {
    var m = el("div", "hs-msg hs-bot");
    text.split("\n").forEach(function (p) {
      if (!p) return;
      var pn = el("p"); pn.textContent = p; m.appendChild(pn);
    });
    body.appendChild(m);
    state.history.push({ role: "assistant", content: text });
    scroll();
  }

  function userSay(text) {
    var m = el("div", "hs-msg hs-user");
    m.textContent = text;
    body.appendChild(m);
    state.history.push({ role: "user", content: text });
    scroll();
  }

  function options(list, handler) {
    clearOptions();
    var wrap = el("div", "hs-opts");
    list.forEach(function (label) {
      var b = el("button", "hs-opt");
      b.type = "button";
      b.textContent = label;
      b.addEventListener("click", function () { handler(label); });
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    scroll();
  }

  function clearOptions() {
    body.querySelectorAll(".hs-opts").forEach(function (n) { n.remove(); });
  }

  function recommend(rec, extra) {
    clearOptions();
    var card = el("div", "hs-rec");
    var cta = rec.url || CONTACT_URL;
    card.innerHTML =
      '<span class="hs-rec-label">Best Next Step</span>' +
      '<p class="hs-rec-service"></p><p class="hs-rec-text"></p>' +
      '<a class="hs-cta" href="' + cta + '">Send a Project Inquiry</a>' +
      '<button class="hs-again" type="button">Start over</button>';
    card.querySelector(".hs-rec-service").textContent = rec.service;
    card.querySelector(".hs-rec-text").textContent = rec.text + (extra ? " " + extra : "");
    card.querySelector(".hs-again").addEventListener("click", restart);
    card.querySelector(".hs-cta").addEventListener("click", function () {
      if (cta.charAt(0) === "#") close();
    });
    body.appendChild(card);
    scroll();
  }

  function scroll() { body.scrollTop = body.scrollHeight; }

  /* ---------- Guided flow ---------- */

  function begin() {
    say(GREETING);
    laneMenu();
  }

  function laneMenu() {
    var labels = LANE_ORDER.map(function (k) { return LANES[k].label; });

    options(labels, function (label) {
      userSay(label);
      var key = LANE_ORDER.filter(function (k) { return LANES[k].label === label; })[0];
      if (key) { startLane(key); }
      else { say("Tell me a little about it in your own words, and I\u2019ll point you in the right direction."); input.focus(); }
    });
  }

  function startLane(key) {
    state.lane = key; state.step = 0; state.audience = null;
    nextStep();
  }

  function nextStep() {
    var lane = LANES[state.lane];
    if (state.step < lane.questions.length) {
      var item = lane.questions[state.step];
      say(item.q);
      options(item.opts, function (choice) {
        userSay(choice);
        if (choice === "An expert-led business / founder") state.audience = "founders";
        if (choice === "An institution or organization") state.audience = "institutions";
        state.step += 1;
        nextStep();
      });
    } else {
      var rec = window.PortfolioHausRoute(state.audience || lane.path, lane.diagnosis);
      recommend({ service: rec.offer, text: rec.offerdesc, url: rec.url });
    }
  }

  function restart() {
    state.lane = null; state.step = 0; state.audience = null;
    body.innerHTML = "";
    state.history = [];
    begin();
  }

  /* ---------- Free text routing (guided mode) ---------- */

  function route(text) {
    var t = " " + text.toLowerCase() + " ";
    function has(words) {
      return words.some(function (w) { return t.indexOf(w) !== -1; });
    }
    if (has(["price", "cost", "how much", "rate", "fee", "budget", "retainer", "package"])) {
      say(PRICING); recommendContactOnly(); return;
    }
    if (has(["guarantee", "guaranteed", "promise you", "will we get", "success rate"])) {
      say("Funding decisions and approvals depend on the reviewing organization. Portfolio Haus helps you make a clear, well-supported case.\n" + UNSURE);
      recommendContactOnly(); return;
    }
    if (has(["grant", "proposal", "rfp", "funder", "funding", "deadline"])) { startLane("funding"); return; }
    if (has(["proof", "receipt", "credibility", "case stud", "testimonial"])) { startLane("proof"); return; }
    if (has(["founder", "my business", "entrepreneur"])) { startLane("founders"); return; }
    if (has(["institution", "organization", "association", "nonprofit", "public health", "research", "stakeholder", " ai ", "artificial intelligence"])) { startLane("institutions"); return; }
    if (has(["website", "messag", "clarity", "explain", "positioning", "narrative", "handoff"])) { say("Is this institutional work or an expert-led business? Choose the closest starting point."); laneMenu(); return; }
    if (has(["hi ", "hello", "hey "])) { say(GREETING); laneMenu(); return; }
    say(UNSURE);
    recommendContactOnly();
  }

  function recommendContactOnly() {
    recommend({ service: "Send a Project Inquiry", text: "Share the work, the audience, and the decision ahead. Portfolio Haus will recommend where to begin." });
  }

  /* ---------- Events ---------- */

  function submit() {
    var text = input.value.trim();
    if (!text) return;
    input.value = "";
    userSay(text);
    route(text);
  }

  panel.querySelector(".hs-send").addEventListener("click", submit);
  input.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });

  function open() {
    panel.hidden = false;
    state.open = true;
    launcher.setAttribute("aria-expanded", "true");
    if (!body.childNodes.length) begin();
    panel.querySelector(".hs-close").focus();
  }

  function close() {
    panel.hidden = true;
    state.open = false;
    launcher.setAttribute("aria-expanded", "false");
    launcher.focus();
  }

  launcher.addEventListener("click", function () { state.open ? close() : open(); });
  panel.querySelector(".hs-close").addEventListener("click", close);
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && state.open) close();
  });
})();
