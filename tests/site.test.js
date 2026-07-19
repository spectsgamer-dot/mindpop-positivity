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

assert.match(app, /id="name" name="name"[^>]+required/);
assert.match(app, /id="gender" name="gender" required/);
assert.match(app, /Faculty of/);
assert.match(app, /Allied and Healthcare Sciences/);
assert.match(app, /"Diploma", "PhD"/);
assert.match(app, /role === "Undergraduate".*Year 4/);
assert.match(app, /role === "Postgraduate" \|\| role === "Diploma"/);
assert.match(app, /recordType: "assessment-progress"/);
assert.match(app, /void sendProgress\(scaleId\)/);
assert.match(app, /submissionStatus: "saving"/);
assert.match(app, /Share or save my report/);
assert.match(app, /No name or raw answers included/);

assert.match(app, /credentials:\s*"omit"/);
assert.match(app, /referrerPolicy:\s*"no-referrer"/);
assert.match(app, /localStorage\.removeItem\("mindpop_session_v2"\)/);
assert.match(css, /prefers-reduced-motion/);
assert.match(css, /\.vibe-report/);

for (const file of sourceFiles) {
  const text = read(file);
  assert.equal(/[^\x00-\x7F]/.test(text), false, file + " should remain ASCII-safe");
}

console.log("MindPop site security and workflow checks passed.");
