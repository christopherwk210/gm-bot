// Imports
const bcrypt = require('bcrypt');
const Datastore = require('nedb');
let db = {};

// Admin db
db.admins = new Datastore({
	filename:'./src/data/admins.db',
	autoload: true,
	onload: function() {
    bcrypt.hash('password', 10, function(err, hash) {
      db.admins.insert({
        name: 'admin',
        password: hash
      }, function (err, newDoc) {
        if (err !== null) {
          console.log(err);
        } else {
          console.log(newDoc);
        }
      });
    });
	}
});