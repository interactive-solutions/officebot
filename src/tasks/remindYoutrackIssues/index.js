const Bot = require('../../models/Bot');
const { remindYoutrackIssues } = require('./remindYoutrackIssues');

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

  const day = new Date().getDay();
  if (day >= 1 && day <= 5) {
    // Create bot instance and pass task to be run after it is initialized
    const bot = new Bot(SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID, remindYoutrackIssues); // eslint-disable-line
  } else {
    console.log('Not a weekday, do not bother people...');
  }
} catch (e) {
  console.error(e);
}
