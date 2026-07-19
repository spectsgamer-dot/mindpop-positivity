# MindPop Google Sheets and Apps Script setup

## What you received

- `MindPop_Google_Sheet_Template.xlsx`: import this into Google Sheets.
- `MindPop_Code.gs`: request validation, deduplication, sheet writes and participant upserts.
- `MindPop_Scoring.gs`: authoritative server-side scoring for all five assessments.

## Sheet structure

### Participants

One row per participant. It contains the required identifiable profile and the latest server-recomputed results for every completed test.

Important columns:

- `participant_id`: stable key used to find and update the same participant.
- `name`, `faculty`, `role`, `year`, `gender`: identifiable profile.
- `tests_completed`, `all_complete`: completion progress.
- Each assessment has a completion timestamp and its calculated score columns.
- `last_submission_id`: latest accepted assessment record.

### Assessment_Records

One append-only row per completed test. It preserves the raw answers and authoritative score for audit and later research analysis.

Important columns:

- `submission_id`: unique idempotency key. Retries with the same ID are not appended twice.
- `participant_id`: link to Participants; the name is deliberately not duplicated.
- `assessment_id`: personality, emotionalSkills, happiness, stress or motivation.
- `q01` through `q12`: raw numeric answers; unused question cells remain blank.
- `server_score_json`: score recomputed by Apps Script. Browser-provided scores are ignored.

Do not rename or reorder the columns. The script fails closed with `configuration_error` if headers differ.

## Installation

1. In Google Drive, upload `MindPop_Google_Sheet_Template.xlsx`.
2. Open it with Google Sheets and save it as a native Google Sheet.
3. Open **Extensions > Apps Script**.
4. Replace the default `Code.gs` with the contents of `MindPop_Code.gs`.
5. Add a second script file named `Scoring.gs` and paste `MindPop_Scoring.gs`.
6. From the function menu, run `setupMindPopWorkbook` once and authorize it.
7. Open **Project Settings > Script Properties**.
8. Add `PROXY_SECRET` with a random secret of at least 32 characters.
9. Deploy as **Web app**:
   - Execute as: **Me**
   - Who has access: **Anyone**
10. Copy the `/exec` deployment URL, but do not put it in the website or `config.js`.

To generate a strong secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32
$rng = [Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
[Convert]::ToBase64String($bytes)
```

Store the generated value in the Apps Script `PROXY_SECRET` property and in your server-side proxy environment only.

## Why a proxy is still required

A browser cannot keep an Apps Script URL or secret private. The secure flow is:

```text
Student browser
  -> same-origin /api/responses proxy
  -> proxy adds PROXY_SECRET
  -> Google Apps Script
  -> private Google Sheet
```

The supplied Apps Script intentionally rejects direct browser requests that do not include the server-held secret. Your current website keeps `submissionEndpoint` blank, so completed tests remain queued locally until the proxy is connected.

When the proxy is ready, set the website endpoint to a same-origin path such as:

```javascript
submissionEndpoint: "/api/responses",
submissionMode: "proxy",
allowDirectAppsScript: false
```

Apps Script ContentService normally returns HTTP 200 even for an application-level rejection. The proxy must parse the JSON response and treat `{"ok":false}` as an error.

## Security and research rules

- Keep the Sheet private and minimize editors.
- Do not publish the Sheet or share an export publicly.
- Set a written retention period.
- Keep historical anonymous responses separate unless their original consent allowed identification.
- Use `Assessment_Records` as raw data and perform cleaning or exclusions in a separate analysis sheet.
- Never trust client-calculated scores; the supplied backend recomputes every score.
- Monitor duplicate IDs, unusual submission rates and invalid-request counts at the proxy without logging answers or names.
