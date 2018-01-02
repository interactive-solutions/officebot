const _ = require('lodash');
const axios = require('axios');

axios.defaults.headers.common.Authorization = `Bearer ${process.env.YOUTRACK_TOKEN}`;

// Valid estimation + time report values
const VALID_VALUES = {
  '30m': 30,
  '1h': 60,
  '2h': 120,
  '4h': 240,
  '1d': 480,
};

// Template for YouTrack's time reporting that only supports xml :S
const TIME_REPORT_TEMPLATE = `
<workItems>
  <workItem>
    <author login="%1"></author>
    <date>%2</date>
    <duration>%3</duration>
  </workItem>
</workItems>
`;

/**
 * Reporting time to YouTrack
 */
const timeReportIssue = (issue, value, user) => {
  if (_.has(VALID_VALUES, value)) {
    // Create request body
    const body = TIME_REPORT_TEMPLATE.replace('%1', user)
      .replace('%2', Date.now())
      .replace('%3', VALID_VALUES[value]);

    // Send request
    axios
      .put(`${process.env.YOUTRACK_URL}/rest/import/issue/${issue}/workitems`, body, {
        headers: { 'Content-Type': 'application/xml' },
      })
      .then(() => {
        // Do nothing
      })
      .catch(() => {
        // Do nothing
      });

    return true; // Success
  }

  // If value was invalid
  return false;
};

/**
 * Posts estimation of an issue to YouTrack
 */
const estimateIssue = (issue, value, user) => {
  if (_.has(VALID_VALUES, value)) {
    // Send request
    axios
      .post(`${process.env.YOUTRACK_URL}/rest/issue/${issue}/execute?command=estimation ${
        value
      }&runAs=${user}&disableNotifications=true`)
      .then(() => {
        // Do nothing
      })
      .catch(() => {
        // Do nothing
      });

    return true;
  }

  return false;
};

module.exports = { timeReportIssue, estimateIssue };
