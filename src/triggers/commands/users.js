const _ = require('lodash');

const trigger = (message, bot) => {
  if (message.isDM() && message.getText() === '!users') {
    action(message, bot);
    return true;
  }

  return false;
};

const action = (message, bot) => {
  let msg = '';
  bot
    .getUsers()
    .then((users) => {
      _.forEach(users, (user) => {
        msg += `\n${JSON.stringify(user)}`;
      });

      bot.sendMessage(msg, message.getChannel());
    })
    .catch(() => {});
};

module.exports = {
  trigger,
};
