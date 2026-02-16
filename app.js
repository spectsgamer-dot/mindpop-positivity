const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5Bpoz5nQ0FwtL9v7WPKSBn3su_xqtXbLzJe74Lx8KtXWMRdreZXwyp3zNVeCUQTw/exec";

// ---------------- SESSION ----------------

let sessionState = {
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

// ---------------- SCALE DEFINITIONS ----------------

const scales = {
  Personality: {
    items: 10,
    likert: 5,
    reverse: [2,4,6,8,10],
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

// ---------------- CONSENT ----------------

function renderConsent() {
  render(`
    <h2>😊 Welcome to MindPop</h2>

    <p>
      This assessment is anonymous and conducted for academic analysis
      of student emotional wellbeing.
    </p>

    <p>
      This is not a clinical diagnosis, but a brief self-awareness tool.
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

    <label>Name (Optional)</label>
    <input id="name">

    <label>Gender</label>
    <select id="gender">
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>

    <label>Department</label>
    <select id="department">
      <option value="">Select</option>
      <option>Humanities & Social Sciences</option>
      <option>Sciences</option>
      <option>Paramedical Sciences</option>
      <option>Pharmaceutical Science</option>
      <option>Engineering</option>
      <option>Computer Technology</option>
      <option>Nursing</option>
      <option>Physiotherapy & Rehabilitation</option>
      <option>Commerce & Management</option>
      <option>Agriculture Sciences & Technology</option>
    </select>

   <label>Pursuing</label>
<select id="pursuing" onchange="handlePursuingChange()">
  <option value="">Select</option>
  <option value="Undergraduate">Undergraduate</option>
  <option value="Postgraduate">Postgraduate</option>
  <option value="Faculty">Faculty</option>
</select>


<div id="facultyExperienceContainer" style="display:none;">
  <label>Experience as Faculty</label>
  <select id="facultyExperience">
    <option value="">Select</option>
    <option>0–2 Years</option>
    <option>3–5 Years</option>
    <option>6–10 Years</option>
    <option>10+ Years</option>
  </select>
</div>

    <div id="yearContainer">
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


    <button onclick="saveDemographics()">Continue</button>
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
  pursuing: document.getElementById("pursuing").value,
  facultyExperience: document.getElementById("facultyExperience")?.value || "",
  year: document.getElementById("year").value
};

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

        sessionState.results.Personality = traits;
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
            interpretation = "You may experience emotions more intensely and feel stress more strongly at times. With structured coping strategies and emotional regulation skills, this sensitivity can become a strength rather than a burden.";
        } else if (level === "Low") {
            interpretation = "You likely demonstrate emotional stability and resilience, recovering steadily from daily stressors.";
        } else {
            interpretation = "Your emotional responses appear balanced, reflecting typical stress sensitivity.";
        }
    }

    if (trait === "Extraversion") {
        if (level === "High") {
            interpretation = "You tend to gain energy from social engagement and may thrive in interactive or leadership environments.";
        } else if (level === "Low") {
            interpretation = "You may prefer reflection, depth, and quieter environments that allow focused thinking.";
        } else {
            interpretation = "You show flexibility between social involvement and personal space.";
        }
    }

    if (trait === "Conscientiousness") {
        if (level === "Low") {
            interpretation = "You may benefit from structured planning systems to enhance consistency in goal pursuit.";
        } else if (level === "High") {
            interpretation = "You likely demonstrate discipline, organization, and reliability in responsibilities.";
        } else {
            interpretation = "You balance structure with adaptability.";
        }
    }

    if (trait === "Agreeableness") {
        if (level === "High") {
            interpretation = "You tend to prioritize cooperation and relational harmony in group settings.";
        } else if (level === "Low") {
            interpretation = "You may value assertiveness and independent judgement in interactions.";
        } else {
            interpretation = "You balance empathy with personal boundaries.";
        }
    }

    if (trait === "Openness") {
        if (level === "High") {
            interpretation = "You are likely curious, imaginative, and open to new ideas and experiences.";
        } else if (level === "Low") {
            interpretation = "You may prefer familiar structures and practical approaches over abstract exploration.";
        } else {
            interpretation = "You combine creativity with grounded decision-making.";
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

    const r = sessionState.results;

    let html = `<h2>Assessment Summary 📊</h2>`;
    let supportBlocks = "";
    let counsellingShown = false;


    // ---------------- Personality ----------------
    if (r.Personality) {
        html += `<h3>Personality</h3>`;
        for (let trait in r.Personality) {
            html += `<p><strong>${trait}:</strong> ${r.Personality[trait]}</p>`;
        }
    }

    // ---------------- Emotional Intelligence ----------------
    if (r.Emotional_Intelligence) {
        html += `
        <h3>Emotional Intelligence</h3>
        <p>Total EI Score: <strong>${r.Emotional_Intelligence.total}</strong></p>
        `;
    }

    // ---------------- Happiness ----------------
    if (r.Happiness) {
        html += `
        <h3>Happiness</h3>
        <p>Total Happiness Score: <strong>${r.Happiness.total}</strong> / 28</p>
        `;
    }

    // ---------------- Stress ----------------
    if (r.Stress) {
        html += `
        <h3>Stress</h3>
        <p>Total Stress Score: <strong>${r.Stress.total}</strong> / 16</p>
        `;
        
        // Counsellor Trigger
        if (r.Stress.total >= 10) {
            html += `
            <div style="margin-top:15px; padding:15px; background:#ffe6e6; border-radius:8px;">
            <strong>We noticed elevated stress levels.</strong><br>
            It may be helpful to consider meeting Ms. Neha (Counselling Room – Block A, Ground Floor) later this month.
            </div>
            `;
        }
    }

    // ---------------- Motivation ----------------
    if (r.Motivation) {
        html += `
        <h3>Motivation Profile</h3>
        <p><strong>Intrinsic:</strong> ${r.Motivation.intrinsic}</p>
        <p><strong>Extrinsic:</strong> ${r.Motivation.extrinsic}</p>
        <p><strong>Amotivation:</strong> ${r.Motivation.amotivation}</p>
        `;
    }

    html += `
    <br>
    <button onclick="renderDashboard()">Back to Dashboard</button>
    <button onclick="downloadReport()" style="margin-left:10px;background:#444;">
    Download Report
    </button>
    `;

    if (r.Happiness && r.Happiness.total <= 12) {

    supportBlocks += `
    <div class="support-card happiness">
    <h3>🌼 Student Wellbeing Reflection</h3>
    <p>Your responses suggest there may be space to enhance daily student happiness experiences.</p>
    <p>If you’d like, you can share ideas that could help make university life more positive.</p>

    <button onclick="window.open('https://forms.gle/HvzwyFR8W2UsGVpEA','_blank')">
    Share Suggestion
    </button>

    <button onclick="this.parentElement.style.display='none'">
    Skip
    </button>
    </div>
    `;
    }
   
  if (r.Stress && r.Stress.total >= 10) {

  supportBlocks += `
  <div class="support-card stress">
  <h3>🌿 Support Reminder</h3>
  <p>Your responses indicate elevated stress levels.</p>
  <p>Sometimes speaking with a professional can be helpful.</p>
  <p><strong>Ms. Neha</strong><br>
  Counselling Room – Block A, Ground Floor</p>

  <button onclick="window.open('https://forms.gle/qPGY49pDKXnqEyfbA','_blank')">
  Request Confidential Conversation
  </button>

  <button onclick="this.parentElement.style.display='none'">
  Skip
  </button>
  </div>
  `;

  counsellingShown = true;
  }

  if (r.Emotional_Intelligence && r.Emotional_Intelligence.total <= 24) {

  supportBlocks += `
  <div class="support-card ei">
  <h3>🧠 Emotional Skills Growth</h3>
  <p>Emotional intelligence is a developable skill.</p>
  <p>With awareness and practice, emotional regulation and empathy can strengthen significantly over time.</p>
  </div>
  `;
  }

  if (
  r.Motivation &&
  r.Motivation.amotivation > r.Motivation.intrinsic &&
  r.Motivation.amotivation > r.Motivation.extrinsic &&
  !counsellingShown
  ) {

  supportBlocks += `
  <div class="support-card motivation">
  <h3>🎯 Direction & Motivation</h3>
  <p>Your responses suggest you may be experiencing reduced drive or direction.</p>
  <p>A reflective conversation could help explore goals and clarity.</p>
  <p><strong>Ms. Neha</strong><br>
  Counselling Room – Block A, Ground Floor</p>

  <button onclick="window.open('https://forms.gle/qPGY49pDKXnqEyfbA','_blank')">
  Request Confidential Conversation
  </button>

  <button onclick="this.parentElement.style.display='none'">
  Skip
  </button>
  </div>
  `;
  }

  const fullNarrative = generateFullNarrative();

html += `
<h3>Psychological Profile Overview</h3>
Strength Indicators
Growth & Development Areas
<p>${fullNarrative}</p>
`;
const report = generateStrengthWeaknessReport();

html += `
<h3>Strength Indicators</h3>
<ul>
${report.strengths.length ? report.strengths.map(s => `<li>${s}</li>`).join("") : "<li>No prominent strengths identified in assessed domains.</li>"}
</ul>

<h3>Growth & Development Areas</h3>
<ul>
${report.growth.length ? report.growth.map(g => `<li>${g}</li>`).join("") : "<li>No major developmental flags detected.</li>"}
</ul>
`;
  
  if (supportBlocks !== "") {
  html += `
  <h3>Support & Reflection</h3>
  ${supportBlocks}
  `;
 }


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
function restartAssessment() {

  sessionState = {
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

  renderConsent();
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

    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const ei = sessionState.results.Emotional_Intelligence;
    const m = sessionState.results.Motivation;

    if (h && h.total <= 14) {
        narrative += "There are indicators of reduced positive affect. Environmental satisfaction and daily reinforcement patterns may benefit from reflection. ";
    }

    if (s && s.total >= 12) {
        narrative += "Perceived stress appears elevated, which may influence concentration and emotional regulation if sustained. ";
    }

    if (ei && ei.total <= 25) {
        narrative += "Emotional processing capacity may be underdeveloped currently, though these skills are highly trainable. ";
    }

    if (m && m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
        narrative += "Motivational structure suggests reduced goal-directed activation. Exploring autonomy and personal meaning may be valuable. ";
    }

    if (narrative === "") {
        narrative = "Your responses suggest generally adaptive psychological functioning across assessed domains.";
    }

    return narrative;
}
function generateStrengthWeaknessReport() {

    let strengths = [];
    let growth = [];

    const p = sessionState.results.Personality;
    const ei = sessionState.results.Emotional_Intelligence;
    const h = sessionState.results.Happiness;
    const s = sessionState.results.Stress;
    const m = sessionState.results.Motivation;

    // ---------------- Personality ----------------

    if (p) {

        if (p.Conscientiousness >= 8) {
            strengths.push("Strong task discipline and goal orientation. This often supports academic reliability, structured planning, and consistent follow-through.");
        }

        if (p.Agreeableness >= 8) {
            strengths.push("Cooperative and empathetic interpersonal style. This can enhance teamwork, peer relationships, and conflict resolution.");
        }

        if (p.Openness >= 8) {
            strengths.push("Curiosity and openness to ideas. This supports creativity, adaptive thinking, and intellectual exploration.");
        }

        if (p.Neuroticism >= 8) {
            growth.push("Heightened emotional sensitivity under stress. Developing emotional regulation strategies may improve resilience during demanding periods.");
        }

        if (p.Conscientiousness <= 4) {
            growth.push("Lower task structure orientation. Building planning systems and time-management routines may enhance performance stability.");
        }
    }

    // ---------------- Emotional Intelligence ----------------

    if (ei) {

        if (ei.total >= 40) {
            strengths.push("Strong emotional awareness and regulation. This may support leadership potential, interpersonal trust, and adaptive coping.");
        }

        if (ei.total <= 25) {
            growth.push("Emotional processing skills may benefit from intentional development. Structured reflection and feedback can strengthen this capacity.");
        }
    }

    // ---------------- Happiness ----------------

    if (h) {

        if (h.total >= 22) {
            strengths.push("Positive subjective wellbeing indicators. This often correlates with optimism, persistence, and social engagement.");
        }

        if (h.total <= 12) {
            growth.push("Reduced subjective wellbeing at present. Increasing positive reinforcement, social support, or activity engagement may be beneficial.");
        }
    }

    // ---------------- Stress ----------------

    if (s) {

        if (s.total <= 4) {
            strengths.push("Low perceived stress levels. Suggests effective coping strategies and psychological stability under routine demands.");
        }

        if (s.total >= 12) {
            growth.push("Elevated perceived stress. Prolonged strain may affect concentration, sleep, and emotional balance if unaddressed.");
        }
    }

    // ---------------- Motivation ----------------

    if (m) {

        if (m.intrinsic > m.extrinsic && m.intrinsic > m.amotivation) {
            strengths.push("Strong intrinsic motivation. Engagement appears driven by internal curiosity and personal interest, which supports deeper learning.");
        }

        if (m.amotivation > m.intrinsic && m.amotivation > m.extrinsic) {
            growth.push("Reduced motivational activation. Clarifying goals and reconnecting with personal meaning may restore engagement.");
        }

        if (m.extrinsic > m.intrinsic && m.extrinsic > m.amotivation) {
            strengths.push("Clear responsiveness to external structure. Deadlines and expectations may effectively support performance.");
        }
    }

    return { strengths, growth };
}

function generatePersonalityNarrative(traits) {

    let narrative = "";

    const E = traits.Extraversion;
    const A = traits.Agreeableness;
    const C = traits.Conscientiousness;
    const N = traits.Neuroticism;
    const O = traits.Openness;

    // Extraversion
    if (E >= 8) {
        narrative += "You demonstrate strong social energy and are likely comfortable engaging with others in dynamic settings. ";
    } else if (E <= 4) {
        narrative += "You may prefer quieter environments and derive energy from reflection rather than high social stimulation. ";
    } else {
        narrative += "You appear balanced in social engagement, adapting comfortably to both group and individual settings. ";
    }

    // Agreeableness
    if (A >= 8) {
        narrative += "Your responses suggest a cooperative and empathetic interpersonal style. ";
    } else if (A <= 4) {
        narrative += "You may prioritize objectivity and independence over interpersonal harmony in decision-making. ";
    } else {
        narrative += "You likely balance assertiveness with consideration for others. ";
    }

    // Conscientiousness
    if (C >= 8) {
        narrative += "You appear highly organized and goal-directed, with strong self-regulatory capacity. ";
    } else if (C <= 4) {
        narrative += "Structure and routine may not be your primary orientation, and flexibility may characterize your approach. ";
    } else {
        narrative += "You likely show moderate planning and reliability in academic or work tasks. ";
    }

    // Neuroticism
    if (N >= 8) {
        narrative += "You may experience heightened emotional sensitivity under stress, which can influence mood variability. ";
    } else if (N <= 4) {
        narrative += "Your responses suggest emotional stability and calmness under pressure. ";
    } else {
        narrative += "You likely experience typical emotional fluctuations within normal adaptive range. ";
    }

    // Openness
    if (O >= 8) {
        narrative += "You demonstrate curiosity and openness toward new ideas and experiences. ";
    } else if (O <= 4) {
        narrative += "You may prefer familiarity and practical approaches over abstract exploration. ";
    } else {
        narrative += "You likely balance creativity with practicality. ";
    }

    narrative += "These patterns describe tendencies rather than fixed traits and may shift across contexts.";

    return narrative;
}
function generateEINarrative(totalEI) {

    if (totalEI <= 25)
        return "You may currently find emotional identification and regulation challenging. These skills are highly developable through reflective practice and feedback.";

    if (totalEI <= 38)
        return "You demonstrate functional emotional awareness in everyday situations, with potential for further refinement in complex interpersonal contexts.";

    return "You likely possess strong emotional awareness and regulation skills, supporting adaptive coping and collaborative functioning.";
}
function generateHappinessNarrative(totalHappiness) {

    if (totalHappiness <= 12)
        return "Your responses suggest reduced subjective wellbeing at this time. This may reflect temporary strain rather than a fixed state.";

    if (totalHappiness <= 20)
        return "You demonstrate moderate life satisfaction, with balanced positive and stressful experiences.";

    return "Your responses indicate strong subjective wellbeing and life satisfaction.";
}
function generateStressNarrative(totalStress) {

    if (totalStress <= 4)
        return "You currently report low perceived stress and appear to manage demands effectively.";

    if (totalStress <= 9)
        return "Your perceived stress level appears within typical adaptive range.";

    return "Your responses suggest elevated perceived stress, which may impact concentration, mood, and recovery if sustained.";
}
function generateMotivationNarrative(data) {

    const { intrinsic, extrinsic, amotivation } = data;

    if (amotivation > intrinsic && amotivation > extrinsic)
        return "Motivational activation appears reduced. Reconnecting with autonomy and personal meaning may be beneficial.";

    if (intrinsic > extrinsic && intrinsic > amotivation)
        return "Your motivation appears primarily internally driven by interest and curiosity.";

    if (extrinsic > intrinsic)
        return "External incentives and performance outcomes may significantly influence your engagement patterns.";

    return "Your motivation profile reflects a balanced integration of internal and external drivers.";
}

// ---------------- START ----------------

renderConsent();
