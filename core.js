export function render(content) {
  document.getElementById("app").innerHTML = `
    <div class="card">${content}</div>
  `;
}
