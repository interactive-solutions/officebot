const COMMAND_HELP = require('./commands/help');
const COMMAND_USERS = require('./commands/users');

const CLEANING_WHOIS = require('./cleaning/whois');
const CLEANING_DISABLE = require('./cleaning/disable');
const CLEANING_ENABLE = require('./cleaning/enable');
const CLEANING_REMIND = require('./cleaning/remind');
const CLEANING_TODO = require('./cleaning/todo');

const USERS_PARTTIME = require('./users/parttime');

const GENERAL_EMPTY = require('./general/empty');
const GENERAL_GREETING = require('./general/greeting');
const GENERAL_OK = require('./general/ok');
const GENERAL_EASTEREGGS = require('./general/easterEggs');

module.exports = [
  GENERAL_EMPTY,
  COMMAND_HELP,
  COMMAND_USERS,
  CLEANING_WHOIS,
  CLEANING_DISABLE,
  CLEANING_ENABLE,
  CLEANING_REMIND,
  CLEANING_TODO,
  USERS_PARTTIME,
  GENERAL_GREETING,
  GENERAL_OK,
  GENERAL_EASTEREGGS,
];
