const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5Bpoz5nQ0FwtL9v7WPKSBn3su_xqtXbLzJe74Lx8KtXWMRdreZXwyp3zNVeCUQTw/exec";
// ---------------- SESSION ----------------

let sessionState = {
  anonId: "",
  demographics: {},
  completedTests: []
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
    <select id="pursuing">
      <option value="">Select</option>
      <option>Undergraduate</option>
      <option>Postgraduate</option>
    </select>

    <label>Year</label>
    <select id="year">
      <option value="">Select</option>
      <option>1st Year</option>
      <option>2nd Year</option>
      <option>3rd Year</option>
      <option>4th Year</option>
    </select>

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
    name: document.getElementById("name").value || "",
    gender,
    department,
    pursuing,
    year
  };

  renderDashboard();
}

// ---------------- DASHBOARD ----------------

function renderDashboard() {

  const completed = sessionState.completedTests.length;

  render(`
    <h2>Assessment Dashboard</h2>
    <p>Completed Tests: ${completed}/5</p>

    <button onclick="startTest('Personality')">
      Personality
    </button>
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

// ---------------- PERSONALITY SCORING ----------------

function submitTest(testName) {

  const scale = scales[testName];
  const form = document.getElementById("testForm");
  const data = new FormData(form);

  let responses = [];
  let missing = false;

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

  const traits = {
    Extraversion: responses[0] + responses[5],
    Agreeableness: responses[1] + responses[6],
    Conscientiousness: responses[2] + responses[7],
    Neuroticism: responses[3] + responses[8],
    Openness: responses[4] + responses[9]
  };

const rowData = [
  new Date().toISOString(),
  sessionState.anonId,
  sessionState.demographics.name,
  sessionState.demographics.gender,
sessionState.demographics.department,
sessionState.demographics.pursuing,
sessionState.demographics.year,
  ...responses,
  traits.Extraversion,
  traits.Agreeableness,
  traits.Conscientiousness,
  traits.Neuroticism,
  traits.Openness
];

fetch(WEB_APP_URL, {
  method: "POST",
  body: JSON.stringify({
    sheetName: "Personality",
    rowData: rowData
  })
})
.then(res => res.json())
.then(data => {
  console.log("Sheet response:", data);
})
.catch(err => {
  console.error("Submission error:", err);
});

if (!sessionState.completedTests.includes("Personality")) {
  sessionState.completedTests.push("Personality");
}

renderPersonalityResult(traits);
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

  render(`
    <h2>Assessment Completed 🎉</h2>

    <p>
      Thank you for participating in the MindPop Psychological Assessment.
    </p>

    <p>
      Your responses contribute to understanding overall student wellbeing.
    </p>

    <button onclick="renderDashboard()">Back to Dashboard</button>
  `);
}

// ---------------- START ----------------

renderConsent();
