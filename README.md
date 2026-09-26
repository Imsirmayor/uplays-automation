# UPLAYS Automation Scripts

Google Apps Script automation for the UPLAYS program: registration handling,
email confirmations, duplicate detection, and batch sending.

## Structure

- `config/` — configuration (copy `config.example.js` → `config.js`)
- `scripts/registration/` — form-submit handlers (EN, UA, German class)
- `scripts/data-processing/` — dedupe export, duplicate code checker
- `scripts/email-sender/` — scheduled batch email sender

## Setup

1. Copy config:
   ```bash
   cp config/config.example.js config/config.js
   ```
2. Fill in your spreadsheet IDs, form URLs, and emails in `config.js`.
3. Deploy to Apps Script (via [clasp](https://github.com/google/clasp) or manual paste).

## Scripts Overview

| Script | Trigger | Purpose |
|---|---|---|
| `formSubmitEN.js` | Form submit | EN registration confirmations |
| `formSubmitUA.js` | Form submit | UA registration confirmations |
| `germanClassRegistrationUA.js` | Form submit | German class registrations |
| `dedupeExport.js` | Manual | Dedupe email list to output sheet |
| `duplicateCodeChecker.js` | Form submit | Reject duplicate follow-up submissions |
| `batchEmailSender.js` | Time-driven (5 min) | Send final-evaluation emails in batches |

## Security Notes

**Never commit `config.js`** — it contains spreadsheet IDs, personal emails,
and form URLs. Only `config.example.js` should be in git.

## License

MIT (or your choice)