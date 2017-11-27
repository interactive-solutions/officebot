const pickRandomMessage = messages => messages[Math.floor(Math.random() * messages.length)];

const getRandomComplyWord = () => COMPLY_WORDS[Math.floor(Math.random() * COMPLY_WORDS.length)];

const COMPLY_WORDS = ['Okej', 'Ok', 'Sure', 'Aight', 'Cool', 'Yes', 'Okidoki', 'Alright'];

module.exports = { pickRandomMessage, getRandomComplyWord };
