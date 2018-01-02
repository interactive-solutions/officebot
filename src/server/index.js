const express = require('express');
const bodyParser = require('body-parser');

const { slackActionRouter } = require('./slackActionRouter');

const startServer = () => {
  const app = express();
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  app.post('/slack/message_action', (req, res) => slackActionRouter(req, res));

  app.listen(3000, () => console.log('Starting express - listening on port 3000.'));
};

module.exports = { startServer };
