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
    <p>This assessment is anonymous and for academic analysis only.</p>
    <button onclick="acceptConsent()">I Agree</button>
  `);
}

function acceptConsent() {
  sessionState.anonId = generateAnonId();
  renderDemographics();
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

    <button onclick="saveDemographics()">Continue</button>
  `);
}

function saveDemographics() {
  const gender = document.getElementById("gender").value;

  if (!gender) {
    alert("Please select gender.");
    return;
  }

  sessionState.demographics = {
    name: document.getElementById("name").value || "",
    gender
  };

  renderDashboard();
}

// ---------------- DASHBOARD ----------------

function renderDashboard() {
  render(`
    <h2>Assessment Dashboard</h2>
    <button onclick="startTest('Personality')">Personality</button>
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
  "",  // Department placeholder
  "",  // Pursuing placeholder
  "",  // Year placeholder
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

sessionState.completedTests.push("Personality");

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
    <br>
    <button onclick="renderDashboard()">Back to Dashboard</button>
  `;

  render(resultHTML);
}

// ---------------- START ----------------

renderConsent();
