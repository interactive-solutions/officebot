const _ = require('lodash');
const { timeReportIssue, estimateIssue } = require('./youtrackActions');

const ERROR_MSG = 'Något gick fel. Försök igen senare!';

const slackActionRouter = (req, res) => {
  // Parse payload
  let payload = {};
  try {
    payload = JSON.parse(req.body.payload);
  } catch (e) {
    res.json(error());
    return false;
  }

  // Cancel if token in payload is invalid
  if (!verifyToken(payload)) {
    res.json(error());
    return false;
  }

  // Validate and extract action and issue id in payload
  const callbackData = extractCallbackData(payload);
  if (!extractCallbackData) {
    res.json(error());
    return false;
  }

  const value = _.get(payload.actions[0], 'value');
  const { action, issue, user } = callbackData;
  let success = false;

  // Route to correct action function
  switch (action) {
    case 'NO_TIME_SPENT':
      success = timeReportIssue(issue, value, user);
      break;
    case 'NO_ESTIMATION':
      success = estimateIssue(issue, value, user);
      break;
    default:
      break;
  }

  if (!success) {
    res.json(error());
    return false;
  }

  // Print response message
  const responseMessage = replaceOriginalMessage(payload, issue, value);
  res.json(responseMessage);
};

/**
 * Verifies Slack payload token
 */
const verifyToken = payload => payload && payload.token === process.env.SLACK_VERIFICATION_TOKEN;

/**
 * Returning action and issue from payload if found, otherwise false
 */
const extractCallbackData = (payload) => {
  if (payload.callback_id) {
    const callbackData = payload.callback_id.split('#');
    if (callbackData.length === 3) {
      return { action: callbackData[0], issue: callbackData[1], user: callbackData[2] };
    }
  }

  return false;
};

/**
 * Replaces the updated attachment in the original message with a success message
 */
const replaceOriginalMessage = (payload, issue, value) => {
  const message = payload.original_message;

  // Get message attachments
  const { attachments } = message;
  const attachmentIndex = payload.attachment_id - 1;

  // Replace attachment at attachmentIndex with a modified copy
  attachments.splice(attachmentIndex, 1, {
    ...attachments[attachmentIndex],
    ...{
      actions: [
        {
          type: 'button',
          style: 'primary',
          url: `${process.env.YOUTRACK_URL}/issue/${issue}`,
          text: `:white_check_mark: ${value}`,
        },
      ],
    },
  });

  // Set new attachments
  message.attachments = attachments;
  return message;
};

/**
 * Returns generic error object
 */
const error = () => ({
  response_type: 'ephemeral',
  replace_original: false,
  text: ERROR_MSG,
});

module.exports = { slackActionRouter };
