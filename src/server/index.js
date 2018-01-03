const express = require('express');
const bodyParser = require('body-parser');
const favicon = require('serve-favicon');
const path = require('path');

const { slackMessageAction } = require('./routes/slackMessageAction');
const { defaultRoute } = require('./routes/defaultRoute');

const startServer = () => {
  // Init express
  const app = express();

  // Use bodyparser
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());

  // Serve static dir
  app.use(express.static(path.join(__dirname, 'static')));

  // Add favicon
  app.use(favicon(path.join(__dirname, 'static', 'favicon.png')));

  // Define routes
  app.post('/slack/message_action', (req, res) => slackMessageAction(req, res));
  app.get('*', (req, res) => defaultRoute(req, res));

  // Start listening
  app.listen(3000, () => console.log('Starting express - listening on port 3000.'));
};

module.exports = { startServer };
