const Bot = require('./models/Bot');

try {
  // Get env vars
  const { SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID, REDIS_URL } = process.env;
  if (!SLACK_TOKEN || !ANNOUNCEMENT_CHANNEL_ID || !REDIS_URL) {
    throw new Error('Required environment vars missing.');
  }

  const bot = new Bot(SLACK_TOKEN, ANNOUNCEMENT_CHANNEL_ID); // eslint-disable-line

  console.log('Starting RTM socket...');
} catch (e) {
  console.error(e);
}
