const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbxA5Bpoz5nQ0FwtL9v7WPKSBn3su_xqtXbLzJe74Lx8KtXWMRdreZXwyp3zNVeCUQTw/exec";

let sessionState = {
  anonId: "",
  demographics: {},
  completedTests: [],
  scores: {}
};

function generateAnonId() {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, "");
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${timestamp}-${random}`;
}

function renderConsent() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card">
      <h2>😊 Welcome to MindPop</h2>
      <p>
        This assessment aims to understand the emotional and well-being profile of our university community.
        Participation is voluntary and anonymous.
      </p>
      <button onclick="acceptConsent()">I Agree</button>
      <button onclick="declineConsent()">I Do Not Agree</button>
    </div>
  `;
}

function acceptConsent() {
  sessionState.anonId = generateAnonId();
  renderDemographics();
}

function declineConsent() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card">
      <h2>😔 Participation Required</h2>
      <p>You must provide consent to proceed.</p>
      <button onclick="renderConsent()">Go Back</button>
    </div>
  `;
}

function renderDemographics() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card">
      <h2>Basic Details</h2>
      <input id="name" placeholder="Name (optional)" /><br><br>
      <button onclick="saveDemographics()">Continue</button>
    </div>
  `;
}

function saveDemographics() {
  sessionState.demographics.name = document.getElementById("name").value;
  renderDashboard();
}

function renderDashboard() {
  const app = document.getElementById("app");
  app.innerHTML = `
    <div class="card">
      <h2>Test Dashboard</h2>
      <button onclick="alert('Next Phase')">Personality</button>
    </div>
  `;
}

renderConsent();
