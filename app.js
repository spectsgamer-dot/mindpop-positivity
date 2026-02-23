import { sessionState, persistSession, summarySubmitted } from "./state.js";
import { scales } from "./scales.js";
import { startTest } from "./testEngine.js";
import { render } from "./core.js";
import { submitTest } from "./scoring.js";
  
// ---------------- UTILITY ----------------

function generateAnonId() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${timestamp}-${random}`;
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
  <h3>Psychological Profile Overview</h3>
  <p>${fullNarrative}</p>
</div>
`;

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
        
function restartAssessment() {
  localStorage.removeItem("mindpop_session");
  location.reload();
}

// ---------------- START ----------------

if (sessionState.completedTests.length > 0) {
    renderDashboard();
} else {
    renderConsent();
}
