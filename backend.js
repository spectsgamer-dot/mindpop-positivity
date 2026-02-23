import { sessionState, WEB_APP_URL } from "./state.js";
function sendToBackend() {
  const endpoint = "https://script.google.com/macros/s/AKfycbxAf9J8x33TAGFVjLgzKe8vgb0SseC95TnGzSq4ZI22pdB7kO0g_oVhKQpwyzta2rjY/exec";

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
  const endpoint = "https://script.google.com/macros/s/AKfycbxAf9J8x33TAGFVjLgzKe8vgb0SseC95TnGzSq4ZI22pdB7kO0g_oVhKQpwyzta2rjY/exec";

  fetch(endpoint)
    .then(res => res.json())
    .then(data => console.log(data));
}
