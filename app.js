const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5Bpoz5nQ0FwtL9v7WPKSBn3su_xqtXbLzJe74Lx8KtXWMRdreZXwyp3zNVeCUQTw/exec";

let sessionState = {
  anonId: "",
  demographics: {},
  demographicsLocked: false,
  completedTests: [],
  scores: {}
};

// ---------- Utility ----------

function generateAnonId() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${timestamp}-${random}`;
}

function clearApp() {
  document.getElementById("app").innerHTML = "";
}

function showCard(content) {
  clearApp();
  document.getElementById("app").innerHTML = `
    <div class="card">
      ${content}
    </div>
  `;
}

// ---------- Consent ----------

function renderConsent() {
  showCard(`
    <h2>😊 Welcome to MindPop</h2>
    <p>
      This assessment aims to understand the emotional and well-being profile of our university community.
      Your responses are anonymous and used only for academic analysis.
    </p>
    <p>
      Participation is voluntary. This is not a clinical diagnosis.
    </p>
    <button onclick="acceptConsent()">I Agree</button>
    <button onclick="declineConsent()">I Do Not Agree</button>
  `);
}

function acceptConsent() {
  sessionState.anonId = generateAnonId();
  renderDemographics();
}

function declineConsent() {
  showCard(`
    <h2>😔 Consent Required</h2>
    <p>You must provide consent to participate in this assessment.</p>
    <button onclick="renderConsent()">Go Back</button>
  `);
}

// ---------- Demographics ----------

function renderDemographics() {
  showCard(`
    <h2>Basic Details</h2>

    <label>Name (Optional)</label><br>
    <input id="name" /><br><br>

    <label>Gender</label><br>
    <select id="gender">
      <option value="">Select</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select><br><br>

    <label>Department</label><br>
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
    </select><br><br>

    <label>Pursuing</label><br>
    <select id="pursuing">
      <option value="">Select</option>
      <option>Undergraduate</option>
      <option>Postgraduate</option>
    </select><br><br>

    <label>Year</label><br>
    <select id="year">
      <option value="">Select</option>
      <option>1st Year</option>
      <option>2nd Year</option>
      <option>3rd Year</option>
      <option>4th Year</option>
    </select><br><br>

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

// ---------- Dashboard ----------

function renderDashboard() {
  let completionInfo = `
    <p>Completed Tests: ${sessionState.completedTests.length}/5</p>
  `;

  showCard(`
    <h2>Assessment Dashboard</h2>
    ${completionInfo}
    <button onclick="startTest('Personality')">Personality</button><br><br>
    <button onclick="startTest('Emotional_Intelligence')">Emotional Intelligence</button><br><br>
    <button onclick="startTest('Happiness')">Happiness</button><br><br>
    <button onclick="startTest('Stress')">Stress</button><br><br>
    <button onclick="startTest('Motivation')">Motivation</button><br><br>
    <button onclick="endAssessment()">Finish Assessment</button>
  `);
}

// ---------- Placeholder Test Start ----------

function startTest(testName) {
  if (!sessionState.demographicsLocked) {
    sessionState.demographicsLocked = true;
  }

  alert("Test engine coming next phase: " + testName);
}

// ---------- End Assessment ----------

function endAssessment() {
  alert("Final Summary engine coming next phase.");
}

// ---------- Start App ----------

renderConsent();
