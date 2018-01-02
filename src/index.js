const Bot = require('./models/Bot');
const { startServer } = require('./server');
const { startCron } = require('./tasks/cron');

try {
  console.log('Starting bot..');
  const bot = new Bot(process.env.SLACK_TOKEN); // eslint-disable-line

  startServer();
  startCron();
} catch (e) {
  console.error(e);
}
