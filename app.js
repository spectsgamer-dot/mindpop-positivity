"use strict";

const { scales } = window.MindPopScoring;
const config = window.MINDPOP_CONFIG || {};
const app = document.getElementById("app");
const ORDER = ["personality", "emotionalSkills", "happiness", "stress", "motivation"];
const STORAGE_KEY = "mindpop_session_v3";
const QUEUE_KEY = "mindpop_submission_queue_v3";
const APP_VERSION = "2.1.0";
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
    schemaVersion: 3,
    participantId: id(),
    startedAt: new Date().toISOString(),
    consent: { participate: false, dataUse: false, acceptedAt: "" },
    profile: { name: "", faculty: "", role: "", year: "", gender: "" },
    drafts: {},
    results: {},
    completedAt: ""
  };
}

function readSession() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (parsed && parsed.schemaVersion === 3 && parsed.participantId) return parsed;
  } catch (_) {
    localStorage.removeItem(STORAGE_KEY);
  }
  return freshSession();
}

localStorage.removeItem("mindpop_session");
localStorage.removeItem("mindpop_session_v2");
localStorage.removeItem("mindpop_submission_queue_v2");
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

function firstName() {
  return (session.profile.name || "there").trim().split(/\s+/)[0];
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
        <p class="eyebrow">Five tiny check-ins. One clearer picture.</p>
        <h1>Meet your mind, minus the clinical vibes.</h1>
        <p class="lede">Explore personality, emotional skills, happiness, stress and motivation in about eight minutes. Finish all five to unlock a cute, shareable MindPop Mix.</p>
        <button class="button" type="button" data-action="begin">Start my check-in <span aria-hidden="true">&rarr;</span></button>
        <div class="hero-note"><span>Saved as you go</span><span>Instant reflections</span><span>Share card at 5/5</span></div>
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
        <h2>A quick, honest heads-up.</h2>
        <p>This is a student wellbeing reflection, not a diagnosis. Your name is required by the institution, so your responses are identifiable.</p>
      </div>
      <ul class="consent-list">
        <li><strong>1</strong><span>Each completed check-in is saved separately, so partial progress can still help if you stop before all five.</span></li>
        <li><strong>2</strong><span>Your name, profile details and answers for that check-in may be sent to the institution after you finish it.</span></li>
        <li><strong>3</strong><span>Participation remains voluntary. You can leave at any time or clear the copy stored on this device.</span></li>
      </ul>
      <form id="consent-form">
        <label class="check-row"><input name="participate" type="checkbox" required><span>I choose to take part and understand these results are non-diagnostic.</span></label>
        <label class="check-row"><input name="dataUse" type="checkbox" required><span>I understand my name, profile and each completed check-in may be saved for institutional wellbeing analysis.</span></label>
        <div class="button-row">
          <button class="button" type="submit">I understand, continue</button>
          <button class="button secondary" type="button" data-action="home">Not now</button>
        </div>
      </form>
    </section>`;
}

const faculties = [
  "Humanities & Social Sciences", "Sciences", "Allied and Healthcare Sciences",
  "Pharmaceutical Sciences", "Engineering", "Computer Technology",
  "Nursing", "Physiotherapy & Rehabilitation", "Commerce & Management",
  "Agriculture Sciences & Technology", "Non-Teaching Staff"
];
const roles = ["Undergraduate", "Postgraduate", "Diploma", "PhD", "Faculty", "Staff"];

function yearChoices(role) {
  if (role === "Undergraduate") return ["Year 1", "Year 2", "Year 3", "Year 4"];
  if (role === "Postgraduate" || role === "Diploma") return ["Year 1", "Year 2"];
  return [];
}

function options(items, selected, placeholder = "Select one") {
  return '<option value="">' + esc(placeholder) + "</option>" + items.map((item) =>
    '<option value="' + esc(item) + '"' + (item === selected ? " selected" : "") + ">" + esc(item) + "</option>"
  ).join("");
}

function profileView() {
  const p = session.profile;
  const years = yearChoices(p.role);
  return `
    <section class="panel">
      <div class="panel-head">
        <p class="eyebrow">One quick setup</p>
        <h2>Tell us a little about you.</h2>
        <p>These details help the institution understand wellbeing patterns across different student and staff groups.</p>
      </div>
      <form id="profile-form">
        <div class="honeypot" aria-hidden="true"><label>Website<input name="website" tabindex="-1" autocomplete="off"></label></div>
        <div class="form-grid">
          <div class="field full">
            <label for="name">Name</label>
            <input id="name" name="name" type="text" maxlength="80" autocomplete="name" value="${esc(p.name)}" required>
            <small>Required by your institution and included with saved responses.</small>
          </div>
          <div class="field"><label for="faculty">Faculty of</label><select id="faculty" name="faculty" required>${options(faculties, p.faculty, "Choose a faculty")}</select></div>
          <div class="field"><label for="role">I am a...</label><select id="role" name="role" required>${options(roles, p.role)}</select></div>
          <div class="field" id="year-field"${years.length ? "" : " hidden"}>
            <label for="year">Current year</label>
            <select id="year" name="year"${years.length ? " required" : ""}>${options(years, p.year, "Choose your year")}</select>
          </div>
          <div class="field"><label for="gender">Gender</label><select id="gender" name="gender" required>${options(["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"], p.gender)}</select></div>
        </div>
        <button class="button" type="submit">Show me the five check-ins</button>
      </form>
    </section>`;
}

function updateYearField(role) {
  const field = document.getElementById("year-field");
  const select = document.getElementById("year");
  if (!field || !select) return;
  const years = yearChoices(role);
  const selected = years.includes(select.value) ? select.value : "";
  field.hidden = years.length === 0;
  select.required = years.length > 0;
  select.disabled = years.length === 0;
  select.innerHTML = options(years, selected, "Choose your year");
}

function scaleCard(scale) {
  const done = Boolean(session.results[scale.id]);
  const draft = session.drafts[scale.id] || [];
  const answered = draft.filter((value) => value !== null && value !== undefined).length;
  let status = scale.time;
  let action = "Start";
  if (done) {
    const saved = session.results[scale.id].submissionStatus;
    status = saved === "sent" ? "Saved" : saved === "saving" ? "Saving..." : "On device";
    action = "View reflection";
  }
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
        <div><p class="eyebrow">Hey ${esc(firstName())}</p><h2>${count ? "Nice momentum." : "Pick a place to start."}</h2><p>${count ? count + " of 5 complete. Each finished test is saved separately." : "Any order works. Most take a minute or two."}</p></div>
        <div class="overall-progress"><strong>${count}/5 complete</strong><progress value="${count}" max="5">${count} of 5</progress></div>
      </div>
      <div class="scale-grid">
        ${ORDER.map((scaleId) => scaleCard(scales[scaleId])).join("")}
        <div class="unlock">
          <div><h3>${allDone() ? "Your MindPop Mix is ready!" : "Finish all five to unlock your MindPop Mix"}</h3><p>${allDone() ? "Open a cute report you can save or share without your name or raw answers." : "Your share card is waiting. No pressure, just a little completion sparkle."}</p></div>
          <button class="button ${allDone() ? "" : "secondary"}" type="button" data-action="summary" ${allDone() ? "" : "disabled"}>${allDone() ? "Open my report" : count + "/5 complete"}</button>
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

function deeperNarrative(scaleId, result) {
  const score = result.score;
  if (scaleId === "personality") {
    const top = Object.entries(score.domains).sort((a, b) => b[1] - a[1])[0][0];
    const stories = {
      extraversion: "You may recharge through people, conversation and visible momentum. Quiet time can still matter; social energy is simply a noticeable part of your mix.",
      agreeableness: "You may naturally notice other people's needs and prefer cooperation. A kind boundary can help that warmth stay sustainable.",
      conscientiousness: "Structure, preparation and finishing things may come fairly naturally. On difficult weeks, a smaller plan can work better than expecting perfect consistency.",
      emotionalReactivity: "Your answers suggest emotions may feel especially vivid or quick to arrive. Naming the feeling can create a little space before the next move.",
      openness: "New ideas, imagination and variety may energise you. Turning one interesting idea into a tiny action can keep curiosity from becoming overload."
    };
    return stories[top];
  }
  if (scaleId === "emotionalSkills") {
    const sorted = Object.entries(score.domains).sort((a, b) => b[1] - a[1]);
    return "Your strongest area is " + labels[sorted[0][0]].toLowerCase() + ", while " + labels[sorted[sorted.length - 1][0]].toLowerCase() + " may be the most useful place to practise. Neither is fixed.";
  }
  if (scaleId === "happiness") {
    if (score.average >= 5) return "There is a solid positive signal here. It does not erase hard days; it suggests satisfaction or enjoyment is fairly available overall.";
    if (score.average <= 3) return "Life may feel flat or heavy lately. Treat this as a prompt for care and connection, not as a verdict about you.";
    return "Your result sits in a mixed zone: there may be good moments alongside real strain. Both can be true at once.";
  }
  if (scaleId === "stress") {
    if (score.total >= 11) return "Several demands may be competing for more energy than you currently have. Reducing one load and telling someone can be more useful than pushing through alone.";
    if (score.total <= 5) return "Things feel relatively manageable right now. This is a good time to notice which routines and people are helping you stay steady.";
    return "Pressure is present but not at the highest end. A little recovery and a clearer next step may prevent it from stacking up.";
  }
  const stories = {
    intrinsic: "Interest and enjoyment seem to be doing much of the pulling. Choice and variety may help that energy last.",
    identified: "You are often moved by personal meaning and long-term value. Making that purpose visible can help on boring days.",
    introjected: "Guilt or self-pressure may be carrying part of the workload. A kinder reason and a smaller target can make motivation less exhausting.",
    external: "Expectations, rewards or consequences may be doing much of the pushing. Finding one reason that belongs to you can add staying power.",
    amotivation: "The why may feel blurry right now. That can happen with burnout or disconnection; begin with one achievable step and ask for support if it persists."
  };
  return stories[score.dominant];
}

function saveStatusBlock(result) {
  if (result.submissionStatus === "sent") return '<p class="notice success">Saved to the institution. You can safely continue or come back later.</p>';
  if (result.submissionStatus === "saving") return '<p class="notice">Saving this completed check-in...</p>';
  return '<p class="notice">Saved on this device and queued until a secure submission endpoint is available.</p>';
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
      ${saveStatusBlock(result)}
      <div class="metric-grid">${model.metrics.join("")}</div>
      <div class="insight"><h3>What this may look like</h3><p>${esc(deeperNarrative(scaleId, result))}</p><p class="insight-action"><strong>Try this:</strong> ${esc(model.action)}</p></div>
      ${model.support ? supportBlock() : ""}
      <p class="notice">Scoring basis: ${esc(scale.source)}. Results are descriptive and non-diagnostic.</p>
      <div class="button-row"><button class="button" type="button" data-action="dashboard">Back to the five</button>${allDone() ? '<button class="button secondary" type="button" data-action="summary">See my MindPop Mix</button>' : ""}</div>
    </section>`;
}

function combinedNarrative() {
  const personality = resultModel("personality", session.results.personality);
  const emotional = resultModel("emotionalSkills", session.results.emotionalSkills);
  const happiness = session.results.happiness.score.average;
  const stress = session.results.stress.score.total;
  const motivation = labels[session.results.motivation.score.dominant].toLowerCase();
  const balance = stress >= 11
    ? "Your system may be asking for less load and more support."
    : stress <= 5
      ? "Your stress signal looks fairly manageable right now."
      : "There is some pressure in the mix, so recovery still deserves a calendar slot.";
  return firstName() + ", " + personality.headline.toLowerCase() + " " + emotional.headline + " Happiness is " + happiness + "/7, while " + motivation + " is your strongest motivation signal. " + balance;
}

function summaryView() {
  if (!allDone()) return dashboardView();
  const rows = ORDER.map((scaleId) => {
    const scale = scales[scaleId];
    const model = resultModel(scaleId, session.results[scaleId]);
    return `<div class="vibe-item"><span class="vibe-icon">${scale.icon}</span><div><strong>${esc(scale.short)}</strong><p>${esc(model.headline)}</p></div></div>`;
  }).join("");
  const sent = Object.values(session.results).filter((result) => result.submissionStatus === "sent").length;
  return `
    <section class="result-wrap">
      <div class="vibe-report">
        <span class="vibe-badge">5/5 COMPLETE &#10022;</span>
        <p class="vibe-kicker">My MindPop Mix</p>
        <h1>Self-awareness, but make it cute.</h1>
        <p class="vibe-story">${esc(combinedNarrative())}</p>
        <div class="vibe-grid">${rows}</div>
        <p class="vibe-foot">A reflection, not a diagnosis. Generated by MindPop.</p>
      </div>
      <div class="save-summary"><strong>Your five check-ins are complete.</strong><p>${sent} sent securely &middot; ${5 - sent} saved on this device or queued. The share image leaves out your name and raw answers.</p></div>
      ${notice ? '<p class="notice success">' + esc(notice) + "</p>" : ""}
      <div class="button-row report-actions">
        <button class="button" type="button" data-action="share-report">Share or save my report</button>
        <button class="button secondary" type="button" data-action="download">Download my private data</button>
        <button class="button secondary" type="button" data-action="dashboard">Back to dashboard</button>
      </div>
    </section>`;
}

function privacyView() {
  const policy = safeUrl(config.privacyUrl);
  return `
    <section class="panel">
      <div class="panel-head"><p class="eyebrow">Privacy in plain language</p><h2>Your answers belong to you.</h2></div>
      <div class="privacy-copy">
        <h3>What this app collects</h3><p>Your required name, faculty, role, applicable year, gender, answers, calculated scores and completion times. Because a name is collected, this is identifiable data.</p>
        <h3>When data is sent</h3><p>After consent, every completed check-in is prepared as its own saved record. If a secure endpoint is configured it is sent immediately; otherwise it remains queued on this device. Unfinished answers stay on this device.</p>
        <h3>What sharing includes</h3><p>The optional report image contains broad result headlines only. It excludes your name, profile details and raw answers by default. You decide whether to share it.</p>
        <h3>Important limit</h3><p>A browser cannot hide a Google Apps Script URL or secret. Production submissions must use a protected server-side proxy with validation, rate limits and access controls.</p>
        <h3>Your choice</h3><p>You may stop at any time. Clearing this device removes its local copy, but cannot recall records already received by the institution.</p>
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
    completedAt: new Date().toISOString(),
    submissionId: id(),
    submissionStatus: "saving"
  };
  delete session.drafts[scaleId];
  if (allDone() && !session.completedAt) session.completedAt = new Date().toISOString();
  persist();
  go("result", { scaleId });
  void sendProgress(scaleId);
}

function progressPayload(scaleId) {
  const result = session.results[scaleId];
  return {
    recordType: "assessment-progress",
    schemaVersion: 3,
    appVersion: APP_VERSION,
    submissionId: result.submissionId,
    participantId: session.participantId,
    consentedAt: session.consent.acceptedAt,
    startedAt: session.startedAt,
    profile: { ...session.profile },
    assessment: {
      id: scaleId,
      source: scales[scaleId].source,
      responses: [...result.responses],
      score: result.score,
      completedAt: result.completedAt
    },
    progress: { completed: completed().length, total: ORDER.length, isComplete: allDone() },
    client: { language: navigator.language, timezoneOffsetMinutes: new Date().getTimezoneOffset() }
  };
}

function readQueue() {
  try {
    const queue = JSON.parse(localStorage.getItem(QUEUE_KEY));
    return Array.isArray(queue) ? queue : [];
  } catch (_) {
    return [];
  }
}

function queueSubmission(data) {
  const queue = readQueue().filter((item) => item.submissionId !== data.submissionId);
  queue.push(data);
  localStorage.setItem(QUEUE_KEY, JSON.stringify(queue.slice(-10)));
}

async function sendProgress(scaleId) {
  const result = session.results[scaleId];
  if (!result || !session.consent.dataUse) return;
  const data = progressPayload(scaleId);
  const endpoint = String(config.submissionEndpoint || "").trim();
  const directAppsScript = /script\.google(?:usercontent)?\.com/i.test(endpoint);

  if (!endpoint || (directAppsScript && !config.allowDirectAppsScript)) {
    queueSubmission(data);
    result.submissionStatus = "queued";
    persist();
    if (route.name === "result" && route.scaleId === scaleId) render();
    return;
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
    result.submissionStatus = "sent";
    localStorage.setItem(QUEUE_KEY, JSON.stringify(readQueue().filter((item) => item.submissionId !== data.submissionId)));
  } catch (_) {
    queueSubmission(data);
    result.submissionStatus = "queued";
  }
  persist();
  if (route.name === "result" && route.scaleId === scaleId) render();
}

function reportText() {
  return ORDER.map((scaleId) => scales[scaleId].short + ": " + resultModel(scaleId, session.results[scaleId]).headline).join("\n");
}

function drawWrapped(context, text, x, y, maxWidth, lineHeight, maxLines) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const trial = line ? line + " " + word : word;
    if (context.measureText(trial).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = trial;
    }
  });
  if (line) lines.push(line);
  lines.slice(0, maxLines).forEach((entry, index) => context.fillText(entry, x, y + index * lineHeight));
}

function makeReportCanvas() {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1350;
  const context = canvas.getContext("2d");
  const gradient = context.createLinearGradient(0, 0, 1080, 1350);
  gradient.addColorStop(0, "#17332a");
  gradient.addColorStop(0.58, "#205f4e");
  gradient.addColorStop(1, "#d98b46");
  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.fillStyle = "rgba(255,255,255,.12)";
  context.beginPath();
  context.arc(930, 130, 240, 0, Math.PI * 2);
  context.fill();
  context.beginPath();
  context.arc(100, 1210, 290, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = "#d9f4e5";
  context.font = "700 30px Arial";
  context.fillText("MINDPOP  /  5 OF 5 COMPLETE", 80, 100);
  context.fillStyle = "#ffffff";
  context.font = "800 84px Arial";
  context.fillText("My MindPop Mix", 80, 205);
  context.font = "500 34px Arial";
  context.fillText("Self-awareness, but make it cute.", 80, 265);

  let y = 390;
  ORDER.forEach((scaleId, index) => {
    const model = resultModel(scaleId, session.results[scaleId]);
    context.fillStyle = index % 2 ? "#fff0d8" : "#d9f4e5";
    context.beginPath();
    if (context.roundRect) context.roundRect(80, y, 920, 130, 28);
    else context.rect(80, y, 920, 130);
    context.fill();
    context.fillStyle = "#17332a";
    context.font = "800 28px Arial";
    context.fillText(scales[scaleId].short.toUpperCase(), 115, y + 44);
    context.font = "600 31px Arial";
    drawWrapped(context, model.headline, 115, y + 88, 820, 36, 2);
    y += 155;
  });

  context.fillStyle = "#ffffff";
  context.font = "600 25px Arial";
  drawWrapped(context, "A reflection, not a diagnosis. No name or raw answers included.", 80, 1215, 900, 34, 2);
  context.font = "800 28px Arial";
  context.fillText("mindpop  \u2728  notice your patterns", 80, 1300);
  return canvas;
}

function canvasBlob(canvas) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Image unavailable")), "image/png");
  });
}

async function shareReport() {
  if (!allDone()) return;
  try {
    const blob = await canvasBlob(makeReportCanvas());
    const file = new File([blob], "my-mindpop-mix.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ title: "My MindPop Mix", text: "I finished all five MindPop check-ins.\n\n" + reportText(), files: [file] });
      notice = "Your report is ready to share.";
    } else {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      notice = "Your shareable report image was downloaded.";
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
    notice = "Could not create the report image on this browser. Try downloading your private data instead.";
  }
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
    if (!form.get("participate") || !form.get("dataUse")) return;
    session.consent = { participate: true, dataUse: true, acceptedAt: new Date().toISOString() };
    persist();
    return go("profile");
  }
  if (event.target.id === "profile-form") {
    if (form.get("website")) return;
    const role = String(form.get("role") || "");
    const allowedYears = yearChoices(role);
    const year = String(form.get("year") || "");
    if (allowedYears.length && !allowedYears.includes(year)) return;
    session.profile = {
      name: String(form.get("name") || "").trim(),
      faculty: String(form.get("faculty") || ""),
      role,
      year: allowedYears.length ? year : "",
      gender: String(form.get("gender") || "")
    };
    if (!session.profile.name || !session.profile.faculty || !session.profile.role || !session.profile.gender) return;
    persist();
    go("dashboard");
  }
});

document.addEventListener("change", (event) => {
  if (event.target.id === "role") updateYearField(event.target.value);
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
  if (action === "share-report") return shareReport();
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
