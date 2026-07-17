# MindPop

MindPop is a lightweight, mobile-first wellbeing check-in for students and staff. It includes five short reflections:

1. BFI-10 personality patterns
2. An informal emotional-skills check-in
3. Subjective Happiness Scale
4. PSS-4 perceived stress
5. An adapted self-determination-theory motivation snapshot

The app has no framework, build step, analytics, third-party fonts, or external UI dependencies.

## Run locally

Serve the folder over HTTP rather than opening `index.html` directly:

```text
python -m http.server 8080
```

Then open `http://localhost:8080`.

## Test scoring and site rules

```text
npm test
```

## Data and submission

Name, faculty, role, applicable year, gender and each completed assessment are identifiable institutional data. Required consent text states this before the profile form.

Progress is stored locally under `mindpop_session_v3`. A separate record is prepared after each completed test so useful progress is not lost when a participant stops early. Records use stable submission IDs and are queued locally when no secure endpoint is connected.

The repository does not contain a Google Apps Script URL or secret. Set `submissionEndpoint` in `config.js` only after a protected same-origin proxy is deployed. Read [SECURITY.md](SECURITY.md) before enabling submissions.

The shareable five-test report intentionally excludes the participant's name, profile details and raw answers.

## Files

- `index.html` - secure, semantic page shell
- `styles.css` - responsive visual system and report card
- `config.js` - public, non-secret runtime settings
- `scoring.js` - scale definitions and testable scoring
- `app.js` - consent, navigation, local state, results and per-test submission
- `SCORING.md` - scoring decisions and source audit
- `SECURITY.md` - backend hardening contract
