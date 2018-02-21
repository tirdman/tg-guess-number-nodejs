const TelegramBot = require('node-telegram-bot-api');
const config = require('../config');

let usersAttempts;
let unknownNumber;
restoreAll();

var bot = new TelegramBot(config.token, { polling: true });
bot.onText(/\/echo (.+)/, (msg, match) => {
  const resp = match[1];
  bot.sendMessage(chatId, resp);
});

bot.on('message', msg => {
  const chatId = msg.chat.id;
  const text = msg.text.trim();

  if (text == '/start') {
    bot.sendMessage(chatId, `Угадайте 4-значное число.`);
    return;
  }

  if (!isNumber(text) || text.length != 4) {
    bot.sendMessage(
      chatId,
      'Введенный текст должен содержать только 4-значное число. Повторите ввод.',
    );
    return;
  }

  usersAttempts.push(msg);
  const attempts = getAttemptByUser(msg.from.id);

  const answer = checkInputNumber(text);

  if (answer == 'BBBB') {
    bot.sendMessage(
      chatId,
      `Поздравляем! Вы угадали число ${unknownNumber} с попытки: ${
        attempts.length
      }. Сгенерировано новое число.`,
    );
    const allUserInQuest = getAllUserInCurrentQuest();
    for (let nextUser of allUserInQuest) {
      if (nextUser == msg.from.id) continue;
      bot.sendMessage(
        nextUser,
        `Игра завершена. Игрок ${msg.from.first_name} ${
          msg.from.last_name
        } угадал число ${unknownNumber} с попытки: ${
          attempts.length
        }. Сгенерировано новое число.`,
      );
    }
    restoreAll();
    return;
  }

  bot.sendMessage(
    chatId,
    `Попытка: ${attempts.length}. Не угадали: ${answer}. `,
  );
});


function restoreAll() {
  unknownNumber = generateNewNumber();
  usersAttempts = [];
  console.log(unknownNumber);
}

function isNumber(num) {
  return /^\d+$/.test(num);
}

function getRandomArbitrary(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function generateNewNumber() {
  return getRandomArbitrary(1000, 9999) + '';
}

function checkInputNumber(inputNumber) {
  let answer = '';
  for (let i = 0; i < inputNumber.length; i++) {
    if (inputNumber[i] == unknownNumber[i]) {
      answer += 'B';
    } else if (unknownNumber.includes(inputNumber[i]))
      answer += 'K';
    else answer += '-';
  }
  return answer;
}

function getAttemptByUser(uesrId) {
  return usersAttempts.filter(val => {
    return val.from.id == uesrId;
  });
}

function getAllUserInCurrentQuest() {
  let uniqUser = [];
  for (let i = 0; i < usersAttempts.length; i++) {
    if (!uniqUser.includes(usersAttempts[i].from.id)) {
      uniqUser.push(usersAttempts[i].from.id);
    }
  }
  return uniqUser;
}
