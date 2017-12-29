const _ = require('lodash');
const {
  getIssuesWithoutTimeSpent,
  getIssuesWithoutEstimation,
  getIssuesWithoutAssignees,
} = require('./getIssues');
const { sendIssueReminders } = require('./sendIssueReminders');

const REMIND_COOLDOWN_SECONDS = 10; // To make sure we are not spamming

/**
 * Remind issue estimations task
 */
const remindYoutrackIssues = async (bot) => {
  // Make sure we didn't run this task recently
  const rdsCli = bot.getRdsCli();
  rdsCli.get('lastRemindIssueEstimations', async (err, reply) => {
    if (!reply) {
      rdsCli.set('lastRemindIssueEstimations', Date.now(), 'EX', REMIND_COOLDOWN_SECONDS);

      // Get issues
      const noTimeSpentPromise = getIssuesWithoutTimeSpent();
      const noEstimationPromise = getIssuesWithoutEstimation();
      const noAssigneesPromise = getIssuesWithoutAssignees();
      const [noTimeSpent, noEstimation, noAssignees] = await Promise.all([
        noTimeSpentPromise,
        noEstimationPromise,
        noAssigneesPromise,
      ]);

      // Concat issue arrays and group by user
      const issues = [...noTimeSpent, ...noEstimation, ...noAssignees];
      const groupedIssues = _.groupBy(issues, 'user');

      await sendIssueReminders(groupedIssues, bot);
    } else {
      console.log('Recently ran this task. Cancel!');
    }

    // Finished, disconnect and exit!
    bot.disconnect();
  });
};

module.exports = { remindYoutrackIssues };
