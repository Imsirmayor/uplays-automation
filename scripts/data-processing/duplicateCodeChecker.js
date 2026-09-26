/**
 * scripts/data-processing/duplicateCodeChecker.js
 *
 * Duplicate-check for follow-up form (Spreadsheet trigger).
 * INSTALL trigger: From spreadsheet -> On form submit.
 */

function onResponseSheetSubmit(e) {
  try {
    if (!e || !e.range) {
      Logger.log("No e.range - make sure trigger is 'From spreadsheet -> On form submit'");
      return;
    }

    var ss = SpreadsheetApp.openById(CONFIG.TARGET_SPREADSHEET_ID);
    var sheet = ss.getSheetByName(CONFIG.RESPONSE_SHEET_NAME);

    if (!sheet) {
      Logger.log("Configured response sheet not found: '" + CONFIG.RESPONSE_SHEET_NAME + "'");
      return;
    }

    var triggeredSheet = e.range.getSheet();
    if (triggeredSheet.getSheetId() !== sheet.getSheetId()) {
      Logger.log("Triggered sheet is not the configured response sheet — ignoring. Triggered: " + triggeredSheet.getName());
      return;
    }

    var newRow = e.range.getRow();
    if (newRow === 1) return;

    var lastCol = sheet.getLastColumn();
    var newRowValues = sheet.getRange(newRow, 1, 1, lastCol).getValues()[0];

    var codeCell = newRowValues[CONFIG.COL_CODE];
    var submittedCode = (codeCell === null || codeCell === undefined) ? "" : String(codeCell).trim();

    if (!submittedCode) {
      Logger.log("No code submitted in row " + newRow + ". No duplicate-check performed.");
      return;
    }

    var normalized = submittedCode.toString().trim().toUpperCase();

    var lastRow = sheet.getLastRow();
    if (lastRow < 2) return;

    var codesRange = sheet.getRange(2, CONFIG.COL_CODE + 1, lastRow - 1, 1);
    var codesValues = codesRange.getValues();

    var occurrences = [];
    for (var i = 0; i < codesValues.length; i++) {
      var val = (codesValues[i][0] === null || codesValues[i][0] === undefined) ? "" : String(codesValues[i][0]).trim().toUpperCase();
      var rowNum = i + 2;
      if (val === normalized) {
        occurrences.push(rowNum);
      }
    }

    if (occurrences.length > 1) {
      occurrences.sort(function(a,b){return a-b;});
      var firstRow = occurrences[0];

      if (firstRow !== newRow) {
        var rejectSheet = ss.getSheetByName(CONFIG.REJECT_SHEET_NAME);
        if (!rejectSheet) {
          rejectSheet = ss.insertSheet(CONFIG.REJECT_SHEET_NAME);
          var headers = ["Rejected At", "Reason", "Duplicate Code", "Original Sheet", "Original Row"].concat(
            sheet.getRange(1,1,1,lastCol).getValues()[0]
          );
          rejectSheet.appendRow(headers);
        }

        var rejectedAt = new Date();
        var reason = "Duplicate code — earlier row exists (kept earlier response)";
        var meta = [rejectedAt, reason, normalized, sheet.getName(), newRow].concat(newRowValues);
        rejectSheet.appendRow(meta);

        sheet.deleteRow(newRow);

        if (CONFIG.ADMIN_EMAIL && CONFIG.ADMIN_EMAIL.toString().trim() !== "") {
          var subj = "Duplicate follow-up submission removed: " + normalized;
          var body = [
            "A duplicate follow-up form submission was detected and removed.",
            "",
            "Duplicate code: " + normalized,
            "New submission row removed: " + newRow,
            "Kept row (first occurrence): " + firstRow,
            "Time removed: " + (new Date()).toString(),
            "",
            "Check the sheet '" + CONFIG.REJECT_SHEET_NAME + "' for details in spreadsheet: " + ss.getUrl()
          ].join("\n");
          try { MailApp.sendEmail(CONFIG.ADMIN_EMAIL, subj, body); } catch (mailErr) { Logger.log("Mail error: "+mailErr); }
        }

        Logger.log("Duplicate removed for code " + normalized + " — new row moved to '" + CONFIG.REJECT_SHEET_NAME + "' and deleted from responses.");
      } else {
        Logger.log("Code " + normalized + " exists but the new row is the earliest occurrence — keeping it.");
      }
    } else {
      Logger.log("Code " + normalized + " first occurrence at row " + newRow + " — accepted.");
    }

  } catch (err) {
    Logger.log("Error in onResponseSheetSubmit: " + err.toString());
    if (CONFIG.ADMIN_EMAIL && CONFIG.ADMIN_EMAIL.toString().trim() !== "") {
      try {
        MailApp.sendEmail(CONFIG.ADMIN_EMAIL, "Error in duplicate-check script", err.toString() + "\n\n" + (err.stack || ""));
      } catch (mailErr) { Logger.log("Admin mail failed: "+mailErr); }
    }
  }
}

/**
 * Small helper to log duplicates to a sheet named per CONFIG.DUPLICATE_LOG_SHEET_NAME.
 * (Currently unused but kept for reference / future use.)
 */
function _logDuplicateAction(code, existingRow, deletedRow) {
  try {
    var ss = SpreadsheetApp.getActive();
    var logSheet = ss.getSheetByName(CONFIG.DUPLICATE_LOG_SHEET_NAME);
    if (!logSheet) {
      logSheet = ss.insertSheet(CONFIG.DUPLICATE_LOG_SHEET_NAME);
      logSheet.appendRow(['Timestamp', 'Code', 'ExistingRow', 'DeletedNewRow']);
    }
    logSheet.appendRow([new Date(), code, existingRow, deletedRow]);
  } catch (err) {
    Logger.log('Could not write to DUPLICATE_LOG: ' + err);
  }
}