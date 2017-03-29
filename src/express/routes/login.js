bcrypt = require('bcrypt');

let pswd = require('../static/admin_password.json');

module.exports = function(app) {
  app.post('//login', function (req, res) {
    let password;
    try {
      password = req.body.password;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    bcrypt.compare(password, pswd.hash, function(err, result) {
      if (result) {
        res.send({
          hash: pswd.hash
        });
      } else {
        res.status(401).send({
          error: 'Unauthorized'
        });
      }
    });
  });
};