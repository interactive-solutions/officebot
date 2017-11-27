const { getRandomComplyWord } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasAnyWord('jobbar anställd arbetar') && message.hasAnyWord('halvtid deltid')) {
    const user = message.getTaggedUser();
    if (user) {
      setPartTime(message, bot, user, true);
    } else {
      giveHint(message, bot);
    }
    return true;
  } else if (message.hasAnyWord('jobbar anställd arbetar') && message.hasWord('heltid')) {
    const user = message.getTaggedUser();
    if (user) {
      setPartTime(message, bot, user, false);
    } else {
      giveHint(message, bot);
    }
    return true;
  }

  return false;
};

const giveHint = (message, bot) => {
  bot.sendMessage(
    `Se till att inkludera den person du vill sätta heltid/halvtid på,
    tex: "@slackbot jobbar halvtid".`,
    message.getChannel(),
  );
};

const setPartTime = (message, bot, user, partTime) => {
  const userKey = `user:${user}`;
  bot.rdsCli.hget(userKey, 'id', (err, reply) => {
    if (reply !== null) {
      bot.rdsCli.hset(userKey, 'partTime', partTime, () => {
        bot.sendMessage(`${getRandomComplyWord()}, det är uppfattat!`, message.getChannel());
      });
    } else {
      bot.sendMessage('Kunde inte ändra den här personen.', message.getChannel());
    }
  });
};

module.exports = {
  trigger,
};
