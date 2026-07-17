"use strict";

const { scales } = window.MindPopScoring;
const config = window.MINDPOP_CONFIG || {};
const app = document.getElementById("app");
const ORDER = ["personality", "emotionalSkills", "happiness", "stress", "motivation"];
const STORAGE_KEY = "mindpop_session_v2";
const QUEUE_KEY = "mindpop_submission_queue_v2";
const APP_VERSION = "2.0.0";
let route = { name: "landing" };
let notice = "";

function id() {
  if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (value) => value.toString(16).padStart(2, "0")).join("");
}

function freshSession() {
  return {
    schemaVersion: 2,
    participantId: id(),
    startedAt: new Date().toISOString(),
    consent: { participate: false, share: false, acceptedAt: "" },
    profile: { department: "", role: "", year: "", gender: "" },
    drafts: {},
    results: {},
    completedAt: "",
    submission: { status: "not_sent", id: "", lastAttempt: 0 }
  };
}

function readSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && parsed.schemaVersion === 2 && parsed.participantId) return parsed;
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
  return freshSession();
}

localStorage.removeItem("mindpop_session");
let session = readSession();

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

function safeUrl(value) {
  if (!value) return "";
  try {
    const url = new URL(value, window.location.origin);
    return ["http:", "https:"].includes(url.protocol) ? url.href : "";
  } catch (_) {
    return "";
  }
}

function completed() {
  return ORDER.filter((scaleId) => session.results[scaleId]);
}

function allDone() {
  return completed().length === ORDER.length;
}

function draw(html, focus = true) {
  app.innerHTML = '<div class="shell">' + html + "</div>";
  document.querySelectorAll("[data-meter]").forEach((meter) => {
    meter.style.width = Math.max(0, Math.min(100, Number(meter.dataset.meter))) + "%";
  });
  if (focus) {
    requestAnimationFrame(() => {
      app.focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function go(name, data = {}) {
  route = { name, ...data };
  notice = "";
  render();
}

function landingView() {
  return `
    <section class="hero">
      <div>
        <p class="eyebrow">A five-part wellbeing check-in</p>
        <h1>Pause. Notice. Pop back brighter.</h1>
        <p class="lede">Five quick, research-informed reflections for personality, emotional skills, happiness, stress and motivation. No judgement. Just a clearer picture of right now.</p>
        <button class="button" type="button" data-action="begin">Start my check-in <span aria-hidden="true">&rarr;</span></button>
        <div class="hero-note"><span>About 8 minutes</span><span>Private by default</span><span>Instant reflection</span></div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="orbit"><div class="orbit-core">M</div></div>
        <span class="spark spark-a">&#10022;</span><span class="spark spark-b">&#9728;</span><span class="spark spark-c">&#8599;</span>
      </div>
    </section>`;
}

function consentView() {
  return `
    <section class="panel">
      <div class="panel-head">
        <p class="eyebrow">Before we begin</p>
        <h2>Your choice, your pace.</h2>
        <p>MindPop offers a personal reflection. It does not diagnose a condition, and taking part is voluntary.</p>
      </div>
      <ul class="consent-list">
        <li><strong>1</strong><span>Answers are saved on this device so you can resume after a refresh.</span></li>
        <li><strong>2</strong><span>No name or phone number is collected. A random participant ID is used instead.</span></li>
        <li><strong>3</strong><span>Nothing is uploaded until you explicitly choose to share your completed snapshot.</span></li>
      </ul>
      <form id="consent-form">
        <label class="check-row"><input name="participate" type="checkbox" required><span>I choose to take part and understand these results are non-diagnostic.</span></label>
        <label class="check-row"><input name="share" type="checkbox"><span>I am also happy to share an anonymous completed response with ${esc(config.institutionName || "the institution")}. Optional.</span></label>
        <div class="button-row">
          <button class="button" type="submit">Continue</button>
          <button class="button secondary" type="button" data-action="home">Not now</button>
        </div>
      </form>
    </section>`;
}

const departments = [
  "Humanities & Social Sciences", "Sciences", "Paramedical Sciences",
  "Pharmaceutical Sciences", "Engineering", "Computer Technology",
  "Nursing", "Physiotherapy & Rehabilitation", "Commerce & Management",
  "Agriculture Sciences & Technology", "Non-Teaching Staff"
];

function options(items, selected, placeholder = "Select one") {
  return '<option value="">' + esc(placeholder) + "</option>" + items.map((item) =>
    '<option value="' + esc(item) + '"' + (item === selected ? " selected" : "") + ">" + esc(item) + "</option>"
  ).join("");
}

function profileView() {
  const p = session.profile;
  return `
    <section class="panel">
      <div class="panel-head">
        <p class="eyebrow">One quick setup</p>
        <h2>Help us add context.</h2>
        <p>These broad details make anonymous group patterns more useful. Gender is optional.</p>
      </div>
      <form id="profile-form">
        <div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <div class="form-grid">
          <div class="field"><label for="department">Department</label><select id="department" name="department" required>${options(departments, p.department)}</select></div>
          <div class="field"><label for="role">I am a...</label><select id="role" name="role" required>${options(["Undergraduate", "Postgraduate", "Faculty", "Staff"], p.role)}</select></div>
          <div class="field"><label for="year">Year or experience</label><select id="year" name="year">${options(["1st Year", "2nd Year", "3rd Year", "4th Year", "0-2 Years", "3-5 Years", "6-10 Years", "10+ Years", "Not applicable"], p.year, "Choose if applicable")}</select></div>
          <div class="field"><label for="gender">Gender <small>(optional)</small></label><select id="gender" name="gender">${options(["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"], p.gender, "Optional")}</select></div>
        </div>
        <button class="button" type="submit">Show me the five check-ins</button>
      </form>
    </section>`;
}

function scaleCard(scale) {
  const done = Boolean(session.results[scale.id]);
  const draft = session.drafts[scale.id] || [];
  const answered = draft.filter((value) => value !== null && value !== undefined).length;
  let status = scale.time;
  let action = "Start";
  if (done) { status = "Done"; action = "View reflection"; }
  else if (answered) { status = answered + "/" + scale.questions.length; action = "Keep going"; }
  return `
    <button class="scale-card ${done ? "done" : ""}" type="button" data-action="${done ? "result" : "scale"}" data-scale="${scale.id}">
      <span class="scale-top"><span class="scale-icon">${scale.icon}</span><span class="status-pill">${status}</span></span>
      <h3>${esc(scale.title)}</h3><p>${esc(scale.description)}</p><span class="card-action">${action} &rarr;</span>
    </button>`;
}

function dashboardView() {
  const count = completed().length;
  return `
    <section>
      <div class="dashboard-head">
        <div><p class="eyebrow">Your MindPop mix</p><h2>${count ? "Nice momentum." : "Pick a place to start."}</h2><p>${count ? count + " of 5 complete. Your progress is saved here." : "Any order works. Most take a minute or two."}</p></div>
        <div class="overall-progress"><strong>${count}/5 complete</strong><progress value="${count}" max="5">${count} of 5</progress></div>
      </div>
      <div class="scale-grid">
        ${ORDER.map((scaleId) => scaleCard(scales[scaleId])).join("")}
        <div class="unlock">
          <div><h3>${allDone() ? "Your full snapshot is ready" : "Complete all five to connect the dots"}</h3><p>${allDone() ? "See how your five reflections sit together." : "A combined summary brings the patterns into one practical view."}</p></div>
          <button class="button ${allDone() ? "" : "secondary"}" type="button" data-action="summary" ${allDone() ? "" : "disabled"}>${allDone() ? "Open my snapshot" : (5 - count) + " to go"}</button>
        </div>
      </div>
    </section>`;
}

function questionView(scaleId, index) {
  const scale = scales[scaleId];
  if (!scale) return dashboardView();
  const responses = session.drafts[scaleId] || Array(scale.questions.length).fill(null);
  const selected = responses[index];
  const answered = responses.filter((value) => value !== null && value !== undefined).length;
  const choices = scale.optionsByQuestion ? scale.optionsByQuestion[index] : scale.options;
  return `
    <section class="question-shell">
      <div class="question-top">
        <button class="quiet-button" type="button" data-action="${index ? "previous" : "dashboard"}" aria-label="Go back">&larr; Back</button>
        <div class="question-meta"><strong>${esc(scale.short)} &middot; ${index + 1} of ${scale.questions.length}</strong><progress value="${answered}" max="${scale.questions.length}">${answered} answered</progress></div>
      </div>
      <div class="question-card">
        ${scale.prompt ? '<p class="question-prompt">' + esc(scale.prompt) + "</p>" : ""}
        <h2>${esc(scale.questions[index])}</h2>
        <div class="options" role="radiogroup" aria-label="Answer choices">
          ${choices.map((option, optionIndex) => `
            <button class="option ${selected === option.value ? "selected" : ""}" type="button" role="radio" aria-checked="${selected === option.value}" data-action="answer" data-scale="${scaleId}" data-index="${index}" data-value="${option.value}">
              <span class="option-key">${optionIndex + 1}</span><span>${esc(option.label)}</span>
            </button>`).join("")}
        </div>
      </div>
      <div class="question-actions">
        <button class="button secondary" type="button" data-action="dashboard">Save & exit</button>
        ${index === scale.questions.length - 1 ? '<button class="button" type="button" data-action="finish" data-scale="' + scaleId + '"' + (selected === null || selected === undefined ? " disabled" : "") + ">See my reflection &rarr;</button>" : ""}
      </div>
    </section>`;
}

const labels = {
  extraversion: "Social energy", agreeableness: "Cooperation", conscientiousness: "Structure",
  emotionalReactivity: "Emotional reactivity", openness: "Openness", awareness: "Self-awareness",
  selfManagement: "Self-management", empathy: "Empathy", intrinsic: "Enjoyment",
  identified: "Personal value", introjected: "Inner pressure", external: "External pull", amotivation: "Disconnection"
};

function descriptor(value, low, high) {
  if (value < low) return "Leans lower";
  if (value > high) return "Leans higher";
  return "Middle range";
}

function metric(label, value, min, max, display) {
  const percent = ((value - min) / (max - min)) * 100;
  return `<div class="metric"><div class="metric-head"><strong>${esc(label)}</strong><span>${esc(display || value)}</span></div><div class="meter"><div class="meter-fill" data-meter="${percent}"></div></div></div>`;
}

function resultModel(scaleId, result) {
  const score = result.score;
  if (scaleId === "personality") {
    const ranked = Object.entries(score.domains).sort((a, b) => b[1] - a[1]);
    const first = labels[ranked[0][0]].toLowerCase();
    const second = labels[ranked[1][0]].toLowerCase();
    return {
      headline: "Your style is a mix, not a box.",
      body: "Right now, " + first + " and " + second + " stand out most. Treat these as tendencies - not limits or fixed types.",
      action: "Try noticing one moment this week when a different side of you shows up. Context changes how traits look.",
      metrics: Object.entries(score.domains).map(([key, value]) => metric(labels[key], value, 1, 5, value + "/5"))
    };
  }
  if (scaleId === "emotionalSkills") {
    const value = score.average;
    const copy = value < 2.8
      ? ["This looks like a skill-building moment.", "Try a ten-second pause: name the feeling, name what triggered it, then choose the next move."]
      : value < 3.8
        ? ["You are catching a fair amount of what is happening emotionally.", "When a feeling gets loud, ask: what is it trying to protect or point out?"]
        : ["You report a strong read on emotions - your own and other people's.", "Use that awareness gently: understanding a feeling does not mean you have to fix it immediately."];
    return { headline: copy[0], body: "Your overall reflection average is " + value + " out of 5. This is an informal skills check, not a validated EI score.", action: copy[1], metrics: Object.entries(score.domains).map(([key, v]) => metric(labels[key], v, 1, 5, v + "/5")) };
  }
  if (scaleId === "happiness") {
    const value = score.average;
    const copy = value < 3.5
      ? ["Life may feel a little muted right now.", "Pick one tiny thing that usually makes the day 2% better and make room for it - not as a cure, just as care."]
      : value < 5.3
        ? ["There is a steady mix of bright and difficult moments.", "Write down one good moment tonight and what helped it happen. Patterns are easier to repeat when you can see them."]
        : ["You are reporting a strong sense of happiness overall.", "Notice what is supporting that feeling - people, routines, places or purpose - and protect a little space for it."];
    return { headline: copy[0], body: "Your Subjective Happiness Scale average is " + value + " out of 7. It is a snapshot, not a verdict on your life.", action: copy[1], metrics: [metric("Subjective happiness", value, 1, 7, value + "/7")] };
  }
  if (scaleId === "stress") {
    const value = score.total;
    const copy = value <= 5
      ? ["Things seem fairly manageable at the moment.", "Keep one recovery habit on purpose this week - even when you feel fine."]
      : value <= 10
        ? ["There is some real pressure in the mix.", "Choose one task to make smaller: define the next ten-minute step instead of holding the whole problem at once."]
        : ["Your answers suggest life has felt heavily loaded.", "Tell one trusted person what has been piling up. Support works better before everything becomes urgent."];
    return { headline: copy[0], body: "Your PSS-4 total is " + value + " out of 16. The PSS has no diagnostic cutoffs, so this is described, not labelled.", action: copy[1], support: value >= 11, metrics: [metric("Perceived stress", value, 0, 16, value + "/16")] };
  }
  const top = labels[score.dominant].toLowerCase();
  const next = labels[score.runnerUp].toLowerCase();
  const disconnected = score.dominant === "amotivation";
  return {
    headline: disconnected ? "Your motivation may need a reset, not a lecture." : "Your strongest pull is " + top + ".",
    body: disconnected ? "Disconnection is showing up most strongly, with " + next + " next. That can happen when effort and meaning drift apart." : "Your next strongest pull is " + next + ". Motivation is usually a blend, and it can change by subject or situation.",
    action: disconnected ? "Shrink the goal until the first step feels almost too easy, then reconnect it to one reason that matters to you." : "Before the next task, say the reason out loud: I am doing this because... The answer can reveal what kind of support you need.",
    metrics: Object.entries(score.domains).map(([key, value]) => metric(labels[key], value, 1, 7, value + "/7"))
  };
}

function supportBlock() {
  const url = safeUrl(config.supportUrl);
  return `<div class="support-card"><h3>A little support could help</h3><p>A high stress reflection is not a diagnosis, but you do not have to carry pressure alone.</p>${url ? '<a class="button secondary" href="' + esc(url) + '" target="_blank" rel="noopener noreferrer">' + esc(config.supportLabel || "Find support") + "</a>" : "<p><strong>" + esc(config.supportLabel || "Contact your campus wellbeing team") + "</strong></p>"}</div>`;
}

function resultView(scaleId) {
  const scale = scales[scaleId];
  const result = session.results[scaleId];
  if (!scale || !result) return dashboardView();
  const model = resultModel(scaleId, result);
  return `
    <section class="result-wrap">
      <div class="result-hero"><p class="eyebrow">${esc(scale.title)} &middot; complete</p><h1>${esc(model.headline)}</h1><p>${esc(model.body)}</p></div>
      <div class="metric-grid">${model.metrics.join("")}</div>
      <div class="insight"><h3>Try this</h3><p>${esc(model.action)}</p></div>
      ${model.support ? supportBlock() : ""}
      <p class="notice">Scoring basis: ${esc(scale.source)}. Results are descriptive and non-diagnostic.</p>
      <div class="button-row"><button class="button" type="button" data-action="dashboard">Back to the five</button>${allDone() ? '<button class="button secondary" type="button" data-action="summary">Full snapshot</button>' : ""}</div>
    </section>`;
}

function summaryView() {
  if (!allDone()) return dashboardView();
  const rows = ORDER.map((scaleId) => {
    const scale = scales[scaleId];
    const model = resultModel(scaleId, session.results[scaleId]);
    return `<div class="summary-row"><span class="scale-icon">${scale.icon}</span><div><h3>${esc(scale.short)}</h3><p>${esc(model.headline)}</p></div><strong>Complete</strong></div>`;
  }).join("");
  const status = session.submission.status;
  let statusCopy = "";
  if (status === "sent") statusCopy = '<p class="notice success">Anonymous response submitted. Thank you.</p>';
  if (status === "queued") statusCopy = '<p class="notice">Saved on this device. It will not leave the browser until a secure submission endpoint is connected.</p>';
  if (status === "error") statusCopy = '<p class="notice error">The response could not be sent, so it remains saved on this device.</p>';
  return `
    <section class="result-wrap">
      <div class="result-hero"><p class="eyebrow">All five complete</p><h1>Your MindPop snapshot.</h1><p>Five lenses, one current picture. Keep what feels useful and leave what does not.</p></div>
      <div class="summary-list">${rows}</div>
      <div class="insight"><h3>A good next move</h3><p>Pick just one "Try this" idea from your results. Tiny experiments beat a giant self-improvement list.</p></div>
      <div class="submit-card">
        <h3>Share the anonymous snapshot?</h3>
        <p>${session.consent.share ? "You opted in. One completed record will be sent - never your name or phone number." : "You chose local-only mode. You can opt in now, or keep the snapshot entirely on this device."}</p>
        <div class="button-row">
          <button class="button" type="button" data-action="${session.consent.share ? "submit" : "enable-share"}">${session.consent.share ? "Submit anonymous response" : "Opt in & submit"}</button>
          <button class="button secondary" type="button" data-action="download">Download my copy</button>
        </div>
        ${statusCopy}${notice ? '<p class="notice error">' + esc(notice) + "</p>" : ""}
      </div>
      <div class="button-row"><button class="button secondary" type="button" data-action="dashboard">Back to dashboard</button></div>
    </section>`;
}

function privacyView() {
  const policy = safeUrl(config.privacyUrl);
  return `
    <section class="panel">
      <div class="panel-head"><p class="eyebrow">Privacy in plain language</p><h2>Your answers belong to you.</h2></div>
      <div class="privacy-copy">
        <h3>What stays on this device</h3><p>Your random ID, broad demographic context, progress, answers and results are kept in local browser storage so the experience can recover after a refresh.</p>
        <h3>What is not collected</h3><p>MindPop does not ask for a name or phone number. This version has no advertising, analytics, trackers, third-party fonts or social pixels.</p>
        <h3>What can be shared</h3><p>Only a completed, anonymous snapshot is eligible for upload, and only after you opt in and press submit. If the secure endpoint is not connected, it stays queued locally.</p>
        <h3>Important limit</h3><p>A browser cannot hide a backend URL or secret. Production submissions must go through a protected server-side proxy with validation, rate limits and origin checks.</p>
        ${policy ? '<p><a href="' + esc(policy) + '" target="_blank" rel="noopener noreferrer">Read the full institutional privacy policy</a></p>' : ""}
      </div>
      <div class="danger-zone"><button class="button danger" type="button" data-action="clear">Delete my local data</button></div>
      <div class="button-row"><button class="button secondary" type="button" data-action="close-privacy">Go back</button></div>
    </section>`;
}

function render() {
  if (route.name === "consent") return draw(consentView());
  if (route.name === "profile") return draw(profileView());
  if (route.name === "dashboard") return draw(dashboardView());
  if (route.name === "question") return draw(questionView(route.scaleId, route.index));
  if (route.name === "result") return draw(resultView(route.scaleId));
  if (route.name === "summary") return draw(summaryView());
  if (route.name === "privacy") return draw(privacyView());
  draw(landingView());
}

function startScale(scaleId) {
  const scale = scales[scaleId];
  if (!scale) return;
  if (!session.drafts[scaleId]) session.drafts[scaleId] = Array(scale.questions.length).fill(null);
  const firstOpen = session.drafts[scaleId].findIndex((value) => value === null || value === undefined);
  persist();
  go("question", { scaleId, index: firstOpen < 0 ? 0 : firstOpen });
}

function finishScale(scaleId) {
  const scale = scales[scaleId];
  const responses = session.drafts[scaleId];
  if (!scale || !responses || responses.some((value) => value === null || value === undefined)) {
    notice = "Please answer every question before finishing.";
    return render();
  }
  session.results[scaleId] = {
    responses: [...responses],
    score: scale.score(responses),
    completedAt: new Date().toISOString()
  };
  delete session.drafts[scaleId];
  if (allDone() && !session.completedAt) session.completedAt = new Date().toISOString();
  persist();
  go("result", { scaleId });
}

function payload() {
  const assessments = {};
  ORDER.forEach((scaleId) => {
    assessments[scaleId] = {
      responses: session.results[scaleId].responses,
      score: session.results[scaleId].score,
      completedAt: session.results[scaleId].completedAt
    };
  });
  return {
    schemaVersion: 2,
    appVersion: APP_VERSION,
    submissionId: session.submission.id || id(),
    participantId: session.participantId,
    consentedAt: session.consent.acceptedAt,
    startedAt: session.startedAt,
    completedAt: session.completedAt,
    profile: { ...session.profile },
    assessments,
    client: { language: navigator.language, timezoneOffsetMinutes: new Date().getTimezoneOffset() }
  };
}

function queueSubmission(data) {
  let queue = [];
  try { queue = JSON.parse(localStorage.getItem(QUEUE_KEY)) || []; } catch (_) { queue = []; }
  queue = queue.filter((item) => item.submissionId !== data.submissionId);
  queue.push(data);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-3)));
}

async function submit() {
  if (!allDone() || !session.consent.share) return;
  const now = Date.now();
  if (now - session.submission.lastAttempt < 10000) {
    notice = "Please wait a few seconds before trying again.";
    return render();
  }
  session.submission.lastAttempt = now;
  const data = payload();
  session.submission.id = data.submissionId;
  const endpoint = String(config.submissionEndpoint || "").trim();

  if (!endpoint) {
    queueSubmission(data);
    session.submission.status = "queued";
    persist();
    return render();
  }

  const directAppsScript = /script\.google\.com/i.test(endpoint);
  if (directAppsScript && !config.allowDirectAppsScript) {
    queueSubmission(data);
    session.submission.status = "queued";
    notice = "Direct Apps Script submission is disabled. Connect a protected proxy first.";
    persist();
    return render();
  }

  try {
    const direct = config.submissionMode === "direct-apps-script";
    const response = await fetch(endpoint, {
      method: "POST",
      mode: direct ? "no-cors" : "cors",
      credentials: "omit",
      cache: "no-store",
      referrerPolicy: "no-referrer",
      headers: { "Content-Type": direct ? "text/plain;charset=UTF-8" : "application/json" },
      body: JSON.stringify(data)
    });
    if (!direct && !response.ok) throw new Error("Submission rejected");
    session.submission.status = "sent";
  } catch (_) {
    queueSubmission(data);
    session.submission.status = "error";
  }
  persist();
  render();
}

function downloadSnapshot() {
  const data = {
    exportedAt: new Date().toISOString(),
    note: "Private, non-diagnostic MindPop reflection",
    results: Object.fromEntries(ORDER.map((scaleId) => [scaleId, session.results[scaleId].score]))
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "mindpop-snapshot.json";
  anchor.click();
  URL.revokeObjectURL(url);
}

document.addEventListener("submit", (event) => {
  event.preventDefault();
  const form = new FormData(event.target);
  if (event.target.id === "consent-form") {
    if (!form.get("participate")) return;
    session.consent = { participate: true, share: Boolean(form.get("share")), acceptedAt: new Date().toISOString() };
    persist();
    return go("profile");
  }
  if (event.target.id === "profile-form") {
    if (form.get("website")) return;
    session.profile = {
      department: String(form.get("department") || ""),
      role: String(form.get("role") || ""),
      year: String(form.get("year") || ""),
      gender: String(form.get("gender") || "")
    };
    persist();
    go("dashboard");
  }
});

document.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;
  event.preventDefault();
  const action = target.dataset.action;
  if (action === "begin") return go("consent");
  if (action === "home") return go(session.consent.participate ? "dashboard" : "landing");
  if (action === "privacy") return go("privacy", { previous: route });
  if (action === "close-privacy") return go(session.consent.participate ? "dashboard" : "landing");
  if (action === "dashboard") return go("dashboard");
  if (action === "scale") return startScale(target.dataset.scale);
  if (action === "result") return go("result", { scaleId: target.dataset.scale });
  if (action === "previous") return go("question", { scaleId: route.scaleId, index: Math.max(0, route.index - 1) });
  if (action === "answer") {
    const scaleId = target.dataset.scale;
    const index = Number(target.dataset.index);
    session.drafts[scaleId][index] = Number(target.dataset.value);
    persist();
    if (index < scales[scaleId].questions.length - 1) return go("question", { scaleId, index: index + 1 });
    return render();
  }
  if (action === "finish") return finishScale(target.dataset.scale);
  if (action === "summary") return go("summary");
  if (action === "enable-share") {
    session.consent.share = true;
    persist();
    return submit();
  }
  if (action === "submit") return submit();
  if (action === "download") return downloadSnapshot();
  if (action === "clear" && window.confirm("Delete all MindPop progress and queued responses from this device?")) {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(QUEUE_KEY);
    session = freshSession();
    return go("landing");
  }
});

if (session.consent.participate) route = { name: "dashboard" };
render();
