// js/state.js

export const WEB_APP_URL = "xyxz/exedc";

export let summarySubmitted = false;

export let sessionState = JSON.parse(localStorage.getItem("mindpop_session")) || {
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

export function persistSession() {
  localStorage.setItem("mindpop_session", JSON.stringify(sessionState));
}

export function resetSession() {
  localStorage.removeItem("mindpop_session");
  location.reload();
}
