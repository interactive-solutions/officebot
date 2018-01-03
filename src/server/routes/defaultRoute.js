const path = require('path');

const defaultRoute = (req, res) => res.sendFile(path.join(__dirname, 'defaultRoute.html'));

module.exports = { defaultRoute };
