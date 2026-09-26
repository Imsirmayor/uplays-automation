/**
 * scripts/registration/formSubmitUA.js
 *
 * Ukrainian form-submit handler (first registration).
 * Trigger: From spreadsheet -> On form submit (installable).
 */

function onUkrainianFormSubmit(e) {
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

      if (title.includes("для себе чи для своєї дитини")) {
        registrationType = response;
      } else if (title === "Ваше повне ім’я") {
        fullName = response;
      } else if (title.includes("Електронна адреса") && title.includes("регулярно перевіряєте")) {
        email = response;
      } else if (title === "Повне ім’я дитини") {
        childFullName = response;
      } else if (title.includes("ваше повне ім’я") && title.includes("батько")) {
        parentFullName = response;
      } else if (title.includes("Електронна адреса") && title.includes("батько")) {
        parentEmail = response;
      } else if (title.includes("Електронна адреса дитини")) {
        childEmail = response;
      }
    }

    if (registrationType && registrationType.includes("батьком або опікуном")) {
      Logger.log("Обробка реєстрації дитини: " + childFullName);

      if (!childFullName) throw new Error("Не вказано повне ім’я дитини");
      if (!parentEmail) throw new Error("Не вказано електронну адресу батька або опікуна");

      var uniqueCode = generateUniqueCodeUA(childFullName);
      storeRegistrationDataUA(childFullName + " (дитина: " + parentFullName + ")", parentEmail, uniqueCode);

      sendParentConfirmationEmailUA(parentEmail, parentFullName, childFullName, uniqueCode, childEmail);

      if (childEmail && childEmail.trim() !== "") {
        sendChildConfirmationEmailUA(childEmail, childFullName, uniqueCode);
      }

    } else {
      Logger.log("Обробка реєстрації для себе: " + fullName);

      if (!fullName) throw new Error("Не вказано повне ім’я учасника");
      if (!email) throw new Error("Не вказано електронну адресу учасника");

      var uniqueCode = generateUniqueCodeUA(fullName);
      storeRegistrationDataUA(fullName, email, uniqueCode);
      sendSelfConfirmationEmailUA(email, fullName, uniqueCode);
    }

  } catch (error) {
    Logger.log("Помилка при обробці: " + error.message);
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: "Form Processing Error (UA)",
      body: "An error occurred: " + error.message + "\n\nStack Trace:\n" + error.stack
    });
  }
}

function generateUniqueCodeUA(fullName) {
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

function storeRegistrationDataUA(name, email, uniqueCode) {
  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([name, email, uniqueCode, new Date()]);
}

function sendSelfConfirmationEmailUA(email, fullName, uniqueCode) {
  var subject = 'Завершіть реєстрацію в програмі UPLAYS: Персональний код учасника та наступні кроки';
  var body = 'Дорогий/Дорога ' + fullName + ',\n\n' +
    'Дякуємо, що заповнили першу реєстраційну анкету!\n\n' +
    'Ось ваш унікальний код учасника:\n\n' +
    uniqueCode + '\n\n' +
    'Цей код використовуватиметься для анонімного відстеження вашого прогресу та збору ваших відгуків. Будь ласка, збережіть його.\n\n' +
    'Щоб завершити реєстрацію, будь ласка, заповніть наступну анкету:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Після заповнення анкети ваша реєстрація буде завершена.\n\n' +
    'Дякуємо за ваш час. Ми з нетерпінням чекаємо зустрічі з вами у програмі UPLAYS!';

  MailApp.sendEmail(email, subject, body);
}

function sendParentConfirmationEmailUA(parentEmail, parentFullName, childFullName, uniqueCode, childEmail) {
  var subject = 'Завершіть реєстрацію вашої дитини в програмі UPLAYS: Код учасника та наступні кроки';
  var body = 'Дорогий/Дорога ' + parentFullName + ',\n\n' +
    'Дякуємо, що заповнили реєстраційну анкету для вашої дитини, ' + childFullName + '!\n\n' +
    'Ось унікальний код учасника вашої дитини:\n\n' +
    uniqueCode + '\n\n' +
    'Цей код використовуватиметься для анонімного відстеження прогресу вашої дитини та збору відгуків. Будь ласка, збережіть його.\n\n' +
    'Щоб завершити реєстрацію, будь ласка, заповніть наступну анкету самостійно або разом з дитиною:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Після заповнення анкети реєстрацію буде завершено.\n\n' +
    'Дякуємо за ваш час. Ми з нетерпінням чекаємо зустрічі з вашою дитиною у програмі UPLAYS!';

  MailApp.sendEmail(parentEmail, subject, body);
}

function sendChildConfirmationEmailUA(childEmail, childFullName, uniqueCode) {
  var subject = 'Завершіть реєстрацію в програмі UPLAYS: Персональний код учасника та наступні кроки';
  var body = 'Привіт, ' + childFullName + ',\n\n' +
    'Ваш батько/мати або опікун зареєстрували вас у програмі UPLAYS.\n\n' +
    'Ваш унікальний код учасника:\n\n' +
    uniqueCode + '\n\n' +
    'Збережіть цей код, оскільки він знадобиться вам для подальшої участі в програмі.\n\n' +
    'Завершіть анкету самостійно або зверніться до батьків за допомогою:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Чекаємо вас у програмі UPLAYS!';

  MailApp.sendEmail(childEmail, subject, body);
}