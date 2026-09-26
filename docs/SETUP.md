# Setup Guide

## 1. Clone and configure

```bash
git clone https://github.com/YOUR_USERNAME/uplays-automation.git
cd uplays-automation
cp config/config.example.js config/config.js
```

Edit `config/config.js` and fill in:
- `SPREADSHEET_ID` — your registration spreadsheet ID
- `TARGET_SPREADSHEET_ID` — your follow-up form responses spreadsheet ID
- `ADMIN_EMAIL`, `TEST_EMAIL`, `SUPPORT_EMAIL`
- All `FORM_*`, `ZOOM_*`, `TELEGRAM_URL`, `WHATSAPP_URL`
- Signature fields

## 2. Deploy to Apps Script

### Option A — Manual (no tools required)
1. Open your Apps Script project at https://script.google.com
2. Create one file per script (matching the filenames in `scripts/`).
3. Paste the contents.
4. Create a file named `config.js` and paste your real `config.js` contents.
5. Save.

### Option B — With clasp (recommended)
```bash
npm install -g @google/clasp
clasp login
clasp clone YOUR_SCRIPT_ID
# copy files over, then:
clasp push
```

## 3. Install triggers

For each handler, go to **Apps Script → Triggers** and install:

| Function | Event source | Event type |
|---|---|---|
| `onFormSubmit` | From spreadsheet | On form submit |
| `onUkrainianFormSubmit` | From spreadsheet | On form submit |
| `onGermanClassRegistration` | From spreadsheet | On form submit |
| `onResponseSheetSubmit` | From spreadsheet | On form submit |

For the batch sender, just run `setupBatchSender()` **once** manually — it
installs its own time-driven trigger.

## 4. Verify

- Run `checkStatus()` from the Apps Script editor to inspect the batch sender state.
- Submit a test form response and confirm the confirmation email arrives.

## Important

**Never commit `config/config.js`.** It's in `.gitignore`. Only
`config/config.example.js` belongs in git.