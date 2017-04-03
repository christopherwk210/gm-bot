const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const key = require('../static/key.json');

module.exports = function(app, db) {
  app.post('//login', function (req, res) {
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

    db.admins.findOne({ name: name }, function(err, docs) {
      if (err !== null) {
        console.log(err);
        res.status(500).send({
          error: 'Server error'
        });
      } else {
        if (docs === null) {
          res.status(404).send({
            error: 'Not found'
          });
        } else {
          bcrypt.compare(password, docs.password, function(err, result) {
            if (err !== undefined) {
              res.status(500).send({
                error: 'Server error'
              });
            } else {
              if (result) {
                jwt.sign({ user: name }, key.secret, { expiresIn: '1h' }, function(err, token) {
                  if (err) {
                    res.status(500).send({
                      error: 'Server error'
                    });
                  } else {
                    res.send({
                      token: token
                    });
                  }
                });
              } else {
                res.status(401).send({
                  error: 'Unauthorized'
                });
              }
            }
          });
        }
      }
    });
  });
};