/**
 * scripts/registration/germanClassRegistrationUA.js
 *
 * Ukrainian form-submit handler for the German class registration.
 * Trigger: From spreadsheet -> On form submit (installable).
 */

function onGermanClassRegistration(e) {
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

      var uniqueCode = generateUniqueCodeDE(childFullName);
      storeRegistrationDataDE(childFullName + " (дитина: " + parentFullName + ")", parentEmail, uniqueCode);

      sendParentConfirmationEmailDE(parentEmail, parentFullName, childFullName, uniqueCode, childEmail);

      if (childEmail && childEmail.trim() !== "") {
        sendChildConfirmationEmailDE(childEmail, childFullName, uniqueCode);
      }

    } else {
      Logger.log("Обробка реєстрації для себе: " + fullName);

      if (!fullName) throw new Error("Не вказано повне ім’я учасника");
      if (!email) throw new Error("Не вказано електронну адресу учасника");

      var uniqueCode = generateUniqueCodeDE(fullName);
      storeRegistrationDataDE(fullName, email, uniqueCode);
      sendSelfConfirmationEmailDE(email, fullName, uniqueCode);
    }

  } catch (error) {
    Logger.log("Помилка при обробці: " + error.message);
    MailApp.sendEmail({
      to: CONFIG.ADMIN_EMAIL,
      subject: "Form Processing Error (German Class UA)",
      body: "An error occurred: " + error.message + "\n\nStack Trace:\n" + (error.stack || "no stack available")
    });
  }
}

function generateUniqueCodeDE(fullName) {
  fullName = String(fullName || "").trim();
  var nameParts = fullName.split(' ');
  var initials = '';

  if (nameParts.length >= 1 && nameParts[0]) {
    initials += nameParts[0].substring(0, 1).toUpperCase();
  }
  if (nameParts.length >= 2 && nameParts[1]) {
    initials += nameParts[1].substring(0, 1).toUpperCase();
  } else if (nameParts[0] && nameParts[0].length > 1) {
    initials += nameParts[0].substring(1, 2).toUpperCase();
  } else {
    initials += 'X';
  }

  var randomNum = Math.floor(1000 + Math.random() * 9000);
  return 'UA-' + initials + randomNum;
}

function storeRegistrationDataDE(name, email, uniqueCode) {
  var sheet = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID).getActiveSheet();
  sheet.appendRow([name, email, uniqueCode, new Date()]);
}

function buildSignatureDE() {
  return "\n\nЗ повагою,\n" + CONFIG.SIGNATURE_NAME + "\n" +
         CONFIG.SIGNATURE_ROLE + " | " + CONFIG.SIGNATURE_ORG + "\n" +
         "website: " + CONFIG.SIGNATURE_URL;
}

function sendSelfConfirmationEmailDE(email, fullName, uniqueCode) {
  var signature = buildSignatureDE();
  var subject = 'Завершіть реєстрацію в програмі UPLAYS: Персональний код учасника та наступні кроки';
  var body = 'Вітаємо ' + fullName + ',\n\n' +
    'Дякуємо за заповнення реєстраційної форми!\n\n' +
    'Ось ваш унікальний код учасника:\n\n' +
    uniqueCode + '\n\n' +
    'Цей код буде використовуватись для анонімного відстеження вашого прогресу та збору зворотного зв’язку. Будь ласка збережіть його.\n\n' +
    'Щоб завершити реєстрацію, заповніть, будь ласка, анкету за наступним посиланням. Якщо ви не плануєте відвідувати заняття з працевлаштування чи спорту, цю частину можна пропустити:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Після заповнення анкети ваша реєстрація буде завершена!\n\n' +
    'Якщо у вас виникнуть запитання чи проблеми, звертайтеся до нас за адресою: ' + CONFIG.SUPPORT_EMAIL + '.\n\n' +
    'Дякуємо за ваш час. Ми з нетерпінням чекаємо зустрічі з вами на програмі UPLAYS!\n\n' +
    'Формат: Zoom ' + CONFIG.ZOOM_URL + '.\n\n' +
    'ID зустрічі: ' + CONFIG.ZOOM_ID + '\n\n' +
    'Код доступу: ' + CONFIG.ZOOM_PASSCODE + '\n\n' +
    'Час: Щопонеділка, з 18:00 до 19:00!\n\n' +
    'Рекомендуємо приєднатися до наших каналів WhatsApp та/або Telegram, де ми публікуємо оновлення про заняття та активності UPLAYS:\n\n' +
    '🔵 Telegram: ' + CONFIG.TELEGRAM_URL + '\n\n' +
    '🟢 WhatsApp: ' + CONFIG.WHATSAPP_URL +
    signature;

  MailApp.sendEmail(email, subject, body);
}

function sendParentConfirmationEmailDE(parentEmail, parentFullName, childFullName, uniqueCode, childEmail) {
  var signature = buildSignatureDE();
  var subject = 'Завершіть реєстрацію вашої дитини в програмі UPLAYS: Код учасника та наступні кроки';
  var body = 'Вітаємо ' + parentFullName + ',\n\n' +
    'Дякуємо, що заповнили реєстраційну форму для вашої дитини, ' + childFullName + '!\n\n' +
    'Ось унікальний код учасника:\n\n' +
    uniqueCode + '\n\n' +
    'Цей код буде використовуватися для анонімного відстеження прогресу та збору зворотного зв’язку. Будь ласка, збережіть його.\n\n' +
    'Щоб завершити реєстрацію, будь ласка, заповніть анкету за наступним посиланням. Якщо ваша дитина не планує відвідувати заняття з працевлаштування або спорту, цю частину можна пропустити:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Після заповнення анкети реєстрацію буде завершено.\n\n' +
    'Якщо у вас виникнуть запитання або проблеми, звертайтеся до нас за адресою: ' + CONFIG.SUPPORT_EMAIL + '.\n\n' +
    'Дякуємо за ваш час. Ми з нетерпінням чекаємо на участь вашої дитини в програмі UPLAYS!\n\n' +
    'Формат: Zoom ' + CONFIG.ZOOM_URL + '.\n\n' +
    'ID зустрічі: ' + CONFIG.ZOOM_ID + '\n\n' +
    'Код доступу: ' + CONFIG.ZOOM_PASSCODE + '\n\n' +
    'Час: Щопонеділка, з 18:00 до 19:00!\n\n' +
    'Рекомендуємо приєднатися до наших каналів WhatsApp та/або Telegram, де ми публікуємо оновлення про заняття та активності UPLAYS:\n\n' +
    '🔵 Telegram: ' + CONFIG.TELEGRAM_URL + '\n\n' +
    '🟢 WhatsApp: ' + CONFIG.WHATSAPP_URL +
    signature;

  MailApp.sendEmail(parentEmail, subject, body);
}

function sendChildConfirmationEmailDE(childEmail, childFullName, uniqueCode) {
  var signature = buildSignatureDE();
  var subject = 'Завершіть реєстрацію в програмі UPLAYS: Персональний код учасника та наступні кроки';
  var body = 'Шановна ' + childFullName + ',\n\n' +
    'Ваш батько, мати або опікун зареєстрували вас у програмі UPLAYS.\n\n' +
    'Ось ваш унікальний код учасника:\n\n' +
    uniqueCode + '\n\n' +
    'Збережіть цей код, оскільки він знадобиться вам для подальшої участі в програмі.\n\n' +
    'Щоб завершити реєстрацію, будь ласка, заповніть анкету за наступним посиланням. Якщо ви не плануєте відвідувати заняття з працевлаштування або спорту, цю частину можна пропустити:\n' +
    CONFIG.FORM_FOLLOWUP_URL + '\n\n' +
    'Після заповнення анкети вашу реєстрацію буде завершено.\n\n' +
    'Якщо у вас виникнуть запитання або проблеми, звертайтеся до нас за адресою: ' + CONFIG.SUPPORT_EMAIL + '.\n\n' +
    'Дякуємо за ваш час. Ми з нетерпінням чекаємо на зустріч із вами в програмі UPLAYS!\n\n' +
    'Формат: Zoom ' + CONFIG.ZOOM_URL + '.\n\n' +
    'ID зустрічі: ' + CONFIG.ZOOM_ID + '\n\n' +
    'Код доступу: ' + CONFIG.ZOOM_PASSCODE + '\n\n' +
    'Час: Щопонеділка, з 18:00 до 19:00!\n\n' +
    'Рекомендуємо приєднатися до наших каналів WhatsApp та/або Telegram, де ми публікуємо оновлення про заняття та активності UPLAYS:\n\n' +
    '🔵 Telegram: ' + CONFIG.TELEGRAM_URL + '\n\n' +
    '🟢 WhatsApp: ' + CONFIG.WHATSAPP_URL +
    signature;

  MailApp.sendEmail(childEmail, subject, body);
}