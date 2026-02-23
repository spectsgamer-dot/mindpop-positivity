import { scales } from "./scales.js";
import { render } from "./core.js";

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

  export { startTest };

  
}
