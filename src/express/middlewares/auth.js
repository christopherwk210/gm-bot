const key = require('../static/key.json');
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  if (req.path == '//login') return next();

  jwt.verify(req.headers.auth, key.secret, function(err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized');      
    } else {
      next();
    }
  });
}