const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxAf9J8x33TAGFVjLgzKe8vgb0SseC95TnGzSq4ZI22pdB7kO0g_oVhKQpwyzta2rjY/exec";

// ---------------- SESSION ----------------
let summarySubmitted = false;

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

function render(content) {
  document.getElementById("app").innerHTML = `
    <div class="card">${content}</div>
  `;
}
function persistSession() {
  localStorage.setItem("mindpop_session", JSON.stringify(sessionState));
}
// ---------------- CONSENT ----------------

function renderConsent() {
  render(`
    <h2>😊 Welcome to MindPop</h2>
    <h4> Consent & Participation Notice</h4>

    <p>
      This assessment is designed for educational and self-reflection purposes within the university setting. Participation is voluntary and anonymous.
    </p>

    <p>
     Your responses may be used in aggregated form to support university-level psychological insights and wellbeing initiatives. Individual results are not diagnostic and do not replace professional mental health consultation.
    </p>

    <p>
      By proceeding, you confirm that you understand the purpose of this assessment and consent to participate.
    </p>

    <div style="margin-top:20px;">
      <button onclick="acceptConsent()">I Agree</button>
      <button onclick="refuseConsent()" style="background:#ccc; color:black; margin-left:10px;">
        I Do Not Agree
      </button>
    </div>
  `);
}

function acceptConsent() {
  sessionState.anonId = generateAnonId();
  persistSession();
  renderDemographics();
}
function refuseConsent() {
  render(`
    <h2>😔 Consent Required</h2>

    <p>
      Participation requires informed consent.
    </p>

    <p>
      If you wish to contribute to understanding student wellbeing,
      you may choose to provide consent.
    </p>

    <button onclick="renderConsent()">Go Back</button>
    <button onclick="acceptConsent()" style="margin-left:10px;">
      Give Consent
    </button>
  `);
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
      <option>5th Year</option>
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
  gender: document.getElementById("gender").value,
  department: document.getElementById("department").value, // ✅ ADD THIS
  pursuing: document.getElementById("pursuing").value,
  facultyExperience: document.getElementById("facultyExperience")?.value || "",
  year: document.getElementById("year").value
};
 persistSession();

  renderDashboard();
}

// ---------------- DASHBOARD ----------------

function renderDashboard() {

    const completed = sessionState.completedTests.length;

    function testButton(name) {

        const isDone = sessionState.completedTests.includes(name);

        return `
            <button 
                onclick="${isDone ? '' : `startTest('${name}')`}" 
                style="
                    margin:5px;
                    opacity:${isDone ? 0.6 : 1};
                    cursor:${isDone ? 'not-allowed' : 'pointer'};
                "
                ${isDone ? 'disabled' : ''}
            >
                ${name.replace("_", " ")} ${isDone ? "✓" : ""}
            </button>
        `;
    }

    // 🔥 THIS MUST BE OUTSIDE TEMPLATE
    let restartButton = "";
    if (completed === 5) {
        restartButton = `
            <br><br>
            <button onclick="restartAssessment()" style="background:#444;">
                Start New Assessment
            </button>
        `;
    }

    render(`
        <h2>Assessment Dashboard</h2>
        <p>Completed Tests: ${completed}/5</p>

        ${testButton("Personality")}
        ${testButton("Emotional_Intelligence")}
        ${testButton("Happiness")}
        ${testButton("Stress")}
        ${testButton("Motivation")}

        <br><br>

        ${
            completed >= 1
            ? `<button onclick="renderFinalSummary()" 
                     style="background:#444; margin-top:10px;">
                 End Assessment
               </button>`
            : ""
        }

        ${restartButton}
    `);
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

  sessionState.completedTests.push(testName);
persistSession();
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

render(`
<h2>Emotional Intelligence Profile</h2>

<p><strong>Total Score:</strong> ${totalEI} / 50</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
<button onclick="renderFinalSummary()" style="margin-left:10px; background:#444;">
Finish Assessment
</button>
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

render(`
<h2>Subjective Happiness Profile</h2>

<p><strong>Total Score:</strong> ${totalHappiness} / 28</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
<button onclick="renderFinalSummary()" style="margin-left:10px; background:#444;">
Finish Assessment
</button>
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

render(`
<h2>Perceived Stress Profile</h2>

<p><strong>Total Score:</strong> ${totalStress} / 16</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
<button onclick="renderFinalSummary()" style="margin-left:10px; background:#444;">
Finish Assessment
</button>
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

    const intrinsic = responses[0] + responses[1] + responses[2] + responses[3];
    const extrinsic = responses[4] + responses[5] + responses[6] + responses[7];
    const amotivation = responses[8] + responses[9] + responses[10] + responses[11];

    // 🔹 Store results
    if (!sessionState.completedTests.includes("Motivation")) {
        sessionState.completedTests.push("Motivation");
    }

    sessionState.results.Motivation = {
   raw: responses,
   intrinsic,
   extrinsic,
   amotivation

    };

    // 🔹 Level Classification
    function classifyMotivation(score) {
        if (score <= 8) return "Low";
        if (score <= 14) return "Moderate";
        return "High";
    }

    const intrinsicLevel = classifyMotivation(intrinsic);
    const extrinsicLevel = classifyMotivation(extrinsic);
    const amotivationLevel = classifyMotivation(amotivation);

    // 🔹 Clinical Narrative
   const narrative = generateMotivationNarrative(
    sessionState.results.Motivation
);

    render(`
        <h2>Motivation Profile</h2>

        <p><strong>Intrinsic Motivation:</strong> ${intrinsic} (${intrinsicLevel})</p>
        <p><strong>Extrinsic Motivation:</strong> ${extrinsic} (${extrinsicLevel})</p>
        <p><strong>Amotivation:</strong> ${amotivation} (${amotivationLevel})</p>

        <br>
        <p>${narrative}</p>

        <br><br>
        <button onclick="renderDashboard()">Do Another Test</button>
        <button onclick="renderFinalSummary()" style="margin-left:10px; background:#444;">
        Finish Assessment
        </button>
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
        if (data.amotivation > data.intrinsic && data.amotivation > data.extrinsic) {
            return "Current motivational energy appears reduced. Reconnecting with personal meaning may be useful.";
        }
        return "Your motivation profile suggests engagement with goals.";
    }

    return "";
}

function renderPersonalityResult(traits) {

  let resultHTML = `<h2>Personality Profile</h2>`;

  for (let trait in traits) {

    const score = traits[trait];
    const level = interpretTrait(score);

    let interpretation = "";

   if (trait === "Neuroticism") {
    if (level === "High") {
        interpretation = "You may experience emotions more intensely than some people, especially during stressful moments. With awareness and coping strategies, this sensitivity can become a strength.";
    } else if (level === "Low") {
        interpretation = "You tend to stay calm and steady even when situations become demanding.";
    } else {
        interpretation = "You experience emotions in a balanced and typical way.";
    }
}

    if (trait === "Extraversion") {
    if (level === "High") {
        interpretation = "You likely gain energy from social interaction and enjoy engaging with others.";
    } else if (level === "Low") {
        interpretation = "You may recharge best through solitude and quieter activities.";
    } else {
        interpretation = "You balance social engagement with personal space.";
    }
}

    if (trait === "Conscientiousness") {
    if (level === "Low") {
        interpretation = "You may prefer flexibility and spontaneity over strict structure.";
    } else if (level === "High") {
        interpretation = "You likely value planning, responsibility, and follow-through.";
    } else {
        interpretation = "You show a healthy balance between structure and adaptability.";
    }
}

    if (trait === "Agreeableness") {
    if (level === "High") {
        interpretation = "You likely value cooperation and understanding in relationships.";
    } else if (level === "Low") {
        interpretation = "You may prioritize directness and independent thinking.";
    } else {
        interpretation = "You balance empathy with assertiveness.";
    }
}

    if (trait === "Openness") {
    if (level === "High") {
        interpretation = "You are likely imaginative and open to exploring new ideas.";
    } else if (level === "Low") {
        interpretation = "You may prefer practical, realistic approaches and familiar routines.";
    } else {
        interpretation = "You combine curiosity with grounded thinking.";
    }
}

    resultHTML += `
        <div style="margin-bottom:15px;">
            <p><strong>${trait}</strong>: ${score} (${level})</p>
            <p style="color:#444; font-size:14px; line-height:1.4;">
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
  <button onclick="renderFinalSummary()" style="margin-left:10px; background:#444;">
    Finish Assessment
  </button>
`;

  render(resultHTML);
}

function renderFinalSummary() {

 if (!summarySubmitted) {
    sendToBackend();
    summarySubmitted = true;
}

const r = sessionState.results;
let supportBlock = "";

// -------- HIGH STRESS --------
if (r.Stress?.total >= 12) {
  supportBlock += `
    <div class="summary-card support-card">
      <h3>Support Recommendation</h3>
      <p>Your responses suggest elevated stress levels. It may be helpful to speak with Ms. Neha at the University Counselling Room (Block A, Ground Floor).</p>
      <a href="https://forms.gle/qPGY49pDKXnqEyfbA" target="_blank" class="primary-btn">
        Request Counselling Support
      </a>
    </div>
  `;
}

// -------- LOW HAPPINESS --------
if (r.Happiness?.total <= 14) {
  supportBlock += `
    <div class="summary-card support-card">
      <h3>Help Improve Campus Wellbeing</h3>
      <p>If you feel your university experience could be more fulfilling, you may share suggestions with us.</p>
      <a href="https://forms.gle/HvzwyFR8W2UsGVpEA" target="_blank" class="primary-btn">
        Share Feedback
      </a>
    </div>
  `;
}

// -------- HIGH AMOTIVATION --------
if (r.Motivation?.amotivation > r.Motivation?.intrinsic) {
  supportBlock += `
    <div class="summary-card support-card">
      <h3>Motivational Support</h3>
      <p>Your responses suggest reduced academic drive. Structured academic mentoring or counselling may help re-align goals.</p>
    </div>
  `;
}

// -------- LOW EI --------
if (r.Emotional_Intelligence?.total <= 25) {
  supportBlock += `
    <div class="summary-card support-card">
      <h3>Emotional Skill Development</h3>
      <p>Emotional intelligence is a developable capacity. Workshops and guided reflection sessions can strengthen regulation and empathy skills.</p>
    </div>
  `;
}

const fullNarrative = generateFullNarrative();
const report = generateStrengthWeaknessReport();
const academicBlock = generateAcademicFunctioning();

    let html = `
<h2>Assessment Summary 📊</h2>

<div class="summary-card">
  <h3>Profile Snapshot</h3>
 ${r.Personality ? `
  <div>
    <strong>Personality:</strong><br>
   Extraversion: ${r.Personality.Extraversion}<br>
   Agreeableness: ${r.Personality.Agreeableness}<br>
   Conscientiousness: ${r.Personality.Conscientiousness}<br>
   Neuroticism: ${r.Personality.Neuroticism}<br>
   Openness: ${r.Personality.Openness}
  </div>
` : ""}

  ${r.Emotional_Intelligence ? `
    <p><strong>Emotional Intelligence:</strong> ${r.Emotional_Intelligence.total}</p>
  ` : ""}

  ${r.Happiness ? `
    <p><strong>Happiness:</strong> ${r.Happiness.total} / 28</p>
  ` : ""}

  ${r.Stress ? `
    <p><strong>Stress:</strong> ${r.Stress.total} / 16</p>
  ` : ""}

  ${r.Motivation ? `
    <p><strong>Motivation:</strong> Intrinsic ${r.Motivation.intrinsic} | Extrinsic ${r.Motivation.extrinsic} | Amotivation ${r.Motivation.amotivation}</p>
  ` : ""}
</div>
`;

/* =============================
   Psychological Overview
============================= */

html += `
<div class="summary-card">
  <h3>Your Personal Overview</h3>
  <p>${fullNarrative}</p>
</div>
`;
  narrative = "Here’s a gentle overview of how your responses come together: ";

/* =============================
   Academic Functioning
============================= */

html += academicBlock;

/* =============================
   Strengths
============================= */

html += `
<div class="summary-card">
  <h3>Strength Indicators</h3>
  <ul>
  ${report.strengths.length 
      ? report.strengths.map(s => `<li>${s}</li>`).join("") 
      : "<li>No prominent strengths identified in assessed domains.</li>"}
  </ul>
</div>
`;

/* =============================
   Growth Areas
============================= */

html += `
<div class="summary-card">
  <h3>Growth & Development Areas</h3>
  <ul>
  ${report.growth.length 
      ? report.growth.map(g => `<li>${g}</li>`).join("") 
      : "<li>No major developmental flags detected.</li>"}
  </ul>
</div>
`;

/* =============================
   Action Buttons
============================= */

html += `
<div class="summary-actions">
  <button onclick="renderDashboard()">Back to Dashboard</button>
  <button onclick="downloadReport()" style="margin-left:10px;background:#444;">
    Download Report
  </button>
</div>
`;
html += supportBlock;
localStorage.setItem("mindpop_session", JSON.stringify(sessionState));
    render(html);
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
function downloadReport() {
  let report = "MindPop Psychological Assessment Report\n\n";

  if (sessionState.results.Personality) {
    report += "Personality:\n";
    for (let trait in sessionState.results.Personality) {
      report += `${trait}: ${sessionState.results.Personality[trait]}\n`;
    }
    report += "\n";
  }

  if (sessionState.results.Emotional_Intelligence) {
    report += `Emotional Intelligence Total: ${sessionState.results.Emotional_Intelligence.total}\n\n`;
  }

  if (sessionState.results.Happiness) {
    report += `Happiness Total: ${sessionState.results.Happiness.total}\n\n`;
  }

  if (sessionState.results.Stress) {
    report += `Stress Total: ${sessionState.results.Stress.total}\n\n`;
  }

  if (sessionState.results.Motivation) {
    report += "Motivation:\n";
    report += `Intrinsic: ${sessionState.results.Motivation.intrinsic}\n`;
    report += `Extrinsic: ${sessionState.results.Motivation.extrinsic}\n`;
    report += `Amotivation: ${sessionState.results.Motivation.amotivation}\n\n`;
  }

  const blob = new Blob([report], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "MindPop_Report.txt";
  a.click();

  URL.revokeObjectURL(url);
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
function generateFullNarrative() {

    let narrative = "";

    const p = sessionState.results.Personality;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const ei = sessionState.results.Emotional_Intelligence;
    const m = sessionState.results.Motivation;

    // ===============================
    // 1️⃣ Stress + EI Interaction
    // ===============================
    if (s && ei) {

        if (s.total >= 10 && ei.total <= 25) {
            narrative += "You may be experiencing a combination of higher stress and emotional load, which can feel draining during busy periods. With small coping adjustments and support, balance can gradually improve. ";}

        else if (s.total >= 10 && ei.total > 38) {
            narrative += "Although stress levels appear elevated, your emotional regulation capacity may buffer against prolonged disruption. Structured recovery practices may further stabilize performance. ";
        }
    }

    // ===============================
    // 2️⃣ Stress + Conscientiousness
    // ===============================
    if (s && p) {

        if (s.total >= 10 && p.Conscientiousness >= 8) {
            narrative += "High task commitment alongside elevated stress may reflect overextension. Introducing pacing strategies and boundary-setting could prevent long-term fatigue. ";
        }
    }

    // ===============================
    // 3️⃣ Happiness + Motivation
    // ===============================
    if (h && m) {

        if (h.total <= 12 && m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            narrative += "Lower positive affect combined with reduced motivational activation may indicate temporary disengagement. Reconnecting with supportive environments and meaningful goals may restore momentum. ";
        }
    }

    // ===============================
    // 4️⃣ EI + Motivation
    // ===============================
    if (ei && m) {

        if (ei.total > 38 && m.intrinsic > m.extrinsic) {
            narrative += "Strong emotional awareness paired with intrinsic motivation suggests adaptive self-directed engagement patterns. This combination often supports sustained academic growth. ";
        }
    }

    // ===============================
    // 5️⃣ Openness + Intrinsic Motivation
    // ===============================
    if (p && m) {

        if (p.Openness >= 8 && m.intrinsic > m.extrinsic) {
            narrative += "Curiosity and internally driven motivation may enhance exploratory learning and intellectual flexibility. ";
        }
    }

    // ===============================
    // 6️⃣ Default Balanced Statement
    // ===============================
    if (narrative === "") {
        narrative = "Your responses suggest generally adaptive psychological functioning across assessed domains, with balanced emotional and motivational patterns.";
    }

    return narrative;
}
function generateAcademicFunctioning() {

    const p = sessionState.results.Personality;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const ei = sessionState.results.Emotional_Intelligence;
    const m = sessionState.results.Motivation;

    let overview = "";
    let focusCapacity = "";
    let effortSustainability = "";
    let resilienceProfile = "";
    let recommendation = "";

    // -----------------------------
    // Focus Capacity
    // -----------------------------
    if (s && s.total >= 10) {
        focusCapacity = "Elevated stress may intermittently affect concentration and mental clarity during demanding periods.";
    } else {
        focusCapacity = "Concentration capacity appears generally stable under routine academic demands.";
    }

    // -----------------------------
    // Effort Sustainability
    // -----------------------------
    if (m) {
        if (m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            effortSustainability = "Sustaining academic effort may feel inconsistent at present, particularly when tasks feel disconnected from personal meaning.";
        }
        else if (m.intrinsic > m.extrinsic) {
            effortSustainability = "Internally driven engagement may support deeper and more sustainable learning patterns.";
        }
        else {
            effortSustainability = "Clear structure and accountability systems may enhance effort consistency.";
        }
    }

    // -----------------------------
    // Resilience Profile
    // -----------------------------
    if (ei && s) {
        if (ei.total >= 38 && s.total >= 10) {
            resilienceProfile = "Despite elevated demands, emotional regulation capacity may buffer against prolonged academic disruption.";
        }
        else if (ei.total <= 25 && s.total >= 10) {
            resilienceProfile = "Academic strain may feel more internally taxing when stress and emotional regulation load combine.";
        }
        else {
            resilienceProfile = "Stress-response and emotional regulation patterns appear within adaptive range.";
        }
    }

    // -----------------------------
    // Overextension Risk
    // -----------------------------
    if (p && s) {
        if (p.Conscientiousness >= 8 && s.total >= 10) {
            recommendation = "High achievement orientation combined with elevated stress suggests monitoring pacing and workload balance.";
        }
    }

    if (!recommendation) {
        recommendation = "Maintaining structured routines, recovery breaks, and goal clarity may support sustained academic functioning.";
    }

    // -----------------------------
    // Final Overview
    // -----------------------------
    overview = "Your academic functioning profile reflects the interaction between motivation, emotional regulation, stress load, and task orientation.";

    return `
        <div class="summary-card">
            <div class="summary-title">Academic Functioning Overview</div>
            <div class="summary-text">
                <p>${overview}</p>
                <p><strong>Focus Capacity:</strong> ${focusCapacity}</p>
                <p><strong>Effort Sustainability:</strong> ${effortSustainability}</p>
                <p><strong>Resilience Pattern:</strong> ${resilienceProfile}</p>
                <p><strong>Performance Recommendation:</strong> ${recommendation}</p>
            </div>
        </div>
    `;
}

function generateStrengthWeaknessReport() {

    let strengths = [];
    let growth = [];

    const p = sessionState.results.Personality;
    const ei = sessionState.results.Emotional_Intelligence;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const m = sessionState.results.Motivation;

    // ==============================
    // Personality Strength Patterns
    // ==============================

    if (p) {

        if (p.Conscientiousness >= 8) {
            strengths.push("Strong task discipline and structured goal orientation. This may support consistent academic performance and planning efficiency.");
        }

        if (p.Agreeableness >= 8) {
            strengths.push("Cooperative interpersonal style that may enhance teamwork and peer collaboration.");
        }

        if (p.Openness >= 8) {
            strengths.push("Intellectual curiosity and openness to new ideas, supporting adaptive learning.");
        }

        if (p.Neuroticism >= 8) {
            growth.push("Heightened emotional sensitivity under stress. Developing structured coping routines may enhance resilience during demanding periods.");
        }

        if (p.Conscientiousness <= 4) {
            growth.push("Lower task structure orientation. Building consistent planning systems may strengthen follow-through.");
        }
    }

    // ==============================
    // EI Strength / Growth
    // ==============================

    if (ei) {

        if (ei.total >= 40) {
            strengths.push("Strong emotional awareness and regulation capacity, which may buffer against academic and interpersonal stress.");
        }

        if (ei.total <= 25) {
            growth.push("Emotional regulation skills may benefit from intentional reflection practices and feedback-based learning.");
        }
    }

    // ==============================
    // Stress Pattern
    // ==============================

    if (s) {

        if (s.total <= 4) {
            strengths.push("Low perceived stress levels suggest effective coping balance under routine demands.");
        }

        if (s.total >= 12) {
            growth.push("You may want to pay attention to stress levels and give yourself space to recharge when needed.");
        }
    }

    // ==============================
    // Happiness Pattern
    // ==============================

    if (h) {

        if (h.total >= 22) {
            strengths.push("Positive emotional baseline that may enhance creativity, persistence, and social engagement.");
        }

        if (h.total <= 12) {
            growth.push("Reduced subjective wellbeing at present. Increasing meaningful engagement and restorative activities may support uplift.");
        }
    }

    // ==============================
    // Motivation Pattern
    // ==============================

    if (m) {

        if (m.intrinsic > m.extrinsic && m.intrinsic > m.amotivation) {
            strengths.push("Internally driven motivation, supporting sustained and self-directed learning.");
        }

        if (m.extrinsic > m.intrinsic && m.extrinsic > m.amotivation) {
            strengths.push("Responsiveness to structure and accountability, which may enhance performance in organized environments.");
        }

        if (m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            growth.push("You might benefit from reconnecting with what personally matters to you, especially if things feel routine or draining.");
        }
    }

    // ==============================
    // Cross-Scale Interaction Logic
    // ==============================

    // High Stress + High Conscientiousness
    if (s && p) {
        if (s.total >= 10 && p.Conscientiousness >= 8) {
            growth.push("Strong achievement drive combined with elevated stress may indicate overextension. Introducing pacing strategies could prevent fatigue.");
        }
    }

    // High EI + High Stress
    if (s && ei) {
        if (s.total >= 10 && ei.total >= 38) {
            strengths.push("Despite elevated stress, emotional regulation capacity may provide resilience and adaptive recovery potential.");
        }
    }

    // Low Happiness + High Amotivation
    if (h && m) {
        if (h.total <= 12 && m.amotivation > m.intrinsic) {
            growth.push("Lower positive affect combined with reduced motivational activation may reflect temporary disengagement. Structured support may restore direction.");
        }
    }

    // Balanced Protective Pattern
    if (ei && h && s) {
        if (ei.total >= 38 && h.total >= 20 && s.total <= 9) {
            strengths.push("Balanced emotional regulation, positive affect, and manageable stress suggest strong adaptive functioning.");
        }
    }

    // ==============================
    // Fallback Safety
    // ==============================

    if (strengths.length === 0) {
        strengths.push("Your profile reflects balanced psychological functioning without pronounced vulnerabilities.");
    }

    if (growth.length === 0) {
        growth.push("No significant development flags identified. Continued self-reflection may support ongoing growth.");
    }

    return { strengths, growth };
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
        <p>You may sometimes find it hard to understand or manage your emotions, especially during stressful situations. And that’s completely okay — emotional skills are something we build over time.</p>

        <p>When pressure increases, emotions can feel overwhelming or confusing. With small practices like pausing before reacting, naming what you’re feeling, or reflecting on situations afterward, emotional clarity gradually improves.</p>

        <p>This is not a fixed trait — it’s a skill set you can strengthen.</p>
        `;

    } else if (totalEI <= 38) {

        message = `
        <p>You seem to have a fairly balanced understanding of your emotions and how they affect you.</p>

        <p>In most situations, you likely manage your feelings reasonably well, though intense or unexpected situations may still challenge you — which is completely normal.</p>

        <p>With continued self-awareness and reflection, this balance can grow into a strong emotional strength.</p>
        `;

    } else {

        message = `
        <p>You appear to have strong emotional awareness and regulation skills.</p>

        <p>You likely understand what you’re feeling and are able to respond thoughtfully rather than react impulsively. This can really help in academics, relationships, and leadership situations.</p>

        <p>Continuing to stay reflective and empathetic will help you maintain this strength.</p>
        `;
    }

    return message;
}
function generateHappinessNarrative(totalHappiness) {

    let message = "";

    if (totalHappiness <= 12) {

        message = `
        <p>You might not be feeling as positive or satisfied as you’d like these days.</p>

        <p>That doesn’t mean you’re failing or broken — sometimes we just go through phases where things feel a bit dull or heavy.</p>

        <p>Even small meaningful activities, supportive friendships, or new experiences can gradually lift your daily mood.</p>
        `;

    } else if (totalHappiness <= 20) {

        message = `
        <p>Your general sense of happiness seems fairly balanced.</p>

        <p>You probably have both good days and stressful days — which is completely normal.</p>

        <p>Continuing to invest time in things that matter to you can strengthen this stability.</p>
        `;

    } else {

        message = `
        <p>You seem to experience a strong sense of satisfaction and positive mood in your life.</p>

        <p>This positive emotional base often helps with creativity, motivation, and resilience.</p>

        <p>Maintaining balance and meaningful connections will help you sustain this strength.</p>
        `;
    }

    return message;
}
function generateStressNarrative(totalStress) {

    let message = "";

    if (totalStress <= 4) {

        message = `
        <p>Right now, things seem to feel manageable for you.</p>

        <p>You probably handle daily pressures without feeling overwhelmed. That doesn’t mean life is perfect — just that you’re coping well at the moment.</p>

        <p>Keep maintaining routines that help you recharge — sleep, breaks, and supportive conversations.</p>
        `;

    } else if (totalStress <= 9) {

        message = `
        <p>You’re experiencing a normal amount of stress — the kind that often comes with academics and responsibilities.</p>

        <p>Sometimes it might feel a bit heavy, especially during busy periods, but it doesn’t appear out of control.</p>

        <p>Small stress-relief habits — structured planning, short breaks, or talking things through — can make a noticeable difference.</p>
        `;

    } else {

        message = `
        <p>You may be feeling quite pressured or mentally overloaded right now.</p>

        <p>When stress builds up for too long, it can affect focus, energy, and even mood. This doesn’t mean something is wrong with you — it just means your system might need rest or support.</p>

        <p>Reaching out, slowing down where possible, or speaking with someone you trust can really help during this phase.</p>
        `;
    }

    return message;
}
function generateMotivationNarrative(data) {

    const { intrinsic, extrinsic, amotivation } = data;
    let message = "";

    if (amotivation > intrinsic && amotivation > extrinsic) {

        message = `
        <p>You might be feeling a bit disconnected from your work right now.</p>

        <p>It may sometimes feel hard to start tasks or stay consistent, especially if the work doesn’t feel meaningful.</p>

        <p>This phase can happen to anyone. Reconnecting with why you started, setting small achievable goals, or talking to a mentor can help rebuild momentum.</p>
        `;

    } else if (intrinsic > extrinsic && intrinsic > amotivation) {

        message = `
        <p>You seem to be motivated mainly by genuine interest and personal meaning.</p>

        <p>When something feels valuable or interesting to you, you likely put in strong effort naturally.</p>

        <p>Keeping your goals aligned with your interests will help you stay energized long-term.</p>
        `;

    } else if (extrinsic > intrinsic && extrinsic > amotivation) {

        message = `
        <p>You appear to respond well to structure, deadlines, and clear expectations.</p>

        <p>External goals, recognition, or accountability may help you stay focused and productive.</p>

        <p>Blending this structure with personal meaning could make your motivation even stronger.</p>
        `;

    } else {

        message = `
        <p>Your motivation seems fairly balanced between personal interest and external structure.</p>

        <p>You likely adapt your effort depending on the situation.</p>

        <p>Periodic reflection on your goals can help maintain clarity and direction.</p>
        `;
    }

    return message;
}
function restartAssessment() {
  localStorage.removeItem("mindpop_session");
  location.reload();
}

function sendToBackend() {
  const endpoint = "https://script.google.com/macros/s/AKfycbxAf9J8x33TAGFVjLgzKe8vgb0SseC95TnGzSq4ZI22pdB7kO0g_oVhKQpwyzta2rjY/exec";

  fetch(endpoint, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(sessionState)
  })
  .then(() => console.log("Data sent"))
  .catch(err => console.error("Backend error:", err));
}
function fetchData() {
  const endpoint = "https://script.google.com/macros/s/AKfycbxAf9J8x33TAGFVjLgzKe8vgb0SseC95TnGzSq4ZI22pdB7kO0g_oVhKQpwyzta2rjY/exec";

  fetch(endpoint)
    .then(res => res.json())
    .then(data => console.log(data));
}

// ---------------- START ----------------

if (sessionState.completedTests.length > 0) {
    renderDashboard();
} else {
    renderConsent();
}
