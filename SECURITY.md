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
6. Validate UUID-like IDs, timestamps, enum values, array lengths and response ranges.
7. Recompute research scores on the server; never trust client-computed scores.
8. Add the shared proxy secret to the server-to-Apps-Script body.
9. Use short timeouts and return a minimal JSON acknowledgement.
10. Log request IDs and outcomes, not questionnaire answers or demographic data.

Optional bot protection such as Cloudflare Turnstile belongs at the proxy. A browser-only timer or honeypot is useful friction, not real security.

## Apps Script requirements

The Apps Script `doPost(e)` handler should:

1. Parse JSON inside a `try/catch`.
2. Reject any request whose `proxySecret` does not exactly match a value stored in Apps Script Properties.
3. Validate the schema again.
4. Enforce idempotency on `submissionId` so retries cannot duplicate rows.
5. Recompute scores before writing.
6. Append values in a fixed column order - never build formulas from user data.
7. Prefix values beginning with `=`, `+`, `-` or `@` with an apostrophe to prevent spreadsheet-formula injection.
8. Use `LockService` around the duplicate check and row append.
9. Return only `{"ok":true,"submissionId":"..."}` or a generic error.
10. Keep the destination Sheet private and limit editor access.

Apps Script web apps do not provide a safe browser-held secret. The proxy secret is useful only because the proxy adds it server-side.

## Payload schema

The browser sends one record only after all five check-ins are complete:

- `schemaVersion`: exactly `2`
- `appVersion`: short string
- `submissionId`, `participantId`: opaque IDs
- `consentedAt`, `startedAt`, `completedAt`: ISO timestamps
- `profile.department`: one configured department
- `profile.role`: Undergraduate, Postgraduate, Faculty or Staff
- `profile.year`: one configured year/experience value or empty
- `profile.gender`: configured value or empty
- `assessments`: exactly five known assessment objects
- Each assessment has the exact expected response count and range
- Client-computed `score` is informational only

No name, phone number, email address, free-text response, cookie or browser fingerprint is sent.

## Hosting headers

The CSP in `index.html` provides a useful baseline. The production host should also send headers because some protections cannot be reliably set in HTML:

```text
Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'
Referrer-Policy: no-referrer
Permissions-Policy: camera=(), microphone=(), geolocation=()
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=31536000; includeSubDomains
```

When the proxy is same-origin, production `connect-src` can remain `'self'`.

## Direct Apps Script compatibility mode

A direct endpoint can be enabled in `config.js` with `submissionMode: "direct-apps-script"` and `allowDirectAppsScript: true`, but this exposes the URL and cannot provide meaningful abuse prevention. It is included only as a temporary compatibility path and is not the recommended deployment.

Direct mode also requires explicitly allowing the Google Script domains in the page's `connect-src` CSP, which weakens the secure same-origin default.
