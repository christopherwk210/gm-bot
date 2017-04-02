const Datastore = require('nedb');
const bcrypt = require('bcrypt');

module.exports = function(app, db) {
  app.get('//admin_users', function (req, res) {
    db.admins.find({}, function(err, docs) {
      if (err !== null) {
        res.status(500).send({
          error: 'Internal server error'
        });
      }

      let adminList = [];
      for (let i = 0; i < docs.length; i++) {
        adminList.push({
          id: docs[i]._id,
          name: docs[i].name
        });
      }

      res.send(adminList);
    });
  });

  app.post('//admin_users/validate', function (req, res) {
    let id, password;
    try {
      id = req.body.id;
      password = req.body.password;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    db.admins.findOne({ _id: id, password: password }, function(err, docs) {
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
          bcrypt.compare(password, docs.password, function(err, res) {
            if (err !== null) {
              res.status(500).send({
                error: 'Server error'
              });
            } else {
              res.send({
                valid: res
              });
            }
          });
        }
      }
    });
  });

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

    db.admins.find({ name: name }, function(err, docs) {
      if (err !== null) {
        res.status(500).send({
          error: 'Internal server error'
        });
      }

      if (docs.length === 0) {
        bcrypt.hash(password, 10, function(err, hash) {
          db.admins.insert({
            name: name,
            password: hash
          }, function (err, newDoc) {
            if (err !== null) {
              console.log(err);
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
      } else {
        res.status(400).send({
          duplicate: true,
          error: 'User already exists'
        });
      }
    });

  });

  app.delete('//admin_users/:id', function (req, res) {
    let id;
    try {
      id = req.params.id;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    db.admins.remove({ _id: id }, {}, function (err, numRemoved) {
      if (err !== null) {
        res.status(500).send({
          error: 'Could not remove'
        });
        return;
      }

      res.send({
        removed: numRemoved
      });
    });
  });
};