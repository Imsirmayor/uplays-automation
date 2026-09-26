/**
 * scripts/data-processing/dedupeExport.js
 *
 * Exports a deduplicated Name/Email/Code/Timestamp list.
 * Trigger: Manual.
 */

function exportDedupedEmailCodeList() {
  var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
  var sheet = CONFIG.SOURCE_SHEET_NAME
    ? ss.getSheetByName(CONFIG.SOURCE_SHEET_NAME)
    : ss.getActiveSheet();

  var data = sheet.getDataRange().getValues();

  var best = {};
  var skippedBlacklist = 0;
  var skippedInvalid   = 0;

  for (var i = 1; i < data.length; i++) {
    var row   = data[i];
    var name  = String(row[CONFIG.COL_NAME]  || '').trim();
    var email = String(row[CONFIG.COL_EMAIL] || '').trim();
    var code  = String(row[CONFIG.COL_CODE]  || '').trim();
    var time  = CONFIG.COL_TIME >= 0 ? row[CONFIG.COL_TIME] : null;

    if (!email || !code) { skippedInvalid++; continue; }

    var emailKey = email.toLowerCase();

    if (CONFIG.BLACKLIST.indexOf(emailKey) !== -1) { skippedBlacklist++; continue; }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailKey)) { skippedInvalid++; continue; }

    var existing = best[emailKey];

    if (!existing) {
      best[emailKey] = { name: name, email: email, code: code, time: time, rowIndex: i + 1 };
    } else {
      if (time && existing.time && new Date(time) < new Date(existing.time)) {
        best[emailKey] = { name: name, email: email, code: code, time: time, rowIndex: i + 1 };
      }
    }
  }

  var rows = Object.keys(best).map(function(k){ return best[k]; });

  rows.sort(function(a, b) {
    if (!a.time && !b.time) return 0;
    if (!a.time) return 1;
    if (!b.time) return -1;
    return new Date(a.time) - new Date(b.time);
  });

  var out = [['Name', 'Email', 'Unique Code', 'Timestamp']];
  rows.forEach(function(r) {
    out.push([r.name, r.email, r.code, r.time || '']);
  });

  var outSheet = ss.getSheetByName(CONFIG.OUTPUT_SHEET_NAME) || ss.insertSheet(CONFIG.OUTPUT_SHEET_NAME);
  outSheet.clear();
  outSheet.getRange(1, 1, out.length, out[0].length).setValues(out);

  Logger.log('--- Done ---');
  Logger.log('Unique emails exported: ' + rows.length);
  Logger.log('Blacklisted (misspelled) rows skipped: ' + skippedBlacklist);
  Logger.log('Invalid/empty rows skipped: ' + skippedInvalid);
  Logger.log('Total source rows: ' + (data.length - 1));
  Logger.log('Open sheet: ' + ss.getUrl());
}