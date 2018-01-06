const key = process.env.GMBOTAUTH;
const jwt = require('jsonwebtoken');

module.exports = function(req, res, next) {
  if (req.path == '//gmlive') return next();
  if (req.path == '//login') return next();

  jwt.verify(req.headers.auth, key, function(err, decoded) {
    if (err) {
      res.status(401).send('Unauthorized');      
    } else {
      req.adminRequest = {};
      req.adminRequest.user = decoded.user;
      req.adminRequest.time = Date.now();
      next();
    }
  });
}
