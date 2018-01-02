/* eslint-disable */
const Cronjob = require('cron').CronJob;
const Bot = require('../models/Bot');
const { remindYoutrackIssues } = require('./remindYoutrackIssues/remindYoutrackIssues');
const { assignCleaningDuty } = require('./assignCleaningDuty/assignCleaningDuty');

const startCron = () => {
  try {
    console.log('Starting cron...');

    // Cron for Youtrack reminders
    new Cronjob(
      '00 10 13 * * 1-5',
      () => {
        console.log('Run remindYoutrackIssues!');
        new Bot(process.env.SLACK_TOKEN, remindYoutrackIssues);
      },
      null,
      true,
      'Europe/Stockholm',
    );

    // Cron for assigning cleaning duty
    new Cronjob(
      '00 30 8 * * 1',
      () => {
        console.log('Run assignCleaningDuty!');
        new Bot(process.env.SLACK_TOKEN, assignCleaningDuty);
      },
      null,
      true,
      'Europe/Stockholm',
    );
  } catch (e) {
    console.error(e);
  }
};

module.exports = { startCron };
