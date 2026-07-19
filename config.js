/*
 * Public runtime configuration.
 *
 * Do not put passwords, API keys, shared secrets, or a private Apps Script URL
 * in this file. Anything shipped to a browser can be read by visitors.
 *
 * Recommended production setup:
 *   Browser -> same-origin /api/responses proxy -> Google Apps Script
 * The proxy should hold the Apps Script URL and shared secret as environment
 * variables, validate payloads, rate limit requests, and allow only this site.
 */
window.MINDPOP_CONFIG = Object.freeze({
  appName: "MindPop",
  institutionName: "Your campus",
  submissionEndpoint: "",
  submissionMode: "proxy",
  allowDirectAppsScript: false,
  privacyUrl: "",
  supportUrl: "",
  supportLabel: "Contact your campus wellbeing team"
});
