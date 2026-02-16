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
  <option value="Student">Student</option>
  <option value="Faculty">Faculty</option>
  <option value="Other">Other</option>
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

  if (!gender || !department || !pursuing || !year) {
    alert("Please complete all required fields.");
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

    render(`
        <h2>Assessment Dashboard</h2>
        <p>Completed Tests: ${completed}/5</p>

        ${testButton("Personality")}
        ${testButton("Emotional_Intelligence")}
        ${testButton("Happiness")}
        ${testButton("Stress")}
        ${testButton("Motivation")}
        let restartButton = "";

if (sessionState.completedTests.length === 5) {
  restartButton = `
    <br><br>
    <button onclick="restartAssessment()" style="background:#444;">
      Start New Assessment
    </button>
  `;
}

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
          <input type="radio" id="q${index}_${i}" 
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
        render(`
            <h2>Emotional Intelligence Result</h2>
            <p>Your Total EI Score: <strong>${totalEI}</strong></p>

            <br><br>
            <button onclick="renderDashboard()">Do Another Test</button>
            <button onclick="renderFinalSummary()" 
                style="margin-left:10px; background:#444;">
                Finish Assessment
            </button>
        `);

        return;
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
    render(`
        <h2>Happiness Result</h2>
        <p>Your Total Happiness Score: <strong>${totalHappiness}</strong> / 28</p>

        <br><br>
        <button onclick="renderDashboard()">Do Another Test</button>
        <button onclick="renderFinalSummary()" 
            style="margin-left:10px; background:#444;">
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
    render(`
        <h2>Perceived Stress Result</h2>
        <p>Your Total Stress Score: <strong>${totalStress}</strong></p>

        <br><br>
        <button onclick="renderDashboard()">Do Another Test</button>
        <button onclick="renderFinalSummary()" 
            style="margin-left:10px; background:#444;">
            Finish Assessment
        </button>
    `);

    return;
}
  // =======================
  // Motivation Scale
  // =======================
  if (testName === "Motivation") {

    const intrinsic = responses[0] + responses[5] + responses[6];

    const identified = responses[1] + responses[10];
    const introjected = responses[2] + responses[7];
    const external = responses[3] + responses[8];

    const extrinsic = identified + introjected + external;

    const amotivation = responses[4] + responses[9] + responses[11];

    if (!sessionState.completedTests.includes("Motivation")) {
        sessionState.completedTests.push("Motivation");
    }

    sessionState.results.Motivation = {
    intrinsic,
    extrinsic,
    amotivation
    };
    render(`
        <h2>Motivation Profile</h2>

        <p><strong>Intrinsic Motivation:</strong> ${intrinsic}</p>
        <p><strong>Extrinsic Motivation:</strong> ${extrinsic}</p>
        <p><strong>Amotivation:</strong> ${amotivation}</p>

        <br><br>
        <button onclick="renderDashboard()">Do Another Test</button>
        <button onclick="renderFinalSummary()" 
            style="margin-left:10px; background:#444;">
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

function renderPersonalityResult(traits) {

  let resultHTML = `<h2>Personality Profile</h2>`;

  for (let trait in traits) {
    const level = interpretTrait(traits[trait]);
    resultHTML += `
      <p><strong>${trait}</strong>: ${traits[trait]} (${level})</p>
    `;
  }

  
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

  const facultyContainer = document.getElementById("facultyExperienceContainer");
  const yearContainer = document.getElementById("yearContainer");

  if (pursuing === "Faculty") {

    facultyContainer.style.display = "block";
    yearContainer.style.display = "none";

  } else {

    facultyContainer.style.display = "none";
    yearContainer.style.display = "block";
  }
}
// ---------------- START ----------------

renderConsent();
