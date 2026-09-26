/**
 * scripts/email-sender/batchEmailSender.js
 *
 * Time-driven batch sender for final-evaluation emails.
 * Split into two batches 24h apart, sends up to PER_RUN_MAX emails per 5-min run.
 */

/**
 * SETUP — run this ONCE manually.
 *  - Ensures headers for Status / Sent At exist.
 *  - Records the "batch 1 start time" in script properties.
 *  - Creates a time-driven trigger that runs sendBatch() every 5 minutes.
 */
function setupBatchSender() {
  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.OUTPUT_SHEET_NAME);

  var headerRange = sheet.getRange(1, CONFIG.COL_STATUS + 1, 1, 2);
  var headers = headerRange.getValues()[0];
  if (!headers[0]) sheet.getRange(1, CONFIG.COL_STATUS + 1).setValue('Status');
  if (!headers[1]) sheet.getRange(1, CONFIG.COL_SENTAT + 1).setValue('Sent At');

  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty(CONFIG.STATE_KEY)) {
    props.setProperty(CONFIG.STATE_KEY, String(new Date().getTime()));
    Logger.log('Batch 1 start time set to now.');
  } else {
    Logger.log('Batch 1 start time already set: ' +
               new Date(Number(props.getProperty(CONFIG.STATE_KEY))));
  }

  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendBatch') ScriptApp.deleteTrigger(t);
  });

  ScriptApp.newTrigger('sendBatch')
    .timeBased()
    .everyMinutes(5)
    .create();

  Logger.log('Trigger created. sendBatch() will run every 5 minutes.');
}

/**
 * SENDER — invoked by the time-based trigger every 5 minutes.
 */
function sendBatch() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = ss.getSheetByName(CONFIG.OUTPUT_SHEET_NAME);
  var data = sheet.getDataRange().getValues();

  var props = PropertiesService.getScriptProperties();
  var batchStart = Number(props.getProperty(CONFIG.STATE_KEY));
  if (!batchStart) {
    Logger.log('ERROR: setupBatchSender() has not been run. Aborting.');
    return;
  }

  var now = new Date().getTime();
  var secondBatchStart = batchStart + CONFIG.SECOND_BATCH_DELAY_MS;
  var inSecondBatchWindow = now >= secondBatchStart;

  var sentThisRun = 0;

  for (var i = 1; i < data.length && sentThisRun < CONFIG.PER_RUN_MAX; i++) {
    var row     = data[i];
    var email   = String(row[CONFIG.COL_EMAIL]  || '').trim();
    var code    = String(row[CONFIG.COL_CODE]   || '').trim();
    var status  = String(row[CONFIG.COL_STATUS] || '').trim();
    var dataIdx = i;
    var sheetRow = i + 1;

    if (status === 'SENT' || status === 'FAILED') continue;

    var inBatch1 = dataIdx <= CONFIG.BATCH_SIZE;
    var inBatch2 = dataIdx >  CONFIG.BATCH_SIZE;

    if (inBatch1 && inSecondBatchWindow) continue;
    if (inBatch2 && !inSecondBatchWindow) continue;

    if (!email || !code || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      sheet.getRange(sheetRow, CONFIG.COL_STATUS + 1).setValue('FAILED');
      sheet.getRange(sheetRow, CONFIG.COL_SENTAT + 1).setValue(new Date());
      Logger.log('Row ' + sheetRow + ' invalid — marked FAILED: ' + email);
      continue;
    }

    var recipient = CONFIG.TEST_MODE ? CONFIG.TEST_EMAIL : email;

    var subject = 'Фінальна оцінка UPLAYS: ваш особистий код усередині (5–10 хвилин)';
    var body =
      'Вітаємо!\n\n' +
      'Програма UPLAYS наближається до завершення, і ми просимо вас заповнити коротку форму підсумкової оцінки. Заповнення форми займе приблизно 5–10 хвилин.\n\n' +
      'Форма: ' + CONFIG.FORM_FINAL_EVAL_URL + '\n\n' +
      'Ваш особистий код учасника: ' + code + '\n\n' +
      'Будь ласка, введіть цей код на початку форми. Він допоможе нам зіставити ваші відповіді з початковою оцінкою без використання вашого повного імені, зберігаючи вашу анонімність. Ваш код ви знайдете в електронному листі, який ви отримали після заповнення Реєстрації 2.\n\n' +
      'Для нас дуже важливо отримати вашу відповідь. Вона допоможе нам оцінити результати програми, зрозуміти, що було найбільш корисним для учасників і що можна покращити. Результати також допоможуть нам продемонструвати важливість програми та працювати над тим, щоб подібна підтримка могла бути доступною для учасників і в майбутньому.\n\n' +
      'Якщо ви дитина і вам потрібна допомога із заповненням форми, будь ласка, зверніться до одного з батьків або опікуна.\n\n' +
      'Щиро дякуємо за ваш час, участь у програмі UPLAYS і за те, що ділитеся з нами своїм досвідом. Ваша відповідь справді дуже важлива для нас!\n\n' +
      'Якщо у вас виникнуть запитання, будь ласка, напишіть нам: ' + CONFIG.SUPPORT_EMAIL + '\n\n' +
      'З найкращими побажаннями,\n' +
      'Команда UPLAYS\n' +
      CONFIG.SIGNATURE_ORG;

    try {
      MailApp.sendEmail(recipient, subject, body);
      sheet.getRange(sheetRow, CONFIG.COL_STATUS + 1).setValue('SENT');
      sheet.getRange(sheetRow, CONFIG.COL_SENTAT + 1).setValue(new Date());
      Logger.log('SENT row ' + sheetRow + ' → ' + recipient + ' (code ' + code + ')');
    } catch (err) {
      sheet.getRange(sheetRow, CONFIG.COL_STATUS + 1).setValue('FAILED');
      sheet.getRange(sheetRow, CONFIG.COL_SENTAT + 1).setValue(new Date());
      Logger.log('FAILED row ' + sheetRow + ' (' + email + '): ' + err.message);
    }

    sentThisRun++;

    if (sentThisRun < CONFIG.PER_RUN_MAX) {
      Utilities.sleep(CONFIG.EMAIL_DELAY_MS);
    }
  }

  if (sentThisRun === 0) {
    Logger.log('Nothing to send this run. ' +
               (inSecondBatchWindow ? '(batch 2 window)' : '(batch 1 window)'));
  } else {
    Logger.log('Sent ' + sentThisRun + ' email(s) this run.');
  }
}

/** Show current state. Run manually any time. */
function checkStatus() {
  var props = PropertiesService.getScriptProperties();
  var batchStart = Number(props.getProperty(CONFIG.STATE_KEY));
  if (!batchStart) { Logger.log('Not set up yet.'); return; }
  var now = new Date().getTime();
  Logger.log('Batch 1 start: ' + new Date(batchStart));
  Logger.log('Batch 2 start: ' + new Date(batchStart + CONFIG.SECOND_BATCH_DELAY_MS));
  Logger.log('Now:           ' + new Date(now));
  Logger.log('Currently in:  ' +
             (now >= batchStart + CONFIG.SECOND_BATCH_DELAY_MS ? 'BATCH 2' : 'BATCH 1'));

  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.OUTPUT_SHEET_NAME);
  var data  = sheet.getDataRange().getValues();
  var sent = 0, failed = 0, pending = 0;
  for (var i = 1; i < data.length; i++) {
    var s = String(data[i][CONFIG.COL_STATUS] || '').trim();
    if (s === 'SENT') sent++;
    else if (s === 'FAILED') failed++;
    else pending++;
  }
  Logger.log('SENT: ' + sent + ', FAILED: ' + failed + ', PENDING: ' + pending);
}

/** Reset — deletes trigger, clears Status/Sent At, resets batch start time. */
function resetSender() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendBatch') ScriptApp.deleteTrigger(t);
  });
  PropertiesService.getScriptProperties().deleteProperty(CONFIG.STATE_KEY);

  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getSheetByName(CONFIG.OUTPUT_SHEET_NAME);
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, CONFIG.COL_STATUS + 1, lastRow - 1, 2).clearContent();
  }
  Logger.log('Reset complete. Run setupBatchSender() to start again.');
}

/** Stops the trigger without clearing data. */
function stopSender() {
  ScriptApp.getProjectTriggers().forEach(function(t) {
    if (t.getHandlerFunction() === 'sendBatch') ScriptApp.deleteTrigger(t);
  });
  Logger.log('Trigger deleted.');
}