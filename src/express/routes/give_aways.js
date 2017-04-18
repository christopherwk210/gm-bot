const giveAways = require('../../lib/giveAwayLib');

module.exports = function(app, db) {
  app.get('//give_aways', function (req, res) {
    res.send(giveAways.getGiveAways());
  });
};