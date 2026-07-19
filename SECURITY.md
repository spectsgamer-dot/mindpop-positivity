# Security and backend contract

## The core rule

A URL, API key, or shared secret shipped in browser JavaScript is public. Renaming or obfuscating it does not make it secret.

The previous Google Apps Script URL has been removed. Direct Apps Script submission is disabled by default.

## Recommended architecture

```text
Student browser
  -> POST /api/responses on the same site
  -> server-side proxy / edge function
  -> Google Apps Script web app
  -> private Google Sheet
```

Store the Apps Script URL and a long random proxy secret in server-side environment variables. Never commit them to this repository.

## Proxy requirements

The proxy should:

1. Allow `POST` only and require `application/json`.
2. Enforce an exact production-origin allowlist.
3. Apply IP and participant-ID rate limits.
4. Reject bodies larger than 30 KB.
5. Validate every field against the schema below and reject unknown fields.
6. Validate IDs, timestamps, enum values, array lengths and response ranges.
7. Recompute research scores on the server; never trust client-computed scores.
8. Add the shared proxy secret to the server-to-Apps-Script body.
9. Use short timeouts and return a minimal JSON acknowledgement.
10. Avoid logging questionnaire answers, names or demographic data.

Optional bot protection such as Cloudflare Turnstile belongs at the proxy. A browser-only timer or honeypot is useful friction, not real security.

## Apps Script and Sheet requirements

The Apps Script `doPost(e)` handler should:

1. Parse JSON inside a `try/catch`.
2. Reject requests whose `proxySecret` does not exactly match a value in Apps Script Properties.
3. Validate the schema again.
4. Enforce idempotency on `submissionId` so retries cannot duplicate data.
5. Recompute scores before writing.
6. Upsert by `participantId`: create one participant row, then update the columns for `assessment.id`.
7. Never erase a previously completed assessment when a partial record arrives.
8. Write values in a fixed column order and prefix values beginning with `=`, `+`, `-` or `@` with an apostrophe.
9. Use `LockService` around the duplicate check and row upsert.
10. Return only `{"ok":true,"submissionId":"..."}` or a generic error.

Keep the destination Sheet private, restrict editor access, define a retention period, and treat exports as sensitive personal data.

## Payload schema

The browser sends one record after each completed check-in:

- `recordType`: exactly `assessment-progress`
- `schemaVersion`: exactly `3`
- `appVersion`: short string
- `submissionId`: stable ID for this assessment completion
- `participantId`: stable ID tying a participant's partial records together
- `consentedAt`, `startedAt`: ISO timestamps
- `profile.name`: required, trimmed text, maximum 80 characters
- `profile.faculty`: one configured faculty
- `profile.role`: Undergraduate, Postgraduate, Diploma, PhD, Faculty or Staff
- `profile.year`: Year 1-4 for Undergraduate; Year 1-2 for Postgraduate or Diploma; empty otherwise
- `profile.gender`: one configured value and never empty
- `assessment.id`: exactly one of the five known assessment IDs
- `assessment.source`, `responses`, `score`, `completedAt`
- `progress.completed`: integer 1-5
- `progress.total`: exactly 5
- `progress.isComplete`: boolean
- Client-computed `score` is informational only

This is identifiable wellbeing data. No email address, phone number, cookie or browser fingerprint is sent.

## Hosting headers

The CSP in `index.html` provides a useful baseline. The production host should also send headers:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

When the proxy is same-origin, production `connect-src` can remain `'self'`.

## Direct Apps Script compatibility mode

A direct endpoint can be enabled in `config.js` with `submissionMode: "direct-apps-script"` and `allowDirectAppsScript: true`, but this exposes the URL and cannot provide meaningful abuse prevention. It is only a temporary compatibility path.

Direct mode also requires explicitly allowing the Google Script domains in the page's `connect-src` CSP, which weakens the secure same-origin default.
