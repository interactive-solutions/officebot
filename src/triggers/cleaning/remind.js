const _ = require('lodash');
const { getRandomComplyWord, pickRandomMessage } = require('../../utils/randomMessage');

const REMIND_COOLDOWN_SECONDS = 60 * 60 * 12;

const REMIND_MESSAGES = [
  'Glöm inte bort att ni har städvecka ',
  'Någon tycker det är stökigt ',
  'Eran mamma jobbar inte här, dags att städa ',
  'Trist att jag måste påminna er, men ni har städvecka ',
];

const trigger = (message, bot) => {
  if (
    message.hasAnyWord('stökigt smutsigt kladdigt') ||
    message.hasWord('behöver städas') ||
    message.hasAllWords('diskmaskin plocka')
  ) {
    remindAssignees(message, bot);
    return true;
  }

  return false;
};

const remindAssignees = (message, bot) => {
  if (!message.isDM()) {
    bot.sendMessage('Vi tar det på DM va? :grin:', message.getChannel());
    return false;
  }

  const rdsCli = bot.getRdsCli();
  rdsCli.lrange('cleaningAssignees', 0, 5, (err, reply) => {
    if (!reply || reply.length === 0) {
      bot.sendMessage(
        'Verkar inte finnas några städansvariga just nu... :worried:',
        message.getChannel(),
      );
    } else {
      rdsCli.get('lastCleaningReminder', (err, reply) => {
        if (!reply) {
          bot.sendMessage(
            `${getRandomComplyWord()}, jag påminner dom städansvariga! :punch:`,
            message.getChannel(),
          );

          rdsCli.set('lastCleaningReminder', Date.now(), 'EX', REMIND_COOLDOWN_SECONDS);
          rdsCli.lrange('cleaningAssignees', 0, 5, (err, reply) => {
            let msg = pickRandomMessage(REMIND_MESSAGES);
            let i = 0;
            _.forEach(reply, (user) => {
              i++;
              if (i > 1) msg += ' och ';
              msg += `<@${user.replace('user:', '')}>`;
            });
            msg += '! :imp: :shit: :mask:';

            bot.sendMessage(msg, bot.announcementChannelId);
          });
        } else {
          bot.sendMessage(
            `Jag har redan påmint dom städansvariga nyligen! Den här länken kanske är något för dig?
            https://www.thebalance.com/dealing-with-difficult-people-at-work-1917903`,
            message.getChannel(),
          );
        }
      });
    }
  });
};

module.exports = {
  trigger,
};
