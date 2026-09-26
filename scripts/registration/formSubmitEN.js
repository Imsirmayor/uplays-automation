/**
 * scripts/registration/formSubmitEN.js
 *
 * English form-submit handler.
 * Trigger: From spreadsheet -> On form submit (installable).
 */

function onFormSubmit(e) {
  try {
    var formResponse = e.response;
    var itemResponses = formResponse.getItemResponses();

    var registrationType = "";
    var fullName = "";
    var email = "";
    var childFullName = "";
    var parentFullName = "";
    var childEmail = "";
    var parentEmail = "";

    for (var i = 0; i < itemResponses.length; i++) {
      var itemResponse = itemResponses[i];
      var title = itemResponse.getItem().getTitle();
      var response = itemResponse.getResponse();

      if (title.includes("yourself or your child") || title.includes("yourself or a child")) {
        registrationType = response;
      } else if (title.includes("Your Full Name") || title === "Your Full Name") {
        fullName = response;
      } else if (title.includes("E-mail Address") && title.includes("you frequently check")) {
        email = response;
      } else if (title.includes("Child's full name") || title === "Child's full name") {
        childFullName = response;
      } else if (title.includes("What is your full name? (Parent or guardian)") || title === "What is your full name? (Parent or guardian)") {
        parentFullName = response;
      } else if (title.includes("Child's e-mail address") || title === "Child's e-mail address") {
        childEmail = response;
      } else if (title.includes("E-mail address (Parent or guardian)") || title === "E-mail address (Parent or guardian)") {
        parentEmail = response;
      }
    }

    if (registrationType && (registrationType.includes("parent") || registrationType.includes("guardian"))) {
      Logger.log("Processing child registration for: " + childFullName);

      if (!childFullName) throw new Error("Child's full name is missing");
      if (!parentEmail) throw new Error("Parent email is missing");

      var uniqueCode = generateUniqueCode(childFullName);
      storeRegistrationData(childFullName + " (Child of: " + parentFullName + ")", parentEmail, uniqueCode);

      sendParentConfirmationEmail(parentEmail, parentFullName, childFullName, uniqueCode, childEmail);
      if (childEmail && childEmail.trim() !== "") {
        sendChildConfirmationEmail(childEmail, childFullName, uniqueCode);
      }

    } else {
      Logger.log("Processing self registration for: " + fullName);

      if (!fullName) throw new Error("Participant full name is missing");
      if (!email) throw new Error("Participant email is missing");

      var uniqueCode = generateUniqueCode(fullName);
      storeRegistrationData(fullName, email, uniqueCode);
      sendSelfConfirmationEmail(email, fullName, uniqueCode);
    }

  } catch (error) {
    Logger.log("Error processing form submission: " + error.message);
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: "Form Processing Error (EN)",
      body: "An error occurred: " + error.message + "\n\nStack Trace:\n" + error.stack
    });
  }
}

function generateUniqueCode(fullName) {
  var nameParts = fullName.split(' ');
  var initials = '';

  if (nameParts.length >= 1) {
    initials += nameParts[0].substring(0, 1).toUpperCase();
  }
  if (nameParts.length >= 2) {
    initials += nameParts[1].substring(0, 1).toUpperCase();
  } else if (nameParts[0].length > 1) {
    initials += nameParts[0].substring(1, 2).toUpperCase();
  } else {
    initials += 'X';
  }

  var randomNum = Math.floor(1000 + Math.random() * 9000);
  return 'UA-' + initials + randomNum;
}

function storeRegistrationData(name, email, uniqueCode) {
  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([name, email, uniqueCode, new Date()]);
}

function sendSelfConfirmationEmail(email, fullName, uniqueCode) {
  var subject = 'Complete your registration for the UPLAYS program: Personal Participant Code and Next Steps';
  var body = 'Dear ' + fullName + ',\n\n' +
              'Thank you for completing the first registration survey!\n\n' +
              'Here is your unique participant code:\n\n' +
              uniqueCode + '\n\n' +
              'This code will be used to monitor your progress anonymously and collect your feedback. Please save it.\n\n' +
              'To finalize your registration, please complete the following form. It will ask about your preferences and needs so we can tailor the program to you, and will include some questions about your skills. Here, you can also choose which course you would like to take and what you would like to focus on.\n\n' +
              'Please remember to enter your unique participant code at the start of the survey.\n\n' +
              'Click here to complete the form: ' + CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
              'After completing the form, your registration is final!\n\n' +
              'Thank you for your time. We look forward to having you in the program!';

  MailApp.sendEmail(email, subject, body);
}

function sendParentConfirmationEmail(parentEmail, parentFullName, childFullName, uniqueCode, childEmail) {
  var subject = 'Complete your child\'s registration for the UPLAYS program: Participant Code and Next Steps';
  var body = 'Dear ' + parentFullName + ',\n\n' +
              'Thank you for completing the registration survey for your child, ' + childFullName + '!\n\n' +
              'Here is your child\'s unique participant code:\n\n' +
              uniqueCode + '\n\n' +
              'This code will be used to monitor your child\'s progress anonymously and collect feedback. Please save it.\n\n' +
              'To finalize the registration, please complete the following form, or it can also be completed by your child if you provided their email. It will ask about preferences and needs so we can tailor the program to your child, and will include some questions about skills. Here, you can also choose which course your child would like to take and what to focus on.\n\n' +
              'If you complete the form for the child, please remember to enter the child\'s unique participant code at the start of the survey.\n\n' +
              'Click here to complete the form: ' + CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
              'After completing the form, the registration will be final!\n\n' +
              'Thank you for your time. We look forward to having your child in the program!';

  MailApp.sendEmail(parentEmail, subject, body);
}

function sendChildConfirmationEmail(childEmail, childFullName, uniqueCode) {
  var subject = 'Complete your registration for the UPLAYS program: Personal Participant Code and Next Steps';
  var body = 'Hello ' + childFullName + ',\n\n' +
              'Your parent/guardian has registered you for the UPLAYS program.\n\n' +
              'Your unique participant code is:\n\n' +
              uniqueCode + '\n\n' +
              'Please keep this code safe as you\'ll need it for future program activities.\n\n' +
              'You or your parent/guardian can complete the final registration steps.\n\n' +
              'Click here to complete the form: ' + CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
              'If you are not sure how to complete it, feel free to ask your parent/guardian for help.\n\n' +
              'Thank you for your time. We look forward to seeing you in the program!\n\n';

  MailApp.sendEmail(childEmail, subject, body);
}