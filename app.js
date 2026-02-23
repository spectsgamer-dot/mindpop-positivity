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
            narrative += "Elevated stress combined with developing emotional regulation skills may increase internal strain during demanding periods. Strengthening reflective coping strategies could meaningfully improve balance. ";
        }

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
            growth.push("Elevated stress activation may impact clarity and energy if sustained. Recovery planning may help stabilize functioning.");
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
            growth.push("Reduced motivational activation. Clarifying personal goals and reconnecting with purpose may restore engagement.");
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

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let regulationImpact = "";
    let growthFocus = "";

    if (totalEI <= 25) {

        interpretation = "Your responses suggest that emotional awareness and regulation may currently require more conscious effort.";

        academicImpact = "During academic pressure, emotional shifts may influence concentration, decision-making, or persistence.";

        socialImpact = "Interpersonal misunderstandings may occur occasionally, especially in emotionally charged situations.";

        regulationImpact = "Emotional responses may feel intense or harder to modulate in high-demand moments.";

        growthFocus = "Emotional skills are highly developable. Practicing emotion labeling, reflective pauses, and feedback-based learning can strengthen regulation capacity over time.";

    } else if (totalEI <= 38) {

        interpretation = "You demonstrate functional emotional awareness across most everyday situations.";

        academicImpact = "You likely manage routine stress adaptively, though highly complex or ambiguous situations may still feel demanding.";

        socialImpact = "You appear generally responsive to others’ emotions, supporting stable peer interactions.";

        regulationImpact = "Your emotional regulation system appears steady, with room for refinement in high-pressure environments.";

        growthFocus = "Further strengthening perspective-taking and structured emotional reflection may enhance resilience and leadership capacity.";

    } else {

        interpretation = "Your responses suggest strong emotional awareness and regulation skills.";

        academicImpact = "You are likely able to sustain focus and adapt under pressure without significant emotional disruption.";

        socialImpact = "You may naturally navigate interpersonal situations with sensitivity and composure.";

        regulationImpact = "Your emotional processing appears flexible and well-modulated.";

        growthFocus = "Continuing reflective practices and mentorship roles may help you further integrate these strengths into leadership contexts.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationImpact}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
function generateHappinessNarrative(totalHappiness) {

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let resiliencePattern = "";
    let growthFocus = "";

    if (totalHappiness <= 12) {

        interpretation = "Your responses suggest reduced subjective wellbeing at this time.";

        academicImpact = "Lower positive affect can influence energy levels, motivation, and cognitive flexibility during academic tasks.";

        socialImpact = "You may feel less socially engaged or emotionally uplifted in daily interactions.";

        resiliencePattern = "Positive emotional buffering may currently be limited.";

        growthFocus = "Small, consistent positive activities and supportive peer interaction can gradually enhance daily wellbeing.";

    } else if (totalHappiness <= 20) {

        interpretation = "Your responses indicate moderate life satisfaction.";

        academicImpact = "Emotional balance appears stable, though fluctuations may occur during high-demand periods.";

        socialImpact = "You likely maintain generally stable social engagement.";

        resiliencePattern = "Positive emotion appears present but may vary with situational stress.";

        growthFocus = "Intentional positive reinforcement and meaningful engagement can strengthen overall satisfaction.";

    } else {

        interpretation = "Your responses reflect strong subjective wellbeing.";

        academicImpact = "Positive emotional states often support creativity, persistence, and adaptive thinking.";

        socialImpact = "You may naturally contribute positive emotional tone within peer environments.";

        resiliencePattern = "Higher positive affect often buffers against stress-related disruption.";

        growthFocus = "Sustaining balanced routines will help maintain this level of wellbeing.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Resilience Pattern:</strong> ${resiliencePattern}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}

function generateStressNarrative(totalStress) {

    let interpretation = "";
    let academicImpact = "";
    let socialImpact = "";
    let regulationImpact = "";
    let growthFocus = "";

    if (totalStress <= 4) {

        interpretation = "You currently report low perceived stress levels. Daily demands appear manageable within your coping capacity.";

        academicImpact = "This level of stress typically supports steady concentration and consistent academic performance.";

        socialImpact = "Lower stress often allows greater patience and flexibility in interpersonal interactions.";

        regulationImpact = "Your current stress regulation system appears balanced and adaptive.";

        growthFocus = "Maintaining recovery habits (sleep, structured breaks, reflective pauses) will help sustain this stability.";

    } else if (totalStress <= 9) {

        interpretation = "Your responses suggest moderate perceived stress, which is common during academic cycles.";

        academicImpact = "Short-term stress may enhance motivation, though prolonged pressure could begin to affect focus and memory efficiency.";

        socialImpact = "You may notice reduced emotional bandwidth during busy periods.";

        regulationImpact = "Stress levels appear within adaptive range, though recovery routines become increasingly important.";

        growthFocus = "Building small recovery anchors (structured planning, scheduled breaks, brief emotional check-ins) may improve balance.";

    } else {

        interpretation = "Your responses indicate elevated perceived stress at this time.";

        academicImpact = "Sustained stress may influence concentration, task initiation, and mental clarity if not addressed.";

        socialImpact = "Higher stress levels can reduce emotional availability and increase irritability under pressure.";

        regulationImpact = "Your stress-response system may currently be working at high activation.";

        growthFocus = "Introducing structured recovery practices and seeking supportive conversations may help restore equilibrium.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Interpersonal Context:</strong> ${socialImpact}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationImpact}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
function generateMotivationNarrative(data) {

    const { intrinsic, extrinsic, amotivation } = data;

    let interpretation = "";
    let academicImpact = "";
    let engagementPattern = "";
    let regulationPattern = "";
    let growthFocus = "";

    // 🔹 Amotivation Dominant
    if (amotivation > intrinsic && amotivation > extrinsic) {

        interpretation = "Your responses suggest reduced motivational activation at this time.";

        academicImpact = "You may find it harder to initiate tasks or sustain effort, particularly when work feels disconnected from personal meaning.";

        engagementPattern = "Motivation may feel externally pressured or unclear rather than internally driven.";

        regulationPattern = "Energy levels may fluctuate, especially during periods of academic overload.";

        growthFocus = "Clarifying personal goals, reconnecting with purpose, and breaking tasks into smaller actionable steps may gradually restore engagement.";

    }

    // 🔹 Intrinsic Dominant
    else if (intrinsic > extrinsic && intrinsic > amotivation) {

        interpretation = "Your motivation appears primarily driven by internal interest and personal value.";

        academicImpact = "You are likely to engage more deeply in tasks that feel meaningful or intellectually stimulating.";

        engagementPattern = "Curiosity and self-direction appear to guide your effort patterns.";

        regulationPattern = "Internal motivation often supports persistence even during moderate stress.";

        growthFocus = "Maintaining alignment between coursework and personal interests may sustain long-term academic satisfaction.";

    }

    // 🔹 Extrinsic Dominant
    else if (extrinsic > intrinsic && extrinsic > amotivation) {

        interpretation = "External structure and outcomes appear to significantly influence your engagement.";

        academicImpact = "Clear deadlines, evaluation criteria, and accountability systems may enhance your productivity.";

        engagementPattern = "Performance expectations and recognition may play a meaningful role in sustaining effort.";

        regulationPattern = "Motivation may fluctuate if structure or feedback is inconsistent.";

        growthFocus = "Integrating personal meaning alongside external goals may strengthen long-term resilience.";

    }

    // 🔹 Balanced Profile
    else {

        interpretation = "Your motivation profile reflects a balanced integration of internal interest and external structure.";

        academicImpact = "You likely adapt your effort patterns depending on context and expectations.";

        engagementPattern = "Both personal value and performance standards contribute to your drive.";

        regulationPattern = "Balanced motivation can support sustainable engagement across academic cycles.";

        growthFocus = "Periodic reflection on goals may help maintain clarity and direction.";
    }

    return `
        <p>${interpretation}</p>
        <p><strong>Academic Context:</strong> ${academicImpact}</p>
        <p><strong>Engagement Pattern:</strong> ${engagementPattern}</p>
        <p><strong>Regulation Pattern:</strong> ${regulationPattern}</p>
        <p><strong>Growth Focus:</strong> ${growthFocus}</p>
    `;
}
function restartAssessment() {
  localStorage.removeItem("mindpop_session");
  location.reload();
}

function sendToBackend() {
  const endpoint = "xyxz/exedc";

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
  const endpoint = "xyxz/exedc";

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
