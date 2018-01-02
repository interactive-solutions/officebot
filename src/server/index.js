const express = require('express');
const bodyParser = require('body-parser');

const { slackActionRouter } = require('./slackActionRouter');

const PORT = process.env.PORT || 3000;

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/slack/message_action', (req, res) => slackActionRouter(req, res));

app.listen(PORT, () => console.log(`Starting express - listening on port ${PORT}.`));
