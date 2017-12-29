const slackActionRouter = (req, res) => {
  console.log('Handle action!');
  console.log(req.body);
  res.send('handling!');
};

module.exports = { slackActionRouter };
