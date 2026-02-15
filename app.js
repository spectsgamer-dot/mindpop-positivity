const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5Bpoz5nQ0FwtL9v7WPKSBn3su_xqtXbLzJe74Lx8KtXWMRdreZXwyp3zNVeCUQTw/exec";

// ------------------ SESSION STATE ------------------

let sessionState = {
  anonId: "",
  demographics: {},
  demographicsLocked: false,
  completedTests: [],
  scores: {}
};

// ------------------ SCALE DEFINITIONS ------------------

const scales = {

  Personality: {
    items: 10,
    likert: 5,
    reverse: [2,4,6,8,10],
    labels: ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"],
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
    labels: ["Strongly Disagree","Disagree","Neutral","Agree","Strongly Agree"],
    questions: [
      "I am aware of my emotions as I experience them.",
      "I can regulate my emotions effectively.",
      "I understand why I feel the way I do.",
      "I can handle stressful situations calmly.",
      "I am sensitive to others’ feelings.",
      "I can motivate myself to overcome challenges.",
      "I recognize emotions in others easily.",
      "I can control my anger when needed.",
      "I express my emotions appropriately.",
      "I use emotions to enhance my performance."
    ]
  },

  Happiness: {
    items: 4,
    likert: 7,
    reverse: [4],
    labels: ["1","2","3","4","5","6","7"],
    questions: [
      "In general, I consider myself a happy person.",
      "Compared with most of my peers, I consider myself happy.",
      "Some people are generally very happy. I am one of those people.",
      "Some people are generally not very happy. I am not one of them."
    ]
  },

  Stress: {
    items: 4,
    likert: 5,
    reverse: [2,3],
    labels: ["Never","Almost Never","Sometimes","Fairly Often","Very Often"],
    questions: [
      "In the last month, how often have you felt unable to control important things in your life?",
      "In the last month, how often have you felt confident about handling personal problems?",
      "In the last month, how often have you felt that things were going your way?",
      "In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?"
    ]
  },

  Motivation: {
    items: 12,
    likert: 7,
    reverse: [],
    labels: ["Strongly Disagree","Disagree","Slightly Disagree","Neutral","Slightly Agree","Agree","Strongly Agree"],
    questions: [
      "I study because I enjoy learning new things.",
      "I study because education is important for my goals.",
      "I study because I would feel guilty if I did not.",
      "I study because others expect me to.",
      "I study because it is fun.",
      "I study because it helps me achieve personal growth.",
      "I study because I want recognition from others.",
      "I study because of external rewards.",
      "I study because I find it interesting.",
      "I study because it aligns with my values.",
      "I study because I feel pressure to succeed.",
      "I study because I do not know why I am doing it."
    ]
  }

};

// ------------------ UTILITY ------------------

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
  document.getElementById("app").innerHTML = `<div class="card">${content}</div>`;
}
// ------------------ TEST ENGINE ------------------

function startTest(testName) {

  if (!sessionState.demographicsLocked) {
    sessionState.demographicsLocked = true;
  }

  const scale = scales[testName];

  let progressBar = `
    <div class="progress-bar">
      <div class="progress-fill" id="progressFill"></div>
    </div>
  `;

  let questionsHTML = "";

  scale.questions.forEach((q, index) => {

    let options = "";

    for (let i = 1; i <= scale.likert; i++) {
      options += `
        <label>
          <input type="radio" name="q${index}" value="${i}" onclick="updateProgress(${index + 1}, ${scale.items})">
          ${scale.labels[i - 1]}
        </label><br>
      `;
    }

    questionsHTML += `
      <div style="margin-bottom:20px;">
        <p><strong>${index + 1}. ${q}</strong></p>
        ${options}
      </div>
    `;
  });

  showCard(`
    <h2>${testName.replace("_"," ")}</h2>
    ${progressBar}
    <form id="testForm">
      ${questionsHTML}
      <button type="button" onclick="submitTest('${testName}')">Submit Test</button>
    </form>
  `);
}

function updateProgress(answered, total) {
  const radios = document.querySelectorAll("input[type=radio]:checked");
  const answeredQuestions = new Set();

  radios.forEach(r => {
    answeredQuestions.add(r.name);
  });

  const percent = (answeredQuestions.size / total) * 100;
  document.getElementById("progressFill").style.width = percent + "%";
}

function submitTest(testName) {

  const scale = scales[testName];
  const form = document.getElementById("testForm");
  const data = new FormData(form);

  let responses = [];
  let missing = false;

  for (let i = 0; i < scale.items; i++) {
    const value = data.get("q" + i);
    if (!value) {
      missing = true;
    }
    responses.push(Number(value));
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

  let totalScore = responses.reduce((a,b) => a + b, 0);

  sessionState.scores[testName] = totalScore;
  sessionState.completedTests.push(testName);

  showResult(testName, totalScore);
}

function showResult(testName, score) {
  showCard(`
    <h2>${testName.replace("_"," ")} Result</h2>
    <p>Your Score: ${score}</p>
    <button onclick="renderDashboard()">Go Back to Dashboard</button>
    <button onclick="endAssessment()">Finish Assessment</button>
  `);
}
renderConsent();
