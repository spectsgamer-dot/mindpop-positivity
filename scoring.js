import { scales } from "./scales.js";
import { sessionState, persistSession } from "./state.js";
import { render } from "./core.js";
import {
  generateEINarrative,
  generateStressNarrative,
  generateHappinessNarrative,
  generateMotivationNarrative
} from "./narratives.js";
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
export { submitTest };
