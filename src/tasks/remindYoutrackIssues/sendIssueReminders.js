const _ = require('lodash');
const { getRandomGreeting, pickRandomMessage } = require('../../utils/randomMessage');

const MESSAGES = [
  'Jag hittade %1 som behöver kompletteras',
  'Jag hittade %1 som behöver kompletteras med information',
  'Det finns %1 som skulle behöva kompletteras',
  'Det finns %1 som skulle behöva kompletteras med information',
  'Du skulle behöva komplettera %1 med information',
  'Jag saknar lite information för %1',
];

const MULTIPLE_ISSUES = ['ett par issues', 'några issues', 'ett par taskar', 'några taskar'];
const SINGLE_ISSUE = ['en issue', 'en task'];

const QUESTION_MESSAGES = [
  'kan du ta en titt?',
  'har du en minut?',
  'kan du slå ett getöga?',
  'har du lust att ordna det?',
  'har du lust att kika?',
  'kan du kika?',
  'kan du fixa?',
  'kan du kolla?',
];

const EMOJIS = [
  ':slightly_smiling_face:',
  ':grimacing:',
  ':blush:',
  ':nerd_face:',
  ':relaxed:',
  ':sunglasses:',
];

const ATTCH_PRETEXTS = {
  NO_TIME_SPENT: ':clock3: - *Saknar tidrapportering*',
  NO_ESTIMATION: ':speech_balloon: - *Saknar estimering*',
  NO_ASSIGNEES: ':raising_hand: - *Saknar assignees*',
};

const ATTCH_COLORS = {
  NO_TIME_SPENT: '#00bb99',
  NO_ESTIMATION: '#6900ff',
  NO_ASSIGNEES: '#cb0059',
};

const ACTIONS = ['30m', '1h', '2h', '4h', '1d'];

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
      const noTimeSpentIssues = _.filter(issues, { type: 'NO_TIME_SPENT' });
      const noEstimationIssues = _.filter(issues, { type: 'NO_ESTIMATION' });
      const noAssigneesIssues = _.filter(issues, { type: 'NO_ASSIGNEES' });

      let attachments = [];

      // Create message
      const message = `${getRandomGreeting()} ${pickRandomMessage(MESSAGES).replace(
        '%1',
        pickRandomMessage(issues.length > 1 ? MULTIPLE_ISSUES : SINGLE_ISSUE),
      )}, ${pickRandomMessage(QUESTION_MESSAGES)} ${pickRandomMessage(EMOJIS)}\n\u2063`; // eslint-disable-line

      // Add issues without time spent
      if (noTimeSpentIssues.length > 0) {
        attachments = _.concat(
          attachments,
          _.map(_.slice(noTimeSpentIssues, 0, 10), (issue, index) =>
            getSlackAttachment(issue, index === 0)),
        );
        attachments.push(getEmptySlackAttachment());
      }

      // Add issues without estimations
      if (noEstimationIssues.length > 0) {
        attachments = _.concat(
          attachments,
          _.map(_.slice(noEstimationIssues, 0, 10), (issue, index) =>
            getSlackAttachment(issue, index === 0)),
        );
        attachments.push(getEmptySlackAttachment());
      }

      // Add issues without assignees
      if (noAssigneesIssues.length > 0) {
        attachments = _.concat(
          attachments,
          _.map(_.slice(noAssigneesIssues, 0, 10), (issue, index) =>
            getSlackAttachment(issue, index === 0)),
        );
        attachments.push(getEmptySlackAttachment());
      }

      // Send IM to user with the issues
      console.log(`Sending reminder to ${user}`);
      console.log(message);
      console.log(attachments);
      bot.sendIM(message, slackId, { attachments });
    }
  });
};

/**
 * Returns a Slack attachment object from an issue
 */
const getSlackAttachment = (issue, first) => {
  let pretext = '';
  if (first) {
    pretext = _.get(ATTCH_PRETEXTS, issue.type);
  }

  const issueName = _.get(_.find(issue.issue.field, { name: 'summary' }), 'value', '');
  const title = `${issue.issue.id}: ${issueName}`;
  const titleLink = `${process.env.YOUTRACK_URL}/issue/${issue.issue.id}`;
  const color = _.get(ATTCH_COLORS, issue.type);
  const callbackId = `${issue.type}#${issue.issue.id}#${issue.user}`;
  const actions = getActions(issue.type);

  return {
    pretext,
    title: `:youtrack: ${title}`,
    title_link: titleLink,
    color,
    fallback: title,
    actions,
    callback_id: callbackId,
    mrkdwn_in: ['pretext'],
  };
};

const getEmptySlackAttachment = () => ({
  text: '\u2063',
  color: '#fafafa',
});

const getActions = (type) => {
  switch (type) {
    case 'NO_ESTIMATION':
    case 'NO_TIME_SPENT':
      return _.map(ACTIONS, action => ({
        type: 'button',
        name: 'choice',
        value: action,
        text: action,
      }));
    default:
      return [];
  }
};

module.exports = { sendIssueReminders };
