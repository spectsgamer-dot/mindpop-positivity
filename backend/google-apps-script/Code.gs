"use strict";

const MINDPOP = Object.freeze({
  schemaVersion: 3,
  participantSheet: "Participants",
  recordSheet: "Assessment_Records",
  maxBodyBytes: 30000,
  participantHeaders: Object.freeze([
    "created_at", "updated_at", "participant_id", "name", "faculty", "role", "year", "gender",
    "consented_at", "started_at", "tests_completed", "all_complete",
    "personality_completed_at", "personality_extraversion", "personality_agreeableness",
    "personality_conscientiousness", "personality_emotional_reactivity", "personality_openness",
    "emotional_skills_completed_at", "emotional_skills_overall", "emotional_awareness",
    "emotional_self_management", "emotional_empathy",
    "happiness_completed_at", "happiness_score",
    "stress_completed_at", "stress_score",
    "motivation_completed_at", "motivation_intrinsic", "motivation_identified",
    "motivation_introjected", "motivation_external", "motivation_amotivation",
    "motivation_dominant", "last_submission_id"
  ]),
  recordHeaders: Object.freeze([
    "received_at", "submission_id", "participant_id", "assessment_id", "assessment_source",
    "assessment_completed_at", "progress_completed", "progress_total", "all_complete",
    "app_version", "consented_at", "started_at",
    "q01", "q02", "q03", "q04", "q05", "q06", "q07", "q08", "q09", "q10", "q11", "q12",
    "server_score_json", "client_language", "timezone_offset_minutes"
  ]),
  faculties: Object.freeze([
    "Humanities & Social Sciences", "Sciences", "Allied and Healthcare Sciences",
    "Pharmaceutical Sciences", "Engineering", "Computer Technology",
    "Nursing", "Physiotherapy & Rehabilitation", "Commerce & Management",
    "Agriculture Sciences & Technology", "Non-Teaching Staff"
  ]),
  roles: Object.freeze(["Undergraduate", "Postgraduate", "Diploma", "PhD", "Faculty", "Staff"]),
  genders: Object.freeze(["Woman", "Man", "Non-binary", "Prefer to self-describe", "Prefer not to say"]),
  scales: Object.freeze({
    personality: Object.freeze({ count: 10, min: 1, max: 5, source: "BFI-10" }),
    emotionalSkills: Object.freeze({ count: 10, min: 1, max: 5, source: "Informal reflection set" }),
    happiness: Object.freeze({ count: 4, min: 1, max: 7, source: "Subjective Happiness Scale" }),
    stress: Object.freeze({ count: 4, min: 0, max: 4, source: "PSS-4" }),
    motivation: Object.freeze({ count: 12, min: 1, max: 7, source: "Adapted SDT reflection set" })
  })
});

function setupMindPopWorkbook() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) throw new Error("Open this script from the target Google Sheet.");
  ensureSheet_(spreadsheet, MINDPOP.participantSheet, MINDPOP.participantHeaders);
  ensureSheet_(spreadsheet, MINDPOP.recordSheet, MINDPOP.recordHeaders);
  PropertiesService.getScriptProperties().setProperty("SPREADSHEET_ID", spreadsheet.getId());
  SpreadsheetApp.flush();
  return "MindPop sheets are ready. Add the PROXY_SECRET Script Property before deploying.";
}

function doGet() {
  return jsonResponse_({ ok: true, service: "mindpop-responses", schemaVersion: MINDPOP.schemaVersion });
}

function doPost(event) {
  const requestId = Utilities.getUuid();
  let lock;
  try {
    const raw = event && event.postData && event.postData.contents;
    if (!raw || raw.length > MINDPOP.maxBodyBytes) throw new Error("INVALID_BODY");
    const body = JSON.parse(raw);
    authorizeProxy_(body.proxySecret);
    const data = validatePayload_(body);
    const score = scoreAssessment_(data.assessment.id, data.assessment.responses);

    lock = LockService.getScriptLock();
    lock.waitLock(10000);

    const spreadsheet = openConfiguredSpreadsheet_();
    const participants = ensureSheet_(spreadsheet, MINDPOP.participantSheet, MINDPOP.participantHeaders);
    const records = ensureSheet_(spreadsheet, MINDPOP.recordSheet, MINDPOP.recordHeaders);

    if (findRowByValue_(records, 2, data.submissionId)) {
      return jsonResponse_({
        ok: true,
        duplicate: true,
        submissionId: data.submissionId,
        assessmentId: data.assessment.id
      });
    }

    appendAssessment_(records, data, score);
    const progress = upsertParticipant_(participants, data, score);

    return jsonResponse_({
      ok: true,
      duplicate: false,
      submissionId: data.submissionId,
      assessmentId: data.assessment.id,
      testsCompleted: progress.testsCompleted,
      allComplete: progress.allComplete
    });
  } catch (error) {
    console.error(requestId + " " + String(error && error.message || "SERVER_ERROR"));
    return jsonResponse_({ ok: false, error: publicErrorCode_(error), requestId: requestId });
  } finally {
    if (lock && lock.hasLock()) lock.releaseLock();
  }
}

function validatePayload_(body) {
  assertObject_(body, "payload");
  rejectUnknownKeys_(body, [
    "recordType", "schemaVersion", "appVersion", "submissionId", "participantId",
    "consentedAt", "startedAt", "profile", "assessment", "progress", "client", "proxySecret"
  ], "payload");

  if (body.recordType !== "assessment-progress") throw new Error("INVALID_RECORD_TYPE");
  if (body.schemaVersion !== MINDPOP.schemaVersion) throw new Error("INVALID_SCHEMA_VERSION");

  const submissionId = assertId_(body.submissionId, "submissionId");
  const participantId = assertId_(body.participantId, "participantId");
  const appVersion = assertString_(body.appVersion, "appVersion", 1, 20);
  const consentedAt = assertDate_(body.consentedAt, "consentedAt");
  const startedAt = assertDate_(body.startedAt, "startedAt");

  assertObject_(body.profile, "profile");
  rejectUnknownKeys_(body.profile, ["name", "faculty", "role", "year", "gender"], "profile");
  const profile = {
    name: assertString_(body.profile.name, "profile.name", 1, 80).trim(),
    faculty: assertEnum_(body.profile.faculty, MINDPOP.faculties, "profile.faculty"),
    role: assertEnum_(body.profile.role, MINDPOP.roles, "profile.role"),
    year: String(body.profile.year || ""),
    gender: assertEnum_(body.profile.gender, MINDPOP.genders, "profile.gender")
  };
  validateYear_(profile.role, profile.year);

  assertObject_(body.assessment, "assessment");
  rejectUnknownKeys_(body.assessment, ["id", "source", "responses", "score", "completedAt"], "assessment");
  const scale = MINDPOP.scales[body.assessment.id];
  if (!scale) throw new Error("INVALID_ASSESSMENT_ID");
  if (body.assessment.source !== scale.source) throw new Error("INVALID_ASSESSMENT_SOURCE");
  if (!Array.isArray(body.assessment.responses) || body.assessment.responses.length !== scale.count) {
    throw new Error("INVALID_RESPONSE_COUNT");
  }
  const responses = body.assessment.responses.map(function(value) {
    if (!Number.isInteger(value) || value < scale.min || value > scale.max) {
      throw new Error("INVALID_RESPONSE_VALUE");
    }
    return value;
  });
  const assessment = {
    id: body.assessment.id,
    source: body.assessment.source,
    responses: responses,
    completedAt: assertDate_(body.assessment.completedAt, "assessment.completedAt")
  };

  assertObject_(body.progress, "progress");
  rejectUnknownKeys_(body.progress, ["completed", "total", "isComplete"], "progress");
  if (!Number.isInteger(body.progress.completed) || body.progress.completed < 1 || body.progress.completed > 5) {
    throw new Error("INVALID_PROGRESS");
  }
  if (body.progress.total !== 5 || typeof body.progress.isComplete !== "boolean") throw new Error("INVALID_PROGRESS");
  if (body.progress.isComplete !== (body.progress.completed === 5)) throw new Error("INVALID_PROGRESS");

  const client = body.client || {};
  assertObject_(client, "client");
  rejectUnknownKeys_(client, ["language", "timezoneOffsetMinutes"], "client");
  const language = client.language ? assertString_(client.language, "client.language", 1, 30) : "";
  const offset = Number(client.timezoneOffsetMinutes || 0);
  if (!Number.isFinite(offset) || offset < -840 || offset > 840) throw new Error("INVALID_TIMEZONE");

  return {
    appVersion: appVersion,
    submissionId: submissionId,
    participantId: participantId,
    consentedAt: consentedAt,
    startedAt: startedAt,
    profile: profile,
    assessment: assessment,
    progress: {
      completed: body.progress.completed,
      total: body.progress.total,
      isComplete: body.progress.isComplete
    },
    client: { language: language, timezoneOffsetMinutes: offset }
  };
}

function appendAssessment_(sheet, data, score) {
  const responses = data.assessment.responses.slice();
  while (responses.length < 12) responses.push("");
  const row = [
    new Date(), data.submissionId, data.participantId, data.assessment.id,
    data.assessment.source, data.assessment.completedAt,
    data.progress.completed, data.progress.total, data.progress.isComplete,
    data.appVersion, data.consentedAt, data.startedAt
  ].concat(responses.slice(0, 12), [
    JSON.stringify(score), data.client.language, data.client.timezoneOffsetMinutes
  ]);
  sheet.appendRow(row);
}

function upsertParticipant_(sheet, data, score) {
  const headers = MINDPOP.participantHeaders;
  const index = headerIndex_(headers);
  let rowNumber = findRowByValue_(sheet, index.participant_id + 1, data.participantId);
  let row = rowNumber ? sheet.getRange(rowNumber, 1, 1, headers.length).getValues()[0] : new Array(headers.length).fill("");
  const now = new Date();

  if (!rowNumber) {
    rowNumber = Math.max(sheet.getLastRow() + 1, 2);
    row[index.created_at] = now;
  }
  row[index.updated_at] = now;
  row[index.participant_id] = data.participantId;
  row[index.name] = safeCellText_(data.profile.name);
  row[index.faculty] = data.profile.faculty;
  row[index.role] = data.profile.role;
  row[index.year] = data.profile.year;
  row[index.gender] = data.profile.gender;
  row[index.consented_at] = data.consentedAt;
  row[index.started_at] = data.startedAt;
  row[index.last_submission_id] = data.submissionId;

  applyAssessmentSummary_(row, index, data.assessment.id, data.assessment.completedAt, score);

  const completedColumns = [
    "personality_completed_at", "emotional_skills_completed_at", "happiness_completed_at",
    "stress_completed_at", "motivation_completed_at"
  ];
  const testsCompleted = completedColumns.filter(function(name) { return Boolean(row[index[name]]); }).length;
  row[index.tests_completed] = testsCompleted;
  row[index.all_complete] = testsCompleted === 5;

  sheet.getRange(rowNumber, 1, 1, headers.length).setValues([row]);
  return { testsCompleted: testsCompleted, allComplete: testsCompleted === 5 };
}

function applyAssessmentSummary_(row, index, assessmentId, completedAt, score) {
  if (assessmentId === "personality") {
    row[index.personality_completed_at] = completedAt;
    row[index.personality_extraversion] = score.domains.extraversion;
    row[index.personality_agreeableness] = score.domains.agreeableness;
    row[index.personality_conscientiousness] = score.domains.conscientiousness;
    row[index.personality_emotional_reactivity] = score.domains.emotionalReactivity;
    row[index.personality_openness] = score.domains.openness;
  } else if (assessmentId === "emotionalSkills") {
    row[index.emotional_skills_completed_at] = completedAt;
    row[index.emotional_skills_overall] = score.average;
    row[index.emotional_awareness] = score.domains.awareness;
    row[index.emotional_self_management] = score.domains.selfManagement;
    row[index.emotional_empathy] = score.domains.empathy;
  } else if (assessmentId === "happiness") {
    row[index.happiness_completed_at] = completedAt;
    row[index.happiness_score] = score.average;
  } else if (assessmentId === "stress") {
    row[index.stress_completed_at] = completedAt;
    row[index.stress_score] = score.total;
  } else if (assessmentId === "motivation") {
    row[index.motivation_completed_at] = completedAt;
    row[index.motivation_intrinsic] = score.domains.intrinsic;
    row[index.motivation_identified] = score.domains.identified;
    row[index.motivation_introjected] = score.domains.introjected;
    row[index.motivation_external] = score.domains.external;
    row[index.motivation_amotivation] = score.domains.amotivation;
    row[index.motivation_dominant] = score.dominant;
  }
}

function ensureSheet_(spreadsheet, name, headers) {
  let sheet = spreadsheet.getSheetByName(name);
  if (!sheet) sheet = spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  } else {
    const current = sheet.getRange(1, 1, 1, headers.length).getDisplayValues()[0];
    if (current.join("|") !== headers.join("|")) throw new Error("HEADER_MISMATCH_" + name);
  }
  const header = sheet.getRange(1, 1, 1, headers.length);
  header.setBackground("#176B53").setFontColor("#FFFFFF").setFontWeight("bold").setWrap(true);
  sheet.setFrozenRows(1);
  sheet.setFrozenColumns(3);
  return sheet;
}

function openConfiguredSpreadsheet_() {
  const id = PropertiesService.getScriptProperties().getProperty("SPREADSHEET_ID");
  if (!id) throw new Error("MISSING_SPREADSHEET_ID");
  return SpreadsheetApp.openById(id);
}

function authorizeProxy_(provided) {
  const expected = PropertiesService.getScriptProperties().getProperty("PROXY_SECRET");
  if (!expected || expected.length < 32) throw new Error("MISSING_PROXY_SECRET");
  if (!constantTimeEqual_(String(provided || ""), expected)) throw new Error("UNAUTHORIZED");
}

function constantTimeEqual_(left, right) {
  if (left.length !== right.length) return false;
  let mismatch = 0;
  for (let i = 0; i < left.length; i++) mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  return mismatch === 0;
}

function findRowByValue_(sheet, column, value) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return 0;
  const found = sheet.getRange(2, column, lastRow - 1, 1)
    .createTextFinder(String(value)).matchEntireCell(true).matchCase(true).findNext();
  return found ? found.getRow() : 0;
}

function headerIndex_(headers) {
  return headers.reduce(function(map, header, i) { map[header] = i; return map; }, {});
}

function safeCellText_(value) {
  const text = String(value || "").trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function validateYear_(role, year) {
  const allowed = role === "Undergraduate" ? ["Year 1", "Year 2", "Year 3", "Year 4"] :
    (role === "Postgraduate" || role === "Diploma" ? ["Year 1", "Year 2"] : [""]);
  if (allowed.indexOf(year) < 0) throw new Error("INVALID_PROFILE_YEAR");
}

function assertObject_(value, label) {
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("INVALID_" + label.toUpperCase());
}

function assertString_(value, label, min, max) {
  if (typeof value !== "string" || value.trim().length < min || value.length > max) {
    throw new Error("INVALID_" + label.toUpperCase());
  }
  return value;
}

function assertId_(value, label) {
  const id = assertString_(value, label, 8, 100);
  if (!/^[A-Za-z0-9_-]+$/.test(id)) throw new Error("INVALID_" + label.toUpperCase());
  return id;
}

function assertDate_(value, label) {
  const text = assertString_(value, label, 10, 40);
  const date = new Date(text);
  if (isNaN(date.getTime())) throw new Error("INVALID_" + label.toUpperCase());
  return date;
}

function assertEnum_(value, allowed, label) {
  if (allowed.indexOf(value) < 0) throw new Error("INVALID_" + label.toUpperCase());
  return value;
}

function rejectUnknownKeys_(value, allowed, label) {
  Object.keys(value).forEach(function(key) {
    if (allowed.indexOf(key) < 0) throw new Error("UNKNOWN_" + label.toUpperCase() + "_FIELD");
  });
}

function publicErrorCode_(error) {
  const message = String(error && error.message || "");
  if (message === "UNAUTHORIZED" || message === "MISSING_PROXY_SECRET") return "unauthorized";
  if (/^(INVALID|UNKNOWN)/.test(message)) return "invalid_request";
  if (message.indexOf("HEADER_MISMATCH") === 0) return "configuration_error";
  return "server_error";
}

function jsonResponse_(value) {
  return ContentService.createTextOutput(JSON.stringify(value))
    .setMimeType(ContentService.MimeType.JSON);
}
