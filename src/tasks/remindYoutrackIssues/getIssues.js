const axios = require('axios');
const _ = require('lodash');

axios.defaults.headers.common.Authorization = `Bearer ${process.env.YOUTRACK_TOKEN}`;
axios.defaults.headers.common.Accept = 'application/json';

let updatedFilter = 'today,yesterday';

// Include issues updated on Friday and weekend if it's Monday
const today = new Date();
if (today.getDay() === 1) {
  today.setDate(today.getDate() - 3);
  updatedFilter = `${today.toISOString().slice(0, 10)} .. today`;
}

// Search filter for tasks that should be time tracked
const NO_TIME_SPENT_FILTER = encodeURIComponent(`
  updated:${updatedFilter}
  created:2017-10 .. today
  assignee:-unassigned
  state:resolved,{waiting for deploy *},{ready for test *}
  spent time:?,0m
  has:-{parent for}
  sort by:updated
`);

// Search filter for tasks that should be estimated
const NO_ESTIMATION_FILTER = encodeURIComponent(`
  updated:${updatedFilter}
  created:2017-10 .. today
  estimation:?
  assignee:-unassigned
  state:unresolved,-{waiting for deploy *},-{ready for test *}
  has:-{parent for}
  sort by:updated
`);

// Search filter for tasks that should be assigned
const NO_ASSIGNEES_FILTER = encodeURIComponent(`
  created:${updatedFilter}
  assignee:unassigned
  state:unresolved,-{waiting for deploy *},-{ready for test *}
  has:-{parent for}
  sort by:updated
`);

const REQUEST_WITH = '&with=assignee&with=reporterName&with=summary';

/**
 * Returns recently resolved issues without spent time
 */
const getIssuesWithoutTimeSpent = async () => {
  // Get recently updated tasks without estimations
  try {
    const req = await axios.get(`
      ${process.env.YOUTRACK_URL}/rest/issue?max=100&filter=
      ${NO_TIME_SPENT_FILTER}${REQUEST_WITH}`);

    const issues = [];

    _.each(req.data.issue, (issue) => {
      // Get assignees of issue
      const assignees = _.get(_.find(issue.field, { name: 'Assignee' }), 'value');
      if (assignees && Array.isArray(assignees)) {
        _.each(assignees, (assignee) => {
          issues.push({ user: assignee.value, type: 'NO_TIME_SPENT', issue });
        });
      }
    });

    return issues;
  } catch (e) {
    return [];
  }
};

/**
 * Returns recent issues without estimations
 */
const getIssuesWithoutEstimation = async () => {
  // Get recently updated tasks without estimations
  try {
    const req = await axios.get(`
      ${process.env.YOUTRACK_URL}/rest/issue?max=100&filter=
      ${NO_ESTIMATION_FILTER}${REQUEST_WITH}`);

    const issues = [];

    _.each(req.data.issue, (issue) => {
      // Get assignees of issue
      const assignees = _.get(_.find(issue.field, { name: 'Assignee' }), 'value');
      if (assignees && Array.isArray(assignees)) {
        _.each(assignees, (assignee) => {
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

module.exports = {
  getIssuesWithoutTimeSpent,
  getIssuesWithoutEstimation,
  getIssuesWithoutAssignees,
};
