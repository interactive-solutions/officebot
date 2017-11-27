const { pickRandomMessage } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasWord('ok')) {
    action(message, bot);
    return true;
  }

  return false;
};

const action = (message, bot) => {
  bot.sendMessage(pickRandomMessage(messages), message.getChannel());
};

const messages = ['Okej.', 'Okej!', 'Ok.', 'Ok!', ':+1:'];

module.exports = {
  trigger,
};
