/* The Haus Signal: the Portfolio Haus guided intake assistant.
   Rule-based, fully static: no backend, no API, no keys, no cost. Works on
   GitHub Pages as uploaded. See HAUS-SIGNAL-SETUP.md.
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

  var CONTACT_URL = document.body.getAttribute("data-contact-url") ||
    (document.getElementById("contact") ? "#contact" :
      (window.location.pathname.indexOf("/contact") === 0 ? "#top" : "/contact/"));

  var GREETING = "Hi, I\u2019m the Haus Signal. Tell me what you\u2019re trying to clarify, explain, fund, launch, or strengthen, and I\u2019ll route you to the right Portfolio Haus next step.";
  var UNSURE = "I don\u2019t want to overstate that. The best next step is to send a project inquiry so Portfolio Haus can review the details.";
  var PRICING = "Pricing depends on scope, timeline, and the level of strategic support the work needs. The best next step is to send a project inquiry so Portfolio Haus can review the project and recommend the right path.";

  var LANES = {
    unclear: {
      label: "Our message is unclear",
      questions: [
        { q: "Who do you most need to reach right now?",
          opts: ["Funders", "Partners or clients", "Board or internal", "The public"] },
        { q: "Where does the messaging need to show up first?",
          opts: ["The website", "A deck or proposal", "Conversations and pitches", "Everywhere, honestly"] }
      ],
      rec: {
        service: "Message Audit",
        text: "Start with a Message Audit: a focused review that names what is unclear, underbuilt, or missing. If the work runs deeper, it becomes a Doctrine Build\u2122 Sprint: Diagnose, Design, Deliver."
      }
    },
    funding: {
      label: "Proposal, grant, or funding help",
      questions: [
        { q: "Is there a live deadline?",
          opts: ["Yes, within a month", "Yes, further out", "Not yet"] },
        { q: "Where does the proposal stand?",
          opts: ["Draft exists, needs strengthening", "Partial pieces", "Starting from zero"] }
      ],
      rec: {
        service: "Proposal / Funding Narrative Support",
        text: "This is scoped for exactly that: strategic narrative support for proposals, grants, and funder conversations. Include the funder and the deadline in your inquiry and Portfolio Haus can respond with timing in mind."
      }
    },
    website: {
      label: "Our website does not explain the work",
      questions: [
        { q: "What should the website help visitors do?",
          opts: ["Understand what we do", "Trust us enough to reach out", "Fund or partner with us"] }
      ],
      rec: {
        service: "Website Narrative and Positioning",
        text: "The fix is usually narrative, not design: what the site claims, in what order, with what proof. That is what Website Narrative and Positioning rebuilds."
      }
    },
    exec: {
      label: "Clearer public language as a founder or executive",
      questions: [
        { q: "What is the upcoming moment?",
          opts: ["A launch or announcement", "Fundraising or investors", "Media or public speaking", "General presence"] }
      ],
      rec: {
        service: "Executive Communications Strategy",
        text: "Executive Communications Strategy builds the language for the moment that is coming: the claim, the proof, and the version of the story you can say in any room."
      }
    },
    ai: {
      label: "AI messaging or AI literacy",
      questions: [],
      rec: {
        service: "Message Audit",
        text: "Portfolio Haus helps mission-driven organizations communicate clearly and responsibly about AI, especially where public trust, institutional accountability, workforce communication, public health, equity, or audience education are involved. A Message Audit or a communications strategy conversation is the right starting point."
      }
    }
  };

  var LANE_ORDER = ["unclear", "funding", "website", "exec", "ai"];

  var state = { lane: null, step: 0, open: false, history: [] };

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
      '<p class="hs-sub">Routing your project to the right next step</p></div>' +
      '<button class="hs-close" type="button" aria-label="Close the Haus Signal">&times;</button>' +
    '</div>' +
    '<div class="hs-body"></div>' +
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
    var cta = CONTACT_URL;
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
    labels.push("Something else");
    options(labels, function (label) {
      userSay(label);
      var key = LANE_ORDER.filter(function (k) { return LANES[k].label === label; })[0];
      if (key) { startLane(key); }
      else { say("Tell me a little about it in your own words, and I\u2019ll point you in the right direction."); input.focus(); }
    });
  }

  function startLane(key) {
    state.lane = key; state.step = 0;
    nextStep();
  }

  function nextStep() {
    var lane = LANES[state.lane];
    if (state.step < lane.questions.length) {
      var item = lane.questions[state.step];
      say(item.q);
      options(item.opts, function (choice) {
        userSay(choice);
        state.step += 1;
        nextStep();
      });
    } else {
      recommend(lane.rec);
    }
  }

  function restart() {
    state.lane = null; state.step = 0;
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
      say("Portfolio Haus does not guarantee outcomes like funding decisions, coverage, or approvals. What it builds is the clearest, best-evidenced version of your story.\n" + UNSURE);
      recommendContactOnly(); return;
    }
    if (has(["grant", "proposal", "rfp", "funder", "funding", "deadline"])) { startLane("funding"); return; }
    if (has(["website", "web site", "homepage", "landing page", "site "])) { startLane("website"); return; }
    if (has([" ai ", "artificial intelligence", "ai literacy", "ai messaging"])) { startLane("ai"); return; }
    if (has(["founder", "executive", "keynote", "investor", "board meeting", "speaking", "thought"])) { startLane("exec"); return; }
    if (has(["unclear", "messag", "clarity", "explain", "positioning", "story", "narrative", "pitch", "deck", "confus"])) { startLane("unclear"); return; }
    if (has(["hi ", "hello", "hey "])) { say(GREETING); laneMenu(); return; }
    say(UNSURE);
    recommendContactOnly();
  }

  function recommendContactOnly() {
    recommend({ service: "Send a Project Inquiry", text: "Share what you are working on and where the message needs to hold. Portfolio Haus reviews every inquiry and recommends the right path, or says so honestly if it is not the right fit." });
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
