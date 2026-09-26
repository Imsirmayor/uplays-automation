// config/config.example.js
// Copy this file to config/config.js and fill in your real values.
// config/config.js is gitignored — never commit real credentials.

var CONFIG = {
  // Spreadsheets
  SPREADSHEET_ID: 'YOUR_SPREADSHEET_ID_HERE',
  SOURCE_SHEET_NAME: 'YOUR_SOURCE_SHEET_NAME',
  OUTPUT_SHEET_NAME: 'Email_Code_List_Deduped',
  TARGET_SPREADSHEET_ID: 'YOUR_TARGET_SPREADSHEET_ID',
  RESPONSE_SHEET_NAME: 'YOUR_RESPONSE_SHEET_NAME',
  REJECT_SHEET_NAME: 'Rejected Submissions',

  // Emails
  ADMIN_EMAIL: 'admin@example.com',
  TEST_EMAIL: 'test@example.com',
  SUPPORT_EMAIL: 'support@example.com',

  // Batch sender tuning
  TEST_MODE: false,
  EMAIL_DELAY_MS: 60 * 1000,
  PER_RUN_MAX: 4,
  BATCH_SIZE: 85,
  SECOND_BATCH_DELAY_MS: 24 * 60 * 60 * 1000,

  // Column indexes
  COL_NAME: 0, COL_EMAIL: 1, COL_CODE: 2, COL_TIME: 3,
  COL_STATUS: 4, COL_SENTAT: 5,

  // Blacklist
  BLACKLIST: [],

  // Links
  FORM_REG_URL: 'https://forms.gle/YOUR_FORM_ID',
  FORM_FOLLOWUP_URL: 'https://forms.gle/YOUR_FORM_ID',
  ZOOM_URL: 'https://zoom.us/j/YOUR_MEETING_ID',
  ZOOM_ID: '000 0000 0000',
  ZOOM_PASSCODE: '00000',
  TELEGRAM_URL: 'https://t.me/YOUR_CHANNEL',
  WHATSAPP_URL: 'https://whatsapp.com/channel/YOUR_CHANNEL',

  // Signature
  SIGNATURE_NAME: 'Your Name',
  SIGNATURE_ROLE: 'Your Role',
  SIGNATURE_ORG: 'Your Organisation',
  SIGNATURE_URL: 'https://www.example.org/'
};