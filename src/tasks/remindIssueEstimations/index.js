const Bot = require('../../models/Bot');
const { remindIssueEstimations } = require('./remindIssueEstimations');

try {
  // Get env vars
  const {
    SLACK_TOKEN,
    ANNOUNCEMENT_CHANNEL_ID,
    REDIS_URL_V2,
    YOUTRACK_TOKEN,
    YOUTRACK_URL,
  } = process.env;
  if (
    !SLACK_TOKEN ||
    !ANNOUNCEMENT_CHANNEL_ID ||
    !REDIS_URL_V2 ||
    !YOUTRACK_TOKEN ||
    !YOUTRACK_URL
  ) {
    throw new Error('Required environment vars missing.');
  }

  // Create bot instance and pass task to be run after it is initialized
  const bot = new Bot(SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID, remindIssueEstimations); // eslint-disable-line
} catch (e) {
  console.error(e);
}
