"use strict";

const assert = require("node:assert/strict");
const { scales } = require("../scoring.js");

const personality = scales.personality.score([1, 5, 1, 1, 1, 5, 1, 5, 5, 5]);
assert.deepEqual(personality.domains, {
  extraversion: 5,
  agreeableness: 5,
  conscientiousness: 5,
  emotionalReactivity: 5,
  openness: 5
});

assert.equal(scales.happiness.score([7, 7, 7, 1]).average, 7);
assert.equal(scales.happiness.score([1, 1, 1, 7]).average, 1);

assert.equal(scales.stress.score([4, 0, 0, 4]).total, 16);
assert.equal(scales.stress.score([0, 4, 4, 0]).total, 0);

const emotional = scales.emotionalSkills.score(Array(10).fill(5));
assert.equal(emotional.average, 5);
assert.deepEqual(emotional.domains, { awareness: 5, selfManagement: 5, empathy: 5 });

const motivation = scales.motivation.score([7, 1, 1, 1, 1, 7, 7, 1, 1, 1, 1, 1]);
assert.equal(motivation.domains.intrinsic, 7);
assert.equal(motivation.domains.identified, 1);
assert.equal(motivation.dominant, "intrinsic");

assert.throws(() => scales.stress.score([0, 1]), /Unexpected response count/);
assert.throws(() => scales.happiness.score([8, 1, 1, 1]), /Invalid response value/);

console.log("MindPop scoring tests passed.");
