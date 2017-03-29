let pswd = require('../static/admin_password.json');

module.exports = function(req, res, next) {
  if (req.path == '//login') return next();

  if (req.headers.auth === pswd.hash) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
}