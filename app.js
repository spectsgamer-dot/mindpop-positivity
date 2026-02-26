const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbyDdsZR8AFAU0-CBF8JImsl8JbtPBrUjnIAEYMnO30blBOmMqiIITa--Hp3M_AOzAThJA/exec";

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
This assessment is designed for educational and wellbeing purposes within the university setting. Participation is voluntary.
</p>

<p>
Basic contact information (such as phone number) is collected for follow-up support if required. Your responses will remain confidential and used only for institutional wellbeing initiatives.
</p>

<p>
This assessment is not a diagnostic tool and does not replace professional mental health consultation.
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
  <label>Phone Number (Required)</label>
  <input type="tel" id="phone" placeholder="Enter 10-digit number">
</div>
<input type="text" id="name">

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

    function testButton(name) {

    const isDone = sessionState.completedTests.includes(name);

    return `
        <button 
            onclick="${
                isDone 
                ? `showTestResult('${name}')` 
                : `startTest('${name}')`
            }"
            style="margin:5px;"
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
        ${restartButton}
    `);
  if (sessionState.completedTests.length === 5) {
  html += `
    <br><br>
    <button onclick="restartAssessment()" style="background:#d9534f;color:white;">
      Restart Assessment
    </button>
  `;
}
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

      persistSession();
      sendToBackend();

render(`
<h2>Emotional Intelligence Profile</h2>

<p><strong>Total Score:</strong> ${totalEI} / 50</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
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
    persistSession();
    sendToBackend();

render(`
<h2>Subjective Happiness Profile</h2>

<p><strong>Total Score:</strong> ${totalHappiness} / 28</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
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
    persistSession();
    sendToBackend();

render(`
<h2>Perceived Stress Profile</h2>

<p><strong>Total Score:</strong> ${totalStress} / 16</p>
<p><strong>Level:</strong> ${level}</p>

<p style="margin-top:10px;">
${interpretation}
</p>

<br><br>
<button onclick="renderDashboard()">Do Another Test</button>
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
    persistSession();
    sendToBackend();

    render(`
        <h2>Motivation Profile</h2>

  <h3>Intrinsic Motivation: ${r.Motivation.intrinsic}</h3>
  <p>${interpretIntrinsic(r.Motivation.intrinsic)}</p>

  <h3>Extrinsic Motivation: ${r.Motivation.extrinsic}</h3>
  <p>${interpretExtrinsic(r.Motivation.extrinsic)}</p>

  <h3>Amotivation: ${r.Motivation.amotivation}</h3>
  <p>${interpretAmotivation(r.Motivation.amotivation)}</p>

        <br>
        <p>${narrative}</p>

        <br><br>
        <button onclick="renderDashboard()">Do Another Test</button>
        </button>
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
        <p><strong>Total Score:</strong> ${totalEI} / 50</p>
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
        <p><strong>Total Score:</strong> ${total} / 28</p>
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
        <p><strong>Total Score:</strong> ${total} / 16</p>
        <p>${interpretation}</p>
        <br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
        `);
        return;
    }

    if (testName === "Motivation" && r.Motivation) {

        const interpretation = generateMotivationNarrative(r.Motivation);

        render(`
        <h2>Motivation Profile</h2>
        <p><strong>Intrinsic:</strong> ${r.Motivation.intrinsic}</p>
        <p><strong>Extrinsic:</strong> ${r.Motivation.extrinsic}</p>
        <p><strong>Amotivation:</strong> ${r.Motivation.amotivation}</p>
        <p>${interpretation}</p>
        <br>
        <button onclick="renderDashboard()">Back to Dashboard</button>
        `);
        return;
    }
}
function restartAssessment() {

  if (!confirm("This will erase all your current results. Continue?")) {
    return;
  }

  sessionState.completedTests = [];
  sessionState.results = {};

  persistSession();
  renderDashboard();
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
        interpretation = `
        You may experience emotions more intensely than some people, particularly during stressful or uncertain situations.

        This sensitivity can sometimes feel overwhelming, but it can also make you deeply aware of your internal world and the emotional atmosphere around you.

        Developing grounding strategies, emotional awareness practices, or stress management routines can help you channel this sensitivity into emotional strength rather than strain.
        `;
    }

    else if (level === "Low") {
        interpretation = `
        You generally appear steady and calm, even when challenges arise.

        You may recover relatively quickly from stress and not dwell excessively on setbacks.

        This emotional stability can provide a strong foundation for leadership, teamwork, and long-term goals.
        `;
    }

    else {
        interpretation = `
        You likely experience emotional ups and downs within a typical range.

        Stress may affect you at times, but it doesn’t appear to dominate your overall functioning.

        Maintaining healthy coping habits will help preserve this balance.
        `;
    }
}

    if (trait === "Extraversion") {
    if (level === "High") {
        interpretation = `
        You likely feel energized when interacting with people and may naturally gravitate toward active, engaging environments. Being around others might stimulate your thinking, creativity, and motivation.

        You may enjoy teamwork, discussions, leadership roles, or situations where ideas are exchanged openly. Social interaction may not drain you — instead, it may recharge you.

        At times, you might need to consciously slow down and create space for reflection, especially when decisions require deeper thought. Balancing action with pause can make this strength even more powerful.
        `;
    }

    else if (level === "Low") {
        interpretation = `
        You may prefer quieter environments and meaningful one-to-one interactions rather than large group settings. Solitude might not feel lonely — it may feel productive or peaceful.

        You likely think deeply before speaking and may process ideas internally before sharing them. This can lead to thoughtful insights and careful decision-making.

        In highly social or fast-paced environments, you might need recovery time afterward. Protecting that recharge space helps you stay balanced and effective.
        `;
    }

    else {
        interpretation = `
        You seem comfortable balancing social interaction with personal space. You can engage when needed, yet you also value moments of reflection.

        This flexibility allows you to adapt across different environments — from teamwork settings to independent work.

        Paying attention to when you feel energized versus drained can help you structure your time in a way that supports your natural rhythm.
        `;
    }
}
    if (trait === "Conscientiousness") {

    if (level === "High") {
        interpretation = `
        You likely take responsibilities seriously and may prefer planning ahead rather than working impulsively.

        Structure, organization, and goal-setting may feel natural to you. You might gain satisfaction from completing tasks properly and on time.

        Sometimes, this strong sense of responsibility can lead to overworking or putting pressure on yourself. Remember that rest and flexibility are also productive.
        `;
    }

    else if (level === "Low") {
        interpretation = `
        You may prefer flexibility over strict routines and might work best when given creative freedom.

        Deadlines or rigid systems may sometimes feel restrictive rather than motivating.

        Creating light structure — without over-restricting yourself — can help maintain consistency while preserving your natural adaptability.
        `;
    }

    else {
        interpretation = `
        You likely manage your responsibilities reasonably well while remaining adaptable when plans change.

        You may not be overly rigid, but you also understand the value of preparation and follow-through.

        Strengthening small planning habits can make your natural balance even more effective.
        `;
    }
}

    if (trait === "Agreeableness") {
    if (level === "High") {
        interpretation = `
        You likely value harmony and try to understand others’ perspectives before reacting. Empathy may come naturally to you.

        In group settings, you might be the person who helps reduce tension or encourages cooperation. People may find you approachable and supportive.

        At times, you may need to ensure your own needs and opinions are expressed clearly, especially if you tend to prioritize others first. Healthy boundaries strengthen, not weaken, kindness.
        `;
    }

    else if (level === "Low") {
        interpretation = `
        You may prioritize honesty, independence, and logical reasoning over simply maintaining harmony. You might feel comfortable expressing disagreement when necessary.

        Others may see you as direct, clear, or strong-minded. This can be a powerful strength in decision-making and leadership.

        Being mindful of tone and emotional context can help your ideas land effectively without being misunderstood.
        `;
    }

    else {
        interpretation = `
        You appear to balance empathy with assertiveness. You can cooperate with others while still expressing your own viewpoints.

        In conflicts, you may try to see both sides rather than immediately taking a rigid stance.

        This balance can support both healthy relationships and confident decision-making.
        `;
    }
}

    if (trait === "Openness") {

    if (level === "High") {
        interpretation = `
        You seem naturally curious and open to exploring new ideas, perspectives, and experiences.

        You may enjoy creativity, imagination, and thinking beyond conventional boundaries.

        This openness can support innovation and adaptability, especially in changing academic or professional environments.
        `;
    }

    else if (level === "Low") {
        interpretation = `
        You may prefer practical approaches and familiar routines over constant experimentation.

        Stability and clarity may feel more comfortable than abstract or unpredictable situations.

        This grounded approach can help you stay realistic and focused when others become distracted by too many possibilities.
        `;
    }

    else {
        interpretation = `
        You likely appreciate new experiences while also valuing structure and practicality.

        You may explore ideas thoughtfully rather than impulsively.

        This balance allows both creativity and grounded decision-making.
        `;
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
function interpretIntrinsic(score) {

  if (score >= 8) {
    return `
    You seem to be driven mainly by genuine interest and personal meaning.
    When something feels important or engaging to you, effort comes naturally.
    This type of motivation usually supports long-term satisfaction and deeper learning.
    `;
  }

  if (score <= 4) {
    return `
    You may not always feel internally connected to your tasks.
    Sometimes activities may feel more like obligations than personal interests.
    Exploring what truly excites or challenges you could strengthen this inner drive.
    `;
  }

  return `
  Your internal motivation appears fairly balanced.
  You may feel interested in some areas while relying on structure in others.
  Reflecting on what personally matters to you can help maintain clarity.
  `;
}
function interpretExtrinsic(score) {

  if (score >= 8) {
    return `
    External goals, recognition, deadlines, or expectations may strongly influence your effort.
    Clear structure and accountability likely help you stay focused and productive.
    Combining this with personal meaning can make your motivation even stronger.
    `;
  }

  if (score <= 4) {
    return `
    External rewards or pressures may not strongly influence your motivation.
    You might rely more on personal interest than external validation.
    In structured environments, setting clear goals may help maintain direction.
    `;
  }

  return `
  You seem to respond moderately to external expectations and structure.
  Depending on the situation, deadlines or rewards may support your effort.
  `;
}
function interpretAmotivation(score) {

  if (score >= 8) {
    return `
    You may sometimes feel disconnected from your tasks or unsure about the purpose behind them.
    This can make starting or sustaining effort more difficult.
    Clarifying goals and reconnecting with personal meaning may help restore momentum.
    `;
  }

  if (score <= 4) {
    return `
    You generally do not appear disengaged from your work.
    Even when tasks feel challenging, you likely find some reason to continue.
    `;
  }

  return `
  You may occasionally feel uncertain about your direction,
  but this does not appear to dominate your overall motivation.
  Periodic reflection can help maintain clarity.
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
      "Content-Type": "application/json"
    },
    body: JSON.stringify(sessionState)
  })
  .then(res => res.text())
  .then(data => console.log("Backend:", data))
  .catch(err => console.error("Backend error:", err));
}
// ---------------- START ----------------

if (sessionState.completedTests.length > 0) {
    renderDashboard();
} else {
    renderConsent();
}
