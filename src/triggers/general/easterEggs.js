const trigger = (message, bot) => {
  if (message.hasAllWords('vem är kung') && message.hasAnyWord('djungel sjön universum mig')) {
    linkKungenIDjungeln(message, bot);
    return true;
  }

  return false;
};

const linkKungenIDjungeln = (message, bot) => {
  bot.sendMessage('https://www.youtube.com/watch?v=rWylIgw2Mkw', message.getChannel());
};

module.exports = {
  trigger,
};
