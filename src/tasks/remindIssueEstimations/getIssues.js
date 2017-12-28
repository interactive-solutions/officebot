const axios = require('axios');
const _ = require('lodash');

axios.defaults.headers.common.Authorization = `Bearer ${process.env.YOUTRACK_TOKEN}`;
axios.defaults.headers.common.Accept = 'application/json';

// Search filter for tasks that should be estimated
const NO_ESTIMATION_FILTER = encodeURIComponent(`
  updated:today,yesterday
  estimation:?
  assignee:-unassigned
  state:unresolved,-{waiting for deploy *},-{ready for test *}
  has:-{parent for}
  sort by:updated
`);

// Search filter for tasks that should be assigned
const NO_ASSIGNEES_FILTER = encodeURIComponent(`
  created:today,yesterday
  assignee:unassigned
  state:unresolved,-{waiting for deploy *},-{ready for test *}
  has:-{parent for}
  sort by:updated
`);

const REQUEST_WITH = '&with=assignee&with=reporterName&with=summary';

/**
 * Returns recent issues without estimations
 */
const getIssuesWithoutEstimations = async () => {
  // Get recently updated tasks without estimations
  try {
    const req = await axios.get(`
      ${process.env.YOUTRACK_URL}/rest/issue?max=100&filter=
      ${NO_ESTIMATION_FILTER}${REQUEST_WITH}`);

    const issues = [];

    _.each(req.data.issue, (issue) => {
      // Get assignees of issue
      const assignees = _.find(issue.field, { name: 'Assignee' });
      if (assignees.value && Array.isArray(assignees.value)) {
        _.each(assignees.value, (assignee) => {
          issues.push({ user: assignee.value, type: 'NO_ESTIMATION', issue });
        });
      }
    });

    return issues;
  } catch (e) {
    return [];
  }
};

/**
 * Returns recent issues without assignees
 */
const getIssuesWithoutAssignees = async () => {
  // Get recently updated tasks without assignees
  try {
    const req = await axios.get(`
      ${process.env.YOUTRACK_URL}/rest/issue?max=100&filter=
      ${NO_ASSIGNEES_FILTER}${REQUEST_WITH}`);

    const issues = [];

    _.each(req.data.issue, (issue) => {
      // Get creator of issue
      const creator = _.find(issue.field, { name: 'reporterName' });
      if (creator.value) {
        issues.push({ user: creator.value, type: 'NO_ASSIGNEES', issue });
      }
    });

    return issues;
  } catch (e) {
    return [];
  }
};

module.exports = { getIssuesWithoutEstimations, getIssuesWithoutAssignees };
