const _ = require('lodash');
const { getIssuesWithoutEstimations, getIssuesWithoutAssignees } = require('./getIssues');
const { sendIssueReminders } = require('./sendIssueReminders');

const REMIND_COOLDOWN_SECONDS = 60; // To make sure we are not spamming

/**
 * Remind issue estimations task
 */
const remindIssueEstimations = async (bot) => {
  // Make sure we didn't run this task recently
  const rdsCli = bot.getRdsCli();
  rdsCli.get('lastRemindIssueEstimations', async (err, reply) => {
    if (!reply) {
      rdsCli.set('lastRemindIssueEstimations', Date.now(), 'EX', REMIND_COOLDOWN_SECONDS);

      // Get issues
      const noEstimationsPromise = getIssuesWithoutEstimations();
      const noAssigneesPromise = getIssuesWithoutAssignees();
      const [noEstimations, noAssignees] = await Promise.all([
        noEstimationsPromise,
        noAssigneesPromise,
      ]);

      // Concat issue arrays and group by user
      const issues = [...noEstimations, ...noAssignees];
      const groupedIssues = _.groupBy(issues, 'user');

      await sendIssueReminders(groupedIssues, bot);
    } else {
      console.log('Recently ran this task. Cancel!');
    }

    // Finished, disconnect and exit!
    bot.disconnect();
  });
};

module.exports = { remindIssueEstimations };
