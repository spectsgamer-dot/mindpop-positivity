"use strict";

/*
 * Server-side scoring is authoritative. Client-provided score objects are ignored.
 * These functions mirror the audited scoring.js implementation in the website.
 */

function scoreAssessment_(assessmentId, responses) {
  if (assessmentId === "personality") return scorePersonality_(responses);
  if (assessmentId === "emotionalSkills") return scoreEmotionalSkills_(responses);
  if (assessmentId === "happiness") return scoreHappiness_(responses);
  if (assessmentId === "stress") return scoreStress_(responses);
  if (assessmentId === "motivation") return scoreMotivation_(responses);
  throw new Error("INVALID_ASSESSMENT_ID");
}

function scorePersonality_(responses) {
  const reverseIndexes = [0, 2, 3, 4, 6];
  const keyed = responses.map(function(value, index) {
    return reverseIndexes.indexOf(index) >= 0 ? reverseScore_(value, 1, 5) : value;
  });
  return {
    kind: "profile",
    domains: {
      extraversion: round2_(mean_([keyed[0], keyed[5]])),
      agreeableness: round2_(mean_([keyed[1], keyed[6]])),
      conscientiousness: round2_(mean_([keyed[2], keyed[7]])),
      emotionalReactivity: round2_(mean_([keyed[3], keyed[8]])),
      openness: round2_(mean_([keyed[4], keyed[9]]))
    }
  };
}

function scoreEmotionalSkills_(responses) {
  return {
    kind: "average",
    average: round2_(mean_(responses)),
    domains: {
      awareness: round2_(mean_([responses[0], responses[5]])),
      selfManagement: round2_(mean_([
        responses[1], responses[2], responses[6], responses[8], responses[9]
      ])),
      empathy: round2_(mean_([responses[3], responses[4], responses[7]]))
    }
  };
}

function scoreHappiness_(responses) {
  const keyed = responses.slice();
  keyed[3] = reverseScore_(keyed[3], 1, 7);
  return { kind: "average", average: round2_(mean_(keyed)) };
}

function scoreStress_(responses) {
  const keyed = responses.slice();
  keyed[1] = reverseScore_(keyed[1], 0, 4);
  keyed[2] = reverseScore_(keyed[2], 0, 4);
  return { kind: "total", total: keyed.reduce(function(sum, value) { return sum + value; }, 0) };
}

function scoreMotivation_(responses) {
  const domains = {
    intrinsic: round2_(mean_([responses[0], responses[5], responses[6]])),
    identified: round2_(mean_([responses[1], responses[10]])),
    introjected: round2_(mean_([responses[2], responses[7]])),
    external: round2_(mean_([responses[3], responses[8]])),
    amotivation: round2_(mean_([responses[4], responses[9], responses[11]]))
  };
  const ranking = Object.keys(domains).sort(function(left, right) {
    return domains[right] - domains[left];
  });
  return {
    kind: "profile",
    domains: domains,
    dominant: ranking[0],
    runnerUp: ranking[1]
  };
}

function mean_(values) {
  return values.reduce(function(sum, value) { return sum + value; }, 0) / values.length;
}

function reverseScore_(value, min, max) {
  return min + max - value;
}

function round2_(value) {
  return Number(value.toFixed(2));
}
