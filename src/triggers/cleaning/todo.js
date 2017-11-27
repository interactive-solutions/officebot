const _ = require('lodash');

const TASKS = [
  'Plocka ur diskmaskinen',
  'Tömma alla soptunnor och återvinningsskåp och gå ner med det till soprummet',
  'Panta burkar',
  'Torka av köksbänkar och sociala ytor',
  'Byta handdukar och trasor vid behov på kök och toalett',
  'Se till att det finns toapapper och tvål på toaletter',
  'Tömma och göra rent kaffemaskinen',
];

const trigger = (message, bot) => {
  if (message.hasWord('vad') && message.hasWord('städ')) {
    answerTodo(message, bot);
    return true;
  }

  return false;
};

const answerTodo = (message, bot) => {
  let msg = 'Kul att du frågar! Dessa saker kan förväntas av en städansvarig:\n\n';
  _.forEach(TASKS, (task) => {
    msg += `:white_check_mark: ${task}\n`;
  });
  bot.sendMessage(msg, message.getChannel());
};

module.exports = {
  trigger,
};
