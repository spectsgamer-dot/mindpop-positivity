"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { scales } = require("../scoring.js");

const root = path.resolve(__dirname, "..");
const read = (file) => fs.readFileSync(path.join(root, file), "utf8");
const html = read("index.html");
const app = read("app.js");
const config = read("config.js");
const css = read("styles.css");
const sourceFiles = ["index.html", "config.js", "scoring.js", "app.js", "styles.css"];

assert.deepEqual(Object.keys(scales), ["personality", "emotionalSkills", "happiness", "stress", "motivation"]);
assert.deepEqual(Object.values(scales).map((scale) => scale.questions.length), [10, 10, 4, 4, 12]);

assert.match(html, /Content-Security-Policy/);
assert.match(html, /connect-src 'self'/);
assert.doesNotMatch(html, /unsafe-inline|unsafe-eval|script\.google\.com/);
assert.doesNotMatch(html + app, /\son(?:click|change|submit)=/i);
assert.doesNotMatch(html + app, /style=/i);

assert.match(config, /submissionEndpoint:\s*""/);
assert.match(config, /allowDirectAppsScript:\s*false/);
assert.doesNotMatch(config + app, /AKfy[a-zA-Z0-9_-]+/);
assert.doesNotMatch(html + app, /id=["']phone|name=["']phone/i);
assert.doesNotMatch(html + app, /id=["']name|name=["']name/i);

assert.match(app, /credentials:\s*"omit"/);
assert.match(app, /referrerPolicy:\s*"no-referrer"/);
assert.match(app, /localStorage\.removeItem\("mindpop_session"\)/);
assert.match(css, /prefers-reduced-motion/);

for (const file of sourceFiles) {
  const text = read(file);
  assert.equal(/[^\x00-\x7F]/.test(text), false, file + " should remain ASCII-safe");
}

console.log("MindPop site security checks passed.");
