const Bot = require('../../models/Bot');
const { remindYoutrackIssues } = require('./remindYoutrackIssues');

try {
  // Create bot instance and pass task to be run after it is initialized
  const bot = new Bot(process.env.SLACK_TOKEN, remindYoutrackIssues); // eslint-disable-line
} catch (e) {
  console.error(e);
}
