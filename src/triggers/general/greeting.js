const { getRandomGreeting } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasAnyWord('hej tja tjena tjo hey tjabba yo hallå hell godmorgon godkväll goddag')) {
    action(message, bot);
    return true;
  }

  return false;
};

const action = (message, bot) => {
  bot.sendMessage(getRandomGreeting(), message.getChannel());
};

module.exports = {
  trigger,
};
