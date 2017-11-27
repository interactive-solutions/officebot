const { getRandomComplyWord } = require('../../utils/randomMessage');

const trigger = (message, bot) => {
  if (message.hasAnyWord('inaktivera avaktivera')) {
    const user = message.getTaggedUser();
    const date = message.getDate();
    if (user && date) {
      disableUser(message, bot, user, date);
    } else {
      giveHint(message, bot);
    }
    return true;
  }

  return false;
};

const giveHint = (message, bot) => {
  const msg = `Vill du inaktivera en person från städschemat? Du måste inkludera vem det
  gäller och ange slutdatum, t.ex: "Inaktivera @slackbot till 2018-01-01"`;
  bot.sendMessage(msg, message.getChannel());
};

const disableUser = (message, bot, user, date) => {
  const userKey = `user:${user}`;
  bot.rdsCli.hget(userKey, 'id', (err, reply) => {
    if (reply !== null) {
      bot.rdsCli.hset(userKey, 'cleaningDisabledUntil', date, () => {
        bot.sendMessage(
          `${getRandomComplyWord()}! <@${user}> är inaktiverad från städuppdrag till ${
            date
          } :grimacing:`,
          message.getChannel(),
        );
      });
    } else {
      bot.sendMessage('Kunde inte inaktivera den personen.', message.getChannel());
    }
  });
};

module.exports = {
  trigger,
};
