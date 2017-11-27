const { pickRandomMessage } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasAnyWord('hej tja tjena tjo hey tjabba yo hallå hell godmorgon godkväll goddag')) {
    action(message, bot);
    return true;
  }

  return false;
};

const action = (message, bot) => {
  bot.sendMessage(pickRandomMessage(messages), message.getChannel());
};

const messages = [
  'Hallå där!',
  'Hej!',
  'Hejsan!',
  'Tjena!',
  'Nej men hej på dig du!',
  'Halli hallå!',
  'Goddag!',
];

module.exports = {
  trigger,
};
