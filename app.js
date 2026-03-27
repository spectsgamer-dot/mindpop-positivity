const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwtD3CzKvIpJvgjnpL4C3mJnOjgekySWh8t0Cq1na2QG_jb6MXpWNxkPHCGmy5BhDot3Q/exec";

// ---------------- SESSION ----------------

let sessionState = JSON.parse(localStorage.getItem("mindpop_session")) || {
  anonId: "",
  demographics: {},
  completedTests: [],

  results: {
    Personality: null,
    Emotional_Intelligence: null,
    Happiness: null,
    Stress: null,
    Motivation: null
  }
};
const savedSession = localStorage.getItem("mindpop_session");

if (savedSession) {
    sessionState = JSON.parse(savedSession);
}

// ---------------- SCALE DEFINITIONS ----------------

const scales = {
  Personality: {
    items: 10,
    likert: 5,
    reverse: [1,3,4,5,7],
    labels: [
      "Strongly Disagree",
      "Disagree",
      "Neutral",
      "Agree",
      "Strongly Agree"
    ],
    questions: [
      "I see myself as someone who is reserved.",
      "I see myself as someone who is generally trusting.",
      "I see myself as someone who tends to be lazy.",
      "I see myself as someone who is relaxed, handles stress well.",
      "I see myself as someone who has few artistic interests.",
      "I see myself as someone who is outgoing, sociable.",
      "I see myself as someone who tends to find fault with others.",
      "I see myself as someone who does a thorough job.",
      "I see myself as someone who gets nervous easily.",
      "I see myself as someone who has an active imagination."
    ]
  },
  Emotional_Intelligence: {
  items: 10,
  likert: 5,
  reverse: [],
  labels: [
    "Strongly Disagree",
    "Disagree",
    "Neutral",
    "Agree",
    "Strongly Agree"
  ],
  questions: [
    "I understand my emotions clearly.",
    "I can regulate my emotions effectively.",
    "I stay calm under pressure.",
    "I understand how others feel.",
    "I can respond appropriately to others' emotions.",
    "I am aware of how my emotions influence my behavior.",
    "I handle emotional situations well.",
    "I am sensitive to the feelings of others.",
    "I can control impulsive emotional reactions.",
    "I express my emotions appropriately."
  ]
},
  Happiness: {
  items: 4,
  likert: 7,
  reverse: [4],
  labels: [
    "Strongly Disagree",
    "Disagree",
    "Slightly Disagree",
    "Neutral",
    "Slightly Agree",
    "Agree",
    "Strongly Agree"
  ],
  questions: [
    "In general, I consider myself a happy person.",
    "Compared to most of my peers, I consider myself happy.",
    "Some people are generally very happy. They enjoy life regardless of what is going on. To what extent does this describe you?",
    "Some people are generally not very happy. Although they are not depressed, they never seem as happy as they might be. To what extent does this describe you?"
  ]
},
  Stress: {
  items: 4,
  likert: 5,
  reverse: [2, 3],
  labels: [
    "Never",
    "Almost Never",
    "Sometimes",
    "Fairly Often",
    "Very Often"
  ],
  questions: [
    "In the last month, how often have you felt that you were unable to control the important things in your life?",
    "In the last month, how often have you felt confident about your ability to handle your personal problems?",
    "In the last month, how often have you felt that things were going your way?",
    "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
  ]
},
  Motivation: {
  items: 12,
  likert: 7,
  reverse: [],
  labels: [
    "Strongly Disagree",
    "Disagree",
    "Slightly Disagree",
    "Neutral",
    "Slightly Agree",
    "Agree",
    "Strongly Agree"
  ],
  questions: [
    "Because I enjoy this work.",
    "Because I believe this work is personally important.",
    "Because I would feel guilty if I didn’t do it.",
    "Because I am rewarded for doing this work.",
    "I don’t know why I’m doing this work.",
    "Because I find this work interesting.",
    "Because I get pleasure from doing this work.",
    "Because I would feel ashamed if I didn’t do it.",
    "Because others expect me to do it.",
    "I don’t really know why I’m doing this.",
    "Because I value this work.",
    "I feel I am wasting my time doing this."
  ]
}
};
  
// ---------------- UTILITY ----------------

function generateAnonId() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${timestamp}-${random}`;
}

// ================== UTILITY FUNCTIONS ==================

function createNarrativeSection(title, icon, content) {
  return `
    <div class="summary-card">
      <h3 class="summary-title">${icon} ${title}</h3>
      <p class="summary-text">${content}</p>
    </div>
  `;
}

function createTestButton(testName, label, isCompleted = false) {
  const completedClass = isCompleted ? 'completed' : '';
  const completedIcon = isCompleted ? '✓ ' : '';
  return `
    <button onclick="startTest('${testName}')" class="test-button ${completedClass}">
      ${completedIcon}${label}
    </button>
  `;
}

function formatProfileHeader(title, subtitle = '') {
  return `
    <div style="text-align: center; margin-bottom: 30px;">
      <h2>${title}</h2>
      ${subtitle ? `<p style="color: #666; font-style: italic;">${subtitle}</p>` : ''}
    </div>
  `;
}

function createBackButton(label = "Back to Dashboard") {
  return `<button onclick="renderDashboard()">${label}</button>`;
}

// ================== CORE FUNCTIONS ==================

function render(content) {
  document.getElementById("app").innerHTML = `
    <div class="card">${content}</div>
  `;
  // Auto-scroll to top after content change with slight delay
  setTimeout(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, 100);
}
function persistSession() {
  localStorage.setItem("mindpop_session", JSON.stringify(sessionState));
}
// ---------------- CONSENT ----------------

function renderConsent() {
  const header = formatProfileHeader(
    "Welcome to MindPop", 
    "Before We Begin"
  );
  
  const content = `
    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
        This check-in is designed to help you reflect on your wellbeing and patterns in a simple, supportive way.
      </p>
      
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 25px;">
        Your participation is voluntary. Your responses are kept confidential and used only for institutional wellbeing support.
      </p>
      
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 35px;">
        This is not a diagnosis, and it does not replace professional care.
      </p>
      
      <p style="font-size: 1.1rem; line-height: 1.6; margin-bottom: 35px;">
        Please share your name and consent to continue.
      </p>

      <div style="text-align: center; margin-top: 30px;">
        <button onclick="acceptConsent()" class="test-button" style="margin-right: 10px;">I Agree</button>
        <button onclick="refuseConsent()" class="secondary">I Don't Agree</button>
      </div>
    </div>
  `;
  
  render(header + content);
}

function acceptConsent() {
  sessionState.anonId = generateAnonId();
  persistSession();
  renderDemographics();
}
function refuseConsent() {
  const header = formatProfileHeader("🌸 Take Your Time", "Your Journey Begins When You're Ready");
  
  const content = `
    <div style="max-width: 500px; margin: 0 auto; text-align: center;">
      ${createNarrativeSection(
        "Understanding Your Pace", 
        "", 
        `We understand that starting a journey of self-discovery is a personal choice, and timing matters. There's no rush — your wellbeing journey unfolds at its own perfect rhythm.`
      )}
      
      ${createNarrativeSection(
        "Always Here for You", 
        "", 
        `When you feel ready, this assessment will be here to support your exploration of wellbeing and growth. Consider this an open invitation, not an obligation.`
      )}
      
      <p style="font-style: italic; color: #666; margin-top: 20px;">
        "The journey of a thousand miles begins with a single step." 
        Your step comes when you choose to take it.
      </p>

      <div style="margin-top: 30px; display: flex; justify-content: center; gap: 15px;">
        <button onclick="renderConsent()" class="secondary">Reconsider</button>
        <button onclick="acceptConsent()" class="test-button">I'm Ready</button>
      </div>
    </div>
  `;
  
  render(header + content);
}

// ---------------- DEMOGRAPHICS ----------------

function renderDemographics() {
render(`

<h2>Basic Details</h2>

<div class="form-grid">

  <div class="form-group">
    <label>Name (Optional)</label>
    <input type="text" id="name">
  </div>
<div class="form-group">
  <label>Phone Number (Required)</label>
  <input type="tel" id="phone" placeholder="Enter 10-digit number">
</div>

  <div class="form-group">
    <label>Gender</label>
    <select id="gender">
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
  </div>

  <div class="form-group">
    <label>Department</label>
    <select id="department">
      <option value="">Select</option>
      <option value="Humanities & Social Sciences">Humanities & Social Sciences</option>
      <option value="Sciences">Sciences</option>
      <option value="Paramedical Sciences">Paramedical Sciences</option>
       <option value="Pharmaceutical Sciences">Pharmaceutical Sciences</option>
      <option value="Engineering">Engineering</option>
      <option value="Computer Technology">Computer Technology</option>
      <option value="Nursing">Nursing</option>
      <option value="Physiotherapy & Rehabilitation">Physiotherapy & Rehabilitation</option>
      <option value="Commerce & Management">Commerce & Management</option>
      <option value="Agriculture Sciences & Technology">Agriculture Sciences & Technology</option>
      <option value="Non Teaching Staff">Non-Teaching Staff</option>
    </select>
  </div>

  <div class="form-group">
    <label>Pursuing</label>
    <select id="pursuing" onchange="handlePursuingChange()">
      <option value="">Select</option>
      <option value="Undergraduate">Undergraduate</option>
      <option value="Postgraduate">Postgraduate</option>
      <option value="Faculty">Faculty</option>
    </select>
  </div>

  <div class="form-group" id="yearContainer">
    <label>Year</label>
    <select id="year">
      <option value="">Select</option>
      <option>1st Year</option>
      <option>2nd Year</option>
      <option>3rd Year</option>
      <option>4th Year</option>
    </select>
  </div>

  <div class="form-group" id="facultyExperienceContainer" style="display:none;">
    <label>Experience as Faculty</label>
    <select id="facultyExperience">
      <option value="">Select</option>
      <option>0–2 Years</option>
      <option>3–5 Years</option>
      <option>6–10 Years</option>
      <option>10+ Years</option>
    </select>
  </div>

</div>

<div class="form-actions">
  <button onclick="saveDemographics()">Continue</button>
</div>

`);
}

function saveDemographics() {

  const gender = document.getElementById("gender").value;
  const department = document.getElementById("department").value;
  const pursuing = document.getElementById("pursuing").value;
  const year = document.getElementById("year").value;
  const phone = document.getElementById("phone").value.trim();

// Indian 10-digit validation
const phoneRegex = /^[6-9]\d{9}$/;

if (!phoneRegex.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return;
}

  if (!gender || !department || !pursuing) {
    alert("Please complete all required fields.");
    return;
}

if (pursuing !== "Faculty" && !year) {
    alert("Please select Year.");
    return;
}

  sessionState.demographics = {
  name: document.getElementById("name").value,
  phone: phone,
  gender: document.getElementById("gender").value,
  department: document.getElementById("department").value,
  pursuing: document.getElementById("pursuing").value,
  facultyExperience: document.getElementById("facultyExperience")?.value || "",
  year: document.getElementById("year").value
};
  sessionState.anonId = phone + "_" + Date.now();
 persistSession();

  renderDashboard();
}

// ---------------- DASHBOARD ----------------

function renderDashboard() {
    const completed = sessionState.completedTests.length;
    const total = 5;

    function createTestItem(testName, displayName, icon) {
        const isDone = sessionState.completedTests.includes(testName);
        const action = isDone ? `showTestResult('${testName}')` : `startTest('${testName}')`;
        const buttonLabel = isDone ? 'View Results' : 'Start Test';
        
        return `
            <div class="summary-card" style="cursor: pointer; display: flex; align-items: center; padding: 20px; gap: 20px; flex-wrap: wrap;" onclick="${action}">
                <div style="font-size: 2.5rem; flex-shrink: 0; min-width: 60px; text-align: center;">${icon}</div>
                <div style="flex: 1; min-width: 0;">
                    <h4 style="margin: 0 0 5px 0; color: ${isDone ? '#28a745' : '#333'}; font-size: 1.1rem;">
                        ${displayName} ${isDone ? '✓' : ''}
                    </h4>
                    <p style="margin: 0; color: #666; font-size: 0.9rem;">
                        ${isDone ? 'Completed - Click to view results' : 'Not started - Click to begin'}
                    </p>
                </div>
                <button class="${isDone ? 'secondary' : 'test-button'}" style="flex-shrink: 0; min-width: 120px;">
                    ${buttonLabel}
                </button>
            </div>
        `;
    }

    const header = formatProfileHeader(
        "MindPop Assessment", 
        "Choose an assessment to begin"
    );

    const content = `
        <div style="display: flex; flex-direction: column; gap: 15px; margin: 30px 0;">
            ${createTestItem("Personality", "Personality Profile", "🎭")}
            ${createTestItem("Emotional_Intelligence", "Emotional Intelligence", "💝")}
            ${createTestItem("Happiness", "Happiness Scale", "😊")}
            ${createTestItem("Stress", "Stress Assessment", "🌊")}
            ${createTestItem("Motivation", "Motivation Profile", "🔥")}
        </div>

        ${completed === total ? `
            <div style="text-align: center; margin-top: 40px; padding: 25px; background: #f8f9fa; border-radius: 10px;">
                <h4 style="color: #28a745; margin-bottom: 15px;">🎉 All Complete!</h4>
                <p style="margin: 0;">You've completed all assessments.</p>
                <button onclick="restartAssessment()" style="margin-top: 20px;" class="secondary">
                    Start New Assessment
                </button>
            </div>
        ` : ''}
    `;

    render(header + content);
}

// ---------------- TEST ENGINE ----------------

function startTest(testName) {

  const scale = scales[testName];

  let questionsHTML = "";

  scale.questions.forEach((q, index) => {

    let options = "";

    for (let i = 1; i <= scale.likert; i++) {
      options += `
    <div class="option-row">
        <input type="radio"
               id="q${index}_${i}"
               name="q${index}"
               value="${i}"
               onclick="updateProgress(${scale.items})">
        <label for="q${index}_${i}">
            ${scale.labels[i - 1]}
        </label>
    </div>
`;
  }

    questionsHTML += `
      <div class="question-block">
        <p><strong>${index + 1}. ${q}</strong></p>
        ${options}
      </div>
    `;
  });

  render(`
    <h2>${testName}</h2>

    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>

    <form id="testForm">
      ${questionsHTML}
      <button type="button" onclick="submitTest('${testName}')">
        Submit
      </button>
    </form>
  `);
}

function updateProgress(total) {
  const checked = document.querySelectorAll("input[type=radio]:checked");
  const answered = new Set();
  checked.forEach(r => answered.add(r.name));
  const percent = (answered.size / total) * 100;
  document.getElementById("progressFill").style.width = percent + "%";
}

// ---------------- SCORING ----------------

function submitTest(testName) {

    const scale = scales[testName];
    const form = document.getElementById("testForm");
    const data = new FormData(form);

    let responses = [];
    let missing = false;

    // Collect responses
    for (let i = 0; i < scale.items; i++) {
        const val = data.get("q" + i);
        if (!val) missing = true;
        responses.push(Number(val));
    }

    if (missing) {
        alert("Please answer all questions.");
        return;
    }

    // Reverse scoring
    scale.reverse.forEach(index => {
        const idx = index - 1;
        responses[idx] = (scale.likert + 1) - responses[idx];
    });

    // ======================
    // PERSONALITY SCORING
    // ======================
    if (testName === "Personality") {

        const traits = {
            Extraversion: responses[0] + responses[5],
            Agreeableness: responses[1] + responses[6],
            Conscientiousness: responses[2] + responses[7],
            Neuroticism: responses[3] + responses[8],
            Openness: responses[4] + responses[9]
        };

        if (!sessionState.completedTests.includes("Personality")) {
            sessionState.completedTests.push("Personality");
        }

       sessionState.results.Personality = {
  raw: responses,
  Extraversion: traits.Extraversion,
  Agreeableness: traits.Agreeableness,
  Conscientiousness: traits.Conscientiousness,
  Neuroticism: traits.Neuroticism,
  Openness: traits.Openness
};
      if (!sessionState.completedTests.includes(testName)) {
    sessionState.completedTests.push(testName);
}
      persistSession();
      sendToBackend();

        renderPersonalityResult(traits);
        return;
    }

    // ======================
    // EMOTIONAL INTELLIGENCE
    // ======================
    if (testName === "Emotional_Intelligence") {

        const totalEI = responses.reduce((a, b) => a + b, 0);

        if (!sessionState.completedTests.includes("Emotional_Intelligence")) {
            sessionState.completedTests.push("Emotional_Intelligence");
        }

       sessionState.results.Emotional_Intelligence = {
   raw: responses,
   total: totalEI
};

       const insight = getShortInsight(
    "Emotional_Intelligence",
    sessionState.results.Emotional_Intelligence
);
   let level = "";

if (totalEI <= 25) level = "Lower Range";
else if (totalEI <= 38) level = "Moderate Range";
else level = "Higher Range";

const interpretation = generateEINarrative(totalEI);

      if (!sessionState.completedTests.includes(testName)) {
    sessionState.completedTests.push(testName);
}
      persistSession();
      sendToBackend();

render(`
<h2>Emotional Intelligence Profile</h2>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
`);
    }

  // ============================
  // Happiness
  // ============================
  if (testName === "Happiness") {

    const totalHappiness = responses.reduce((a, b) => a + b, 0);

    if (!sessionState.completedTests.includes("Happiness")) {
        sessionState.completedTests.push("Happiness");
    }

   sessionState.results.Happiness = {
   raw: responses,
   total: totalHappiness

  };
    const insight = getShortInsight("Happiness", sessionState.results.Happiness);

let level = "";

if (totalHappiness <= 12) level = "Lower Range";
else if (totalHappiness <= 20) level = "Moderate Range";
else level = "Higher Range";

const interpretation = generateHappinessNarrative(totalHappiness);
    if (!sessionState.completedTests.includes(testName)) {
    sessionState.completedTests.push(testName);
}
    persistSession();
    sendToBackend();

render(`
<h2>Subjective Happiness Profile</h2>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
`);
    return;
}
  // =======================
  // Perceive Stress Scale
  // ======================
  if (testName === "Stress") {

    const totalStress = responses.reduce((a, b) => a + (b - 1), 0);

    if (!sessionState.completedTests.includes("Stress")) {
        sessionState.completedTests.push("Stress");
    }

   sessionState.results.Stress = {
   raw: responses,
   total: totalStress

    };
  const insight = getShortInsight("Stress", sessionState.results.Stress);

let level = "";

if (totalStress <= 4) level = "Low Stress";
else if (totalStress <= 9) level = "Moderate Stress";
else level = "Elevated Stress";

const interpretation = generateStressNarrative(totalStress);
    if (!sessionState.completedTests.includes(testName)) {
    sessionState.completedTests.push(testName);
}
    persistSession();
    sendToBackend();

render(`
<h2>Perceived Stress Profile</h2>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
`);


    return;
}
  // =======================
  // Motivation Scale
  // =======================
  if (testName === "Motivation") {

    // SWEIMS 12 items
    // Assume responses array length = 12
    // 1–5 Likert scale

    const intrinsic = responses[0] + responses[5] + responses[6];
    const identified = responses[1] + responses[10];
    const introjected = responses[2] + responses[7];
    const external = responses[3] + responses[8];
    const amotivation = responses[4] + responses[9] + responses[11];

    // 🔹 Store results
    if (!sessionState.completedTests.includes("Motivation")) {
        sessionState.completedTests.push("Motivation");
    }

    sessionState.results.Motivation = {
    raw: responses,
    intrinsic,
    identified,
    introjected,
    external,
    amotivation
};

    // 🔹 Level Classification
    function classifyMotivation(score) {
        if (score <= 8) return "Low";
        if (score <= 14) return "Moderate";
        return "High";
    }

    const intrinsicLevel = classifyMotivation(intrinsic);
    const amotivationLevel = classifyMotivation(amotivation);

    // 🔹 Clinical Narrative
   const narrative = generateMotivationNarrative(
    sessionState.results.Motivation
);
    if (!sessionState.completedTests.includes(testName)) {
    sessionState.completedTests.push(testName);
}
    persistSession();
    sendToBackend();

   render(`
  <h2>Motivation Profile</h2>

  <h3>Intrinsic Motivation</h3>
  <p>${interpretIntrinsic(intrinsic)}</p>

  <h3>Amotivation</h3>
  <p>${interpretAmotivation(amotivation)}</p>

  <br>
  <p>${narrative}</p>

  <br><br>
  <button onclick="renderDashboard()">Do Another Test</button>
`);

    return;
}
}

function showTestResult(testName) {

    const r = sessionState.results;

    if (testName === "Personality" && r.Personality) {
        renderPersonalityResult(r.Personality);
        return;
    }

    if (testName === "Emotional_Intelligence" && r.Emotional_Intelligence) {

        const totalEI = r.Emotional_Intelligence.total;
        const interpretation = generateEINarrative(totalEI);

        render(`
        <h2>Emotional Intelligence Profile</h2>
        <p>${interpretation}</p>
        <br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
        `);
        return;
    }

    if (testName === "Happiness" && r.Happiness) {

        const total = r.Happiness.total;
        const interpretation = generateHappinessNarrative(total);

        render(`
        <h2>Happiness Profile</h2>
        <p>${interpretation}</p>
        <br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
        `);
        return;
    }

    if (testName === "Stress" && r.Stress) {

        const total = r.Stress.total;
        const interpretation = generateStressNarrative(total);

        render(`
        <h2>Stress Profile</h2>
        <p>${interpretation}</p>
        <br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
        `);
        return;
    }

    if (testName === "Motivation" && r.Motivation) {

    const intrinsic = r.Motivation.intrinsic;
    const amotivation = r.Motivation.amotivation;

    const narrative = generateMotivationNarrative(r.Motivation);

    render(`
        <h2>Motivation Profile</h2>

        <h3>Intrinsic Motivation</h3>
        <p>${interpretIntrinsic(intrinsic)}</p>

        <h3>Amotivation</h3>
        <p>${interpretAmotivation(amotivation)}</p>

        <br>
        <p>${narrative}</p>

        <br><br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
    `);

    return;
}
}

function interpretTrait(score) {
  if (score <= 4) return "Low";
  if (score <= 7) return "Moderate";
  return "High";
}

function getShortInsight(testName, data) {

    if (testName === "Happiness") {
        if (data.total <= 14) {
            return "Your responses suggest lower daily positive emotional experience. Small environmental or social shifts may meaningfully improve wellbeing.";
        }
        return "Your responses suggest generally stable positive wellbeing patterns.";
    }

    if (testName === "Stress") {
        if (data.total >= 12) {
            return "Your responses indicate elevated perceived stress. Monitoring workload and recovery routines may be helpful.";
        }
        return "Your responses suggest manageable perceived stress levels.";
    }

    if (testName === "Emotional_Intelligence") {
        if (data.total <= 25) {
            return "Emotional awareness skills may benefit from intentional development. These capacities are learnable and improvable.";
        }
        return "Your responses suggest adaptive emotional processing skills.";
    }

   if (testName === "Motivation") {

    const { intrinsic, identified, introjected, external, amotivation } = data;

    if (amotivation >= intrinsic && amotivation >= identified) {
        return "Current motivation appears reduced or unclear. Reconnecting with meaningful goals may help.";
    }

    if (intrinsic >= identified && intrinsic >= external) {
        return "Your motivation is largely interest-driven and internally sustained.";
    }

    if (identified >= intrinsic) {
        return "You are motivated by personal goals and values.";
    }

    if (external >= intrinsic) {
        return "External structure and expectations play an important role in your motivation.";
    }

    return "Your motivation appears mixed and context-dependent.";
}

    return "";
}

function renderPersonalityResult(traits) {

  let resultHTML = `<h2>Personality Profile</h2>`;

  // Filter out raw data - only show personality traits
  const personalityTraits = {
    Extraversion: traits.Extraversion,
    Agreeableness: traits.Agreeableness,
    Conscientiousness: traits.Conscientiousness,
    Neuroticism: traits.Neuroticism,
    Openness: traits.Openness
  };

  for (let trait in personalityTraits) {

    const score = personalityTraits[trait];
    const level = interpretTrait(score);

    let interpretation = "";

   if (trait === "Neuroticism") {
    if (level === "High") {
        interpretation = `
        <h4>🌟 Emotional Sensitivity</h4>
        <p>You experience emotions with beautiful depth and intensity, allowing deep connections with yourself and others.</p>
        `;
    }

    else if (level === "Low") {
        interpretation = `
        <h4>🌊 Emotional Resilience</h4>
        <p>You possess wonderful emotional balance and stability, navigating life's challenges with grace and inner peace.</p>
        `;
    }

    else {
        interpretation = `
        <h4>🎭 Emotional Flexibility</h4>
        <p>You flow beautifully with life's emotional rhythms, maintaining balance between awareness and regulation.</p>
        `;
    }
}

    if (trait === "Extraversion") {
    if (level === "High") {
        interpretation = `
        <h4>☀️ Social Energy</h4>
        <p>You radiate beautiful social energy, lighting up rooms and creating natural connections with others.</p>
        `;
    }

    else if (level === "Low") {
        interpretation = `
        <h4>🌙 Inner Wisdom</h4>
        <p>You possess beautiful depth from honoring your inner world, reflecting profound insights and wisdom.</p>
        `;
    }

    else {
        interpretation = `
        <h4>⚖️ Social Balance</h4>
        <p>You've mastered the art of social balance, knowing when to engage and when to reflect.</p>
        `;
    }
}
    if (trait === "Conscientiousness") {
    if (level === "High") {
        interpretation = `
        <h4>🏆 Dedication to Excellence</h4>
        <p>You possess remarkable responsibility and commitment to excellence, taking pride in doing things well.</p>
        `;
    }

    else if (level === "Low") {
        interpretation = `
        <h4>🎨 Creative Flexibility</h4>
        <p>You dance to your own rhythm, thriving in unexpected situations with creative problem-solving skills.</p>
        `;
    }

    else {
        interpretation = `
        <h4>⚖️ Balanced Approach</h4>
        <p>You've found the sweet spot between structure and spontaneity, creating harmony in responsibilities.</p>
        `;
    }
}

    if (trait === "Agreeableness") {
    if (level === "High") {
        interpretation = `
        <h4>💝 Heart of Compassion</h4>
        <p>You radiate kindness and empathy, creating deep, meaningful connections and harmony in relationships.</p>
        `;
    }

    else if (level === "Low") {
        interpretation = `
        <h4>🗡️ Commitment to Truth</h4>
        <p>You possess courageous commitment to authenticity and principle, guiding others toward honesty.</p>
        `;
    }

    else {
        interpretation = `
        <h4>🤝 Balanced Compassion</h4>
        <p>You've mastered compassionate strength, balancing understanding with principled boundaries.</p>
        `;
    }
}

    if (trait === "Openness") {
    if (level === "High") {
        interpretation = `
        <h4>🌈 Creative Spirit</h4>
        <p>Your mind is a universe of possibilities, seeing the world through wonder and curiosity.</p>
        `;
    }

    else if (level === "Low") {
        interpretation = `
        <h4>🏔️ Grounded Wisdom</h4>
        <p>You possess practical wisdom and stability, providing a foundation of reliability and clarity.</p>
        `;
    }

    else {
        interpretation = `
        <h4>🌟 Balanced Curiosity</h4>
        <p>You've found perfect balance between exploration and stability, nurturing growth while staying grounded.</p>
        `;
    }
}

    resultHTML += `
        <div class="summary-card">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <h3 class="summary-title" style="margin: 0;">${trait}</h3>
                <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 24px; border-radius: 25px; font-weight: 600; font-size: 1rem; letter-spacing: 0.5px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);">
                    ${level}
                </div>
            </div>
            <p class="summary-text" style="margin-top: 0;">
                ${interpretation}
            </p>
        </div>
    `;
}
  const personalityNarrative = generatePersonalityNarrative(traits);

resultHTML += `
<br>
<h3>Profile Interpretation</h3>
<p>${personalityNarrative}</p>
`;

resultHTML += `
  <br><br>
  <button onclick="renderDashboard()">Do Another Test</button>
`;

  render(resultHTML);
}

function resetAssessment() {
    sessionState.completedTests = [];
    sessionState.results = {
        Personality: null,
        Emotional_Intelligence: null,
        Happiness: null,
        Stress: null,
        Motivation: null
    };
    renderDashboard();
}

function handlePursuingChange() {
  const pursuing = document.getElementById("pursuing").value;

  const yearContainer = document.getElementById("yearContainer");
  const facultyContainer = document.getElementById("facultyExperienceContainer");

  if (pursuing === "Faculty") {
    yearContainer.style.display = "none";
    facultyContainer.style.display = "block";
  } else {
    yearContainer.style.display = "block";
    facultyContainer.style.display = "none";
  }
}

function generatePersonalityNarrative(traits) {

    const E = traits.Extraversion;
    const A = traits.Agreeableness;
    const C = traits.Conscientiousness;
    const N = traits.Neuroticism;
    const O = traits.Openness;

    let message = "";

    // 🌟 Extraversion
    if (E >= 8) {
        message += "You likely feel energized when interacting with others and may enjoy being part of active, engaging environments. ";
    } else if (E <= 4) {
        message += "You may prefer quieter settings and meaningful one-to-one conversations rather than large social gatherings. ";
    } else {
        message += "You seem comfortable balancing social interaction with personal space. ";
    }

    // 🌟 Agreeableness
    if (A >= 8) {
        message += "You probably value harmony and try to be understanding toward others. ";
    } else if (A <= 4) {
        message += "You may prioritize honesty and independence, even if that means disagreeing when needed. ";
    } else {
        message += "You seem able to balance empathy with standing your ground. ";
    }

    // 🌟 Conscientiousness
    if (C >= 8) {
        message += "You appear organized and responsible, likely taking your commitments seriously. ";
    } else if (C <= 4) {
        message += "You might prefer flexibility over strict structure and may work best when given freedom rather than rigid rules. ";
    } else {
        message += "You likely manage responsibilities reasonably well while staying adaptable. ";
    }

    // 🌟 Neuroticism (softened wording)
    if (N >= 8) {
        message += "You may feel emotions quite deeply at times, especially under pressure. This sensitivity can feel intense, but it can also make you perceptive and emotionally aware. ";
    } else if (N <= 4) {
        message += "You generally seem steady and calm, even when things get stressful. ";
    } else {
        message += "You probably experience emotions in a fairly balanced and typical way. ";
    }

    // 🌟 Openness
    if (O >= 8) {
        message += "You seem curious and open to exploring new ideas, perspectives, and experiences. ";
    } else if (O <= 4) {
        message += "You may prefer practical approaches and familiar routines over constant change. ";
    } else {
        message += "You likely appreciate both new experiences and stable routines. ";
    }

    message += "Remember, personality describes tendencies — not limits. You can adapt and grow in any direction you choose.";

    return message;
}
function generateEINarrative(totalEI) {

    let message = "";

    if (totalEI <= 25) {

        message = `
        <h4>🌱 Growing Your Emotional Garden</h4>
        <p>You're on a beautiful journey of emotional discovery, and like any garden, emotional awareness takes time to cultivate. Be patient and kind with yourself as you learn to navigate the rich landscape of your feelings.</p>
        
        <p>Right now, emotions might sometimes feel like a complex puzzle, especially when stress clouds the picture. This isn't a struggle—it's an opportunity to develop incredible skills that will serve you throughout life.</p>
        
        <p><strong>Gentle practices:</strong> Try pausing to name what you're feeling, even if it's just "uncomfortable" or "confused." Each moment of awareness is like planting a seed of emotional wisdom.</p>
        
        <p>Remember: emotional intelligence isn't fixed—it's a skill you're building, one experience at a time. You're exactly where you need to be on this journey.</p>
        `;

    } else if (totalEI <= 38) {

        message = `
        <h4>🌿 Your Emerging Emotional Wisdom</h4>
        <p>You're developing a beautiful relationship with your emotions! Like a skilled gardener, you're learning to work with your feelings rather than against them, creating a balanced emotional ecosystem.</p>
        
        <p>Most days, you likely navigate your emotional world with growing confidence. You're building the skills to understand what you feel and respond thoughtfully, even when emotions run high.</p>
        
        <p><strong>Your strength:</strong> You're finding that sweet spot between feeling deeply and responding wisely. This balance is rare and precious, and it's serving you well in relationships and challenges.</p>
        
        <p>Continue nurturing this awareness—each emotional conversation you have with yourself deepens your wisdom and strengthens your emotional resilience.</p>
        `;

    } else {

        message = `
        <h4>🌳 Your Emotional Mastery</h4>
        <p>You possess remarkable emotional wisdom! Like an ancient tree with deep roots, you've developed a strong foundation of emotional awareness that weathers life's storms with grace.</p>
        
        <p>Your ability to understand, honor, and work with your emotions is a true gift. You don't just manage feelings—you collaborate with them, using their energy and information to make wise decisions and build meaningful connections.</p>
        
        <p><strong>Your superpower:</strong> You can sit with discomfort without being consumed by it, and you can transform challenging emotions into opportunities for growth. This emotional alchemy serves you in all aspects of life.</p>
        
        <p>Continue sharing this gift with others—your emotional wisdom creates ripples of healing and understanding in the world around you.</p>
        `;
    }

    return message;
}
function generateHappinessNarrative(totalHappiness) {

    let message = "";

    if (totalHappiness <= 12) {

        message = `
        <h4>🌤️ Finding Your Light</h4>
        <p>Right now, life might feel a bit gray, and that's okay. Even the brightest skies have cloudy days, and your feelings are valid and normal. You're not broken—you're human.</p>
        
        <p>This period of lower happiness isn't a permanent state; it's a season. Like winter, it serves a purpose—perhaps it's calling you to rest, reflect, or rediscover what truly matters to you.</p>
        
        <p><strong>Gentle invitations:</strong> Small moments of joy can be powerful—a warm cup of tea, a walk in nature, a conversation with a friend, or simply allowing yourself to rest without guilt.</p>
        
        <p>Be patient with yourself. Happiness isn't a destination you've failed to reach—it's a natural rhythm that ebbs and flows. You're exactly where you need to be.</p>
        `;

    } else if (totalHappiness <= 20) {

        message = `
        <h4>⛅️ Your Balanced Sunshine</h4>
        <p>You've found a beautiful balance in life! Like a sky with both sun and clouds, your happiness has a natural rhythm that includes both bright moments and gentle shadows.</p>
        
        <p>This balance is actually a sign of emotional health—you can feel joy while also acknowledging life's challenges. You're not chasing constant happiness, but rather embracing life's full spectrum.</p>
        
        <p><strong>Your wisdom:</strong> You understand that happiness isn't about eliminating difficult feelings, but about building resilience to navigate all experiences with grace.</p>
        
        <p>Continue nurturing what brings you genuine joy and meaning. Your balanced approach to wellbeing creates sustainable happiness that weathers life's changes.</p>
        `;

    } else {

        message = `
        <h4>☀️ Your Radiant Joy</h4>
        <p>You radiate a beautiful sense of joy and contentment! Like sunshine, your happiness warms everything around you and creates positive energy that others can feel.</p>
        
        <p>This isn't just about feeling good—it's about deep satisfaction and meaning. You've likely cultivated relationships, activities, and perspectives that nourish your soul and align with your values.</p>
        
        <p><strong>Your gift:</strong> Your happiness creates ripples of positivity in your relationships and communities. Your joy is contagious and inspiring, making the world a little brighter simply by being in it.</p>
        
        <p>Continue sharing your light while also honoring all your feelings. True happiness includes space for the full range of human emotion, and your wisdom shows in this balance.</p>
        `;
    }

    return message;
}

function generateStressNarrative(totalStress) {

    let message = "";

    if (totalStress <= 4) {

        message = `
        <h4>🌊 Your Calm Waters</h4>
        <p>You're navigating life's waters with beautiful grace! Like a peaceful lake, you've found ways to stay centered even when life creates ripples around you.</p>
        
        <p>This doesn't mean life is perfect—it means you've developed wonderful coping strategies that serve you well. You understand that stress is natural, but you don't let it overwhelm your inner peace.</p>
        
        <p><strong>Your wisdom:</strong> You know that prevention is better than cure. By maintaining routines that recharge you—rest, meaningful connections, and moments of joy—you keep your stress levels manageable.</p>
        
        <p>Continue honoring these practices; they're the foundation of your resilience and wellbeing.</p>
        `;

    } else if (totalStress <= 9) {

        message = `
        <h4>⛵️ Navigating Moderate Waves</h4>
        <p>You're experiencing the normal ebb and flow of life's challenges. Like a skilled sailor, you're learning to navigate moderate waves while keeping your ship steady.</p>
        
        <p>This level of stress is actually a sign that you're engaging with life—taking on challenges, pursuing goals, and growing. Sometimes the waters get a bit choppy, but you're managing to stay on course.</p>
        
        <p><strong>Your opportunity:</strong> This is a perfect time to strengthen your stress-management toolkit. Small habits—brief pauses, deep breaths, or structured planning—can make these waves feel more manageable.</p>
        
        <p>Remember: stress isn't your enemy; it's a signal. Learning to listen to these signals helps you navigate life's beautiful journey with wisdom.</p>
        `;

    } else {

        message = `
        <h4>🌪️ Weathering the Storm</h4>
        <p>Right now, life might feel like you're in the middle of a storm, and that's okay. Even the strongest ships face rough seas, and your feelings are completely valid.</p>
        
        <p>This period of high stress isn't a sign of weakness—it's a sign that you've been carrying so much for so long. Your system is asking for the care and attention you so readily give to others.</p>
        
        <p><strong>Gentle reminder:</strong> You don't have to weather this storm alone. Reaching out for support, setting boundaries, or simply allowing yourself to rest isn't giving up—it's gathering strength.</p>
        
        <p>This storm will pass. In the meantime, be incredibly kind to yourself. You're doing the best you can with incredibly challenging circumstances.</p>
        `;
    }

    return message;
}
function generateMotivationNarrative(data) {

    const { intrinsic, identified, introjected, external, amotivation } = data;

    let message = "";

    // 🔻 Amotivation dominant
    if (amotivation >= intrinsic && amotivation >= identified) {

        message = `
        <h4>🌫️ Finding Your Way</h4>
        <p>You're moving through a fog of disconnection, but this pause invites reflection and rediscovery of purpose.</p>
        `;
    }

    // 🔻 Intrinsic dominant
    else if (intrinsic >= identified && intrinsic >= external) {

        message = `
        <h4>🔥 Inner Fire</h4>
        <p>You're blessed with internal motivation, driven by genuine interest and joy in what you do.</p>
        `;
    }

    // 🔻 Identified dominant
    else if (identified >= intrinsic) {

        message = `
        <h4>🎯 Purpose-Driven Path</h4>
        <p>You walk a beautiful path of purpose, seeing how tasks connect to your bigger picture and values.</p>
        `;
    }

    // 🔻 External dominant
    else if (external >= intrinsic) {

        message = `
        <h4>⚡ Responsive Energy</h4>
        <p>You respond wonderfully to external cues, performing best with clear direction and structure.</p>
        `;
    }

    // 🔻 Mixed patterns
    else {

        message = `
        <h4>🌈 Motivational Symphony</h4>
        <p>You draw from multiple motivation sources, adapting beautifully to different situations and needs.</p>
        `;
    }

    return message;
}
function interpretIntrinsic(score) {

  if (score >= 8) {
    return `
    <h4>🔥 Your Inner Flame</h4>
    <p>You're driven by a beautiful inner flame! When something captures your interest and feels meaningful, effort flows naturally and joyfully.</p>
    
    <p>This intrinsic motivation is your superpower—it creates sustainable energy and deep satisfaction in everything you pursue.</p>
    
    <p>Continue following what lights you up; your inner wisdom guides you toward meaningful growth and fulfillment.</p>
    `;
  }

  if (score >= 14) {
    return `
    <h4>⚡ Your Spark of Interest</h4>
    <p>You have a lovely spark of intrinsic motivation! When you find something interesting, you naturally want to engage and explore.</p>
    
    <p>This interest-driven energy serves you well, creating moments of genuine engagement and learning.</p>
    
    <p>Continue nurturing your curiosity and allowing yourself to follow what fascinates you.</p>
    `;
  }

  return `
  <h4>🌱 Growing Your Inner Garden</h4>
  <p>Your intrinsic motivation is like a garden waiting to bloom. Sometimes the seeds of interest are there, but they need the right conditions to grow.</p>
  
  <p>This is a beautiful opportunity to explore what might spark your curiosity and passion. Small experiments with new activities or deeper reflection on your values can help your inner garden flourish.</p>
  
  <p>Be patient with yourself—motivation grows through exploration and discovery.</p>
  `;
}
function interpretAmotivation(score) {

  if (score >= 8) {
    return `
    <h4>🌫️ Navigating the Fog</h4>
    <p>Right now, you might be moving through a fog of disconnection, and that's completely okay. Even the most motivated people sometimes lose their sense of direction.</p>
    
    <p>This isn't a failure—it's an invitation to pause, reflect, and rediscover what truly matters to you.</p>
    
    <p>Be gentle with yourself. Sometimes the most powerful motivation emerges after a period of rest and renewal.</p>
    `;
  }

  if (score >= 14) {
    return `
    <h4>☁️ Light Cloud Cover</h4>
    <p>You're experiencing some light cloud cover in your motivation. The sun is still there, but sometimes clouds obscure its warmth.</p>
    
    <p>This is a normal part of life's rhythm. Your motivation isn't gone—it's just resting or waiting for the right conditions.</p>
    
    <p>Small steps and gentle self-compassion can help the clouds clear naturally.</p>
    `;
  }

  return `
  <h4>☀️ Your Inner Light</h4>
  <p>Your inner light is shining brightly! You generally feel connected to your activities and find meaning in what you do.</p>
  
  <p>This sense of purpose and engagement is a beautiful foundation that serves you well in all your endeavors.</p>
  
  <p>Continue honoring what brings you this sense of connection and flow.</p>
  `;
}
function restartAssessment() {
  localStorage.removeItem("mindpop_session");
  location.reload();
}

function sendToBackend() {

  fetch(WEB_APP_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    mode: "no-cors",
    body: JSON.stringify(sessionState)
  })
  .then(() => {
    console.log("Data sent to backend (no-cors mode)");
  })
  .catch(err => {
    console.error("Backend error:", err);
  });
}

// ---------------- START ----------------

if (sessionState.completedTests.length > 0) {
    renderDashboard();
} else {
    renderConsent();
}
