import { sessionState, WEB_APP_URL } from "./state.js";
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
