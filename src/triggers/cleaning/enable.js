const { getRandomComplyWord } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasWord('aktivera')) {
    const user = message.getTaggedUser();
    if (user) {
      enableUser(message, bot, user);
    } else {
      giveHint(message, bot);
    }
    return true;
  }

  return false;
};

const giveHint = (message, bot) => {
  bot.sendMessage(
    `Vill du aktivera en person till städschemat? Inkludera vem det gäller också,
    t.ex: "Aktivera @slackbot"`,
    message.getChannel(),
  );
};

const enableUser = (message, bot, user) => {
  const userKey = `user:${user}`;
  bot.rdsCli.hget(userKey, 'id', (err, reply) => {
    if (reply !== null) {
      bot.rdsCli.hset(userKey, 'cleaningDisabledUntil', '2010-01-01', () => {
        bot.sendMessage(
          `${getRandomComplyWord()}! <@${user}> är aktiverad from. nu :+1:`,
          message.getChannel(),
        );
      });
    } else {
      bot.sendMessage('Kunde inte aktivera den personen.', message.getChannel());
    }
  });
};

module.exports = {
  trigger,
};
