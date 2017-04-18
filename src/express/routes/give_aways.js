const giveAways = require('../../lib/giveAwayLib');

module.exports = function(app, db) {
  app.get('//give_aways', function (req, res) {
    res.send(giveAways.getGiveAways());
  });

  app.post('//give_aways', function (req, res) {
    let name, start, end;
    try {
      name = req.body.name;
      start = req.body.start;
      end = req.body.end;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    let res = giveAways.create(name, start, end);
    if (res) {
      res.send({
        status: 'OK'
      });
    } else {
      res.status(400).send({
        error: 'Give away already exists!'
      });
    }
  });
};