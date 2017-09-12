const giveAways = require('../../lib/utils/giveAwayLib');

module.exports = function(app, db) {
  app.get('//give_aways', function (req, res) {
    res.send(giveAways.getGiveAways());
  });

  app.post('//give_aways/draw', function (req, res) {
    let name;
    try {
      name = req.body.name;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    res.send(giveAways.draw(name, 1, []));
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

    let result = giveAways.create(name, start, end);
    if (result) {
      res.send({
        status: 'OK'
      });
    } else {
      res.status(400).send({
        error: 'Give away already exists!'
      });
    }
  });

  app.delete('//give_aways/:ga', function (req, res) {
    let ga;
    try {
      ga = req.params.ga;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    giveAways.delete(ga);
    res.send({
      status: 'OK'
    });
  });
};