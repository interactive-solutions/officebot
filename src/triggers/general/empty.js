const { pickRandomMessage } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.isEmpty()) {
    action(message, bot);
    return true;
  }

  return false;
};

const action = (message, bot) => {
  bot.sendMessage(pickRandomMessage(REPLIES), message.getChannel());
};

const REPLIES = ['Ja?', 'Yes?', 'Vad har du på hjärtat?', 'Jag är här!', 'Ja, vill du något?'];

module.exports = {
  trigger,
};
