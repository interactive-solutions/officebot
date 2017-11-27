const trigger = (message, bot) => {
  if (message.getText() === '!help') {
    sendHelp(message, bot);
    return true;
  }

  return false;
};

const sendHelp = (message, bot) => {
  const msg = `Hej! :wave:\nJag är fortfarande under utveckling, men jag ska försöka se till att
  rättvist välja ut städansvariga varje måndag samt påminna dessa under veckan.
  Du kan även fråga mig saker som:\n
  *"Vem har städvecka?"* - för att ta reda på som är städansvarig\n
  *"Vad ska göras på städveckan?"* - för att få en beskrivning om vad som förväntas
  av en städansvarig\n
  *"Inaktivera @person från städvecka till <datum>"* - om någon t.ex. är bortrest\n
  *"Det är stökigt i köket!"* - för att anonymt skicka påminnelser till dom städansvariga
  \n\nOm något inte funkar som det ska, eller om du har förslag på funktioner - säg till Jakob!`;
  bot.sendMessage(msg, message.getChannel());
};

module.exports = {
  trigger,
};
