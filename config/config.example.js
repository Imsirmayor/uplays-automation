/**
 * config/config.example.js
 *
 * Copy this file to config/config.js and fill in your real values.
 * config/config.js is gitignored — never commit real credentials.
 */

var CONFIG = {
  // ---------- Spreadsheets ----------
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',           // main registration sheet
  TARGET_SPREADSHEET_ID: 'YOUR_TARGET_SPREADSHEET_ID',  // follow-up form responses sheet
  SOURCE_SHEET_NAME: '',                                // '' = active sheet
  OUTPUT_SHEET_NAME: 'Email_Code_List_Deduped',
  RESPONSE_SHEET_NAME: 'Form Responses 1',
  REJECT_SHEET_NAME: 'Rejected Submissions',
  DUPLICATE_LOG_SHEET_NAME: 'DUPLICATE_LOG',

  // ---------- Emails ----------
  ADMIN_EMAIL: 'admin@example.com',
  TEST_EMAIL: 'test@example.com',
  SUPPORT_EMAIL: 'support@example.com',

  // ---------- Batch sender tuning ----------
  TEST_MODE: false,
  EMAIL_DELAY_MS: 60 * 1000,                 // 60 seconds between emails
  PER_RUN_MAX: 4,                            // emails per trigger run
  BATCH_SIZE: 85,                            // first batch; rest go to batch 2
  SECOND_BATCH_DELAY_MS: 24 * 60 * 60 * 1000,
  STATE_KEY: 'UPLAYS_BATCH_START_TS',

  // ---------- Column indexes (0-based: A=0, B=1, ...) ----------
  COL_NAME: 0,
  COL_EMAIL: 1,
  COL_CODE: 2,
  COL_TIME: 3,
  COL_STATUS: 4,
  COL_SENTAT: 5,

  // ---------- Blacklist ----------
  BLACKLIST: [],

  // ---------- External links ----------
  FORM_REG_URL: 'https://forms.gle/YOUR_REGISTRATION_FORM_ID',
  FORM_FOLLOWUP_URL: 'https://forms.gle/YOUR_FOLLOWUP_FORM_ID',
  FORM_FINAL_EVAL_URL: 'https://forms.gle/YOUR_FINAL_EVAL_FORM_ID',
  ZOOM_URL: 'https://zoom.us/j/YOUR_MEETING_ID',
  ZOOM_ID: '000 0000 0000',
  ZOOM_PASSCODE: '00000',
  TELEGRAM_URL: 'https://t.me/YOUR_CHANNEL',
  WHATSAPP_URL: 'https://whatsapp.com/channel/YOUR_CHANNEL',

  // ---------- Email signature ----------
  SIGNATURE_NAME: 'Your Name',
  SIGNATURE_ROLE: 'Your Role',
  SIGNATURE_ORG: 'Your Organisation',
  SIGNATURE_URL: 'https://www.example.org/',

  // ---------- Form question titles (UA) ----------
  CODE_HEADER_UA: 'Ваш код учасника UPLAYS'
};