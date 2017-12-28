const _ = require('lodash');

const pickRandomMessage = messages => _.sample(messages);

const getRandomComplyWord = () => pickRandomMessage(COMPLY_WORDS);
const COMPLY_WORDS = ['Okej', 'Ok', 'Sure', 'Aight', 'Cool', 'Yes', 'Okidoki', 'Alright'];

const getRandomGreeting = () => pickRandomMessage(GREETINGS);
const GREETINGS = [
  'Hallå där!',
  'Hej!',
  'Hejsan!',
  'Tjena!',
  'Nej men hej på dig du!',
  'Halli hallå!',
  'Goddag!',
];

module.exports = { pickRandomMessage, getRandomComplyWord, getRandomGreeting };
