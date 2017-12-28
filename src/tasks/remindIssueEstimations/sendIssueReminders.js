const _ = require('lodash');
const { getRandomGreeting, pickRandomMessage } = require('../../utils/randomMessage');

const ESTIMATE_MESSAGES = [
  'Jag hittade nya issues som behöver estimeras',
  'Det finns nya issues som skulle behöva estimeras',
  'Dessa nya issues har ingen estimering än',
];

const ASSIGN_MESSAGES = [
  'Dessa issues har ingen person assignad ännu',
  'Du har skapat dessa issues men inte assignat någon än',
  'Jag hittade nya issues som du inte assignat',
];

const ESTIMATE_AND_ASSIGN_MESSAGES = [
  'Det finns issues som behöver kompletteras med estimation och assignering',
  'Jag hittade nya issues utan estimering och assignering',
];

const QUESTION_MESSAGES = [
  'kan du ta en titt?',
  'har du en minut?',
  'skulle du kunna lägga in det?',
  'kan du slå ett getöga?',
  'har du lust att ordna det?',
  'kan du kika?',
];

const EMOJIS = [
  ':slightly_smiling_face:',
  ':grimacing:',
  ':blush:',
  ':nerd_face:',
  ':relaxed:',
  ':sunglasses:',
];

/**
 * Sends reminders to Slack
 */
const sendIssueReminders = (users, bot) => {
  // Loop through issues grouped by users
  _.each(users, (issues, user) => {
    // Get Slack id from Youtrack user id
    const slackId = bot.getSlackIdFromYoutrackId(user);

    // If we found a slack user
    if (slackId) {
      // Separate issue types into two arrays
      const noEstimationIssues = _.filter(issues, { type: 'NO_ESTIMATION' });
      const noAssigneesIssues = _.filter(issues, { type: 'NO_ASSIGNEES' });
      let attachments = [];
      let message = '';

      if (noEstimationIssues.length > 0 && noAssigneesIssues.length > 0) {
        // User has issues to estimate AND assign
        attachments = _.map(_.slice(issues, 0, 15), issue => createSlackAttachmentFromIssue(issue));
        message = `${getRandomGreeting()} ${pickRandomMessage(ESTIMATE_AND_ASSIGN_MESSAGES,
        )}, ${pickRandomMessage(QUESTION_MESSAGES)} ${pickRandomMessage(EMOJIS)}`; // eslint-disable-line
      } else if (noEstimationIssues.length > 0) {
        // User has issues to estimate
        attachments = _.map(_.slice(noEstimationIssues, 0, 10), issue =>
          createSlackAttachmentFromIssue(issue));
        message = `${getRandomGreeting()} ${pickRandomMessage(ESTIMATE_MESSAGES,
        )}, ${pickRandomMessage(QUESTION_MESSAGES)} ${pickRandomMessage(EMOJIS)}`; // eslint-disable-line
      } else if (noAssigneesIssues.length > 0) {
        // User has issues to assign
        attachments = _.map(_.slice(noAssigneesIssues, 0, 10), issue =>
          createSlackAttachmentFromIssue(issue));
        message = `${getRandomGreeting()} ${pickRandomMessage(ASSIGN_MESSAGES,
        )}, ${pickRandomMessage(QUESTION_MESSAGES)} ${pickRandomMessage(EMOJIS)}`; // eslint-disable-line
      }

      // Send IM to user with issues
      // bot.sendIM(message, slackId, { attachments });
      console.log(message);
      console.log(user);
      console.log(attachments);
    }
  });
};

/**
 * Returns an attachment object from an issue to post to slack
 */
const createSlackAttachmentFromIssue = (issue) => {
  const issueName = _.get(_.find(issue.issue.field, { name: 'summary' }), 'value', '');
  const title = `${issue.issue.id}: ${issueName}`;
  const title_link = `${process.env.YOUTRACK_URL}/issue/${issue.issue.id}`; // eslint-disable-line
  const color = issue.type === 'NO_ASSIGNEES' ? '#cb0059' : '#2baa84';
  return {
    title: `:youtrack: ${title}`,
    title_link,
    color,
    fallback: title,
  };
};

module.exports = { sendIssueReminders };
