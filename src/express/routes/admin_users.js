const Datastore = require('nedb');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {
  app.post('//admin_users', function (req, res) {
    let name, password;
    try {
      name = req.body.name;
      password = req.body.password;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    bcrypt.hash(password, 10, function(err, hash) {
      db.admins.insert({
        name: name,
        password: hash
      }, function (err, newDoc) {
        if (err === null) {
          res.status(500).send({
            error: 'Server error'
          });
        } else {
          res.send({
            document: newDoc
          });
        }
      });
    });

  });
};