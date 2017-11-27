const _ = require('lodash');

const trigger = (message, bot) => {
  if (message.hasAnyWord('vem vilka') && message.hasWord('städ')) {
    answerWhois(message, bot);
    return true;
  }

  return false;
};

const answerWhois = (message, bot) => {
  const rdsCli = bot.getRdsCli();
  rdsCli.lrange('cleaningAssignees', 0, 5, (err, reply) => {
    if (!reply || reply.length === 0) {
      bot.sendMessage(
        'Det verkar inte finnas några städansvariga just nu. Tråkigt! :worried:',
        message.getChannel(),
      );
    } else {
      let msg = 'Städansvariga denna vecka är ';
      let i = 0;
      _.forEach(reply, (user) => {
        i++;
        if (i > 1) msg += ' och ';
        msg += `<@${user.replace('user:', '')}>`;
      });
      msg += ' :two_men_holding_hands:';
      bot.sendMessage(msg, message.getChannel());
    }
  });
};

module.exports = {
  trigger,
};
