module.exports = function(app, db) {
  app.get('//voip', function (req, res) {
    let halfHourAgo = new Date(Date.now() - 30 * 60000);
    db.voip.find({ 'timestamp': { $gt: halfHourAgo.getTime() } }, function (err, docs) {
      if (err) {
        res.status(500).send({
          error: 'Server Error'
        });
      } else {
        res.send(docs);
      }
    });
  });

  app.get('//voip/days/:days', function (req, res) {
    let days;
    try {
      days = Number(req.params.days);
    } catch(e) {
      res.status(400).send({
        error: 'Request error'
      });
      return;
    }

    if (isNaN(days)) {
      res.status(400).send({
        error: 'Request error'
      });
      return;
    }

    let history = new Date(Date.now() - (3600000 * (24 * days)));
    db.voip.find({ 'timestamp': { $gt: history.getTime() } }, function (err, docs) {
      if (err) {
        res.status(500).send({
          error: 'Server Error'
        });
      } else {
        res.send(docs);
      }
    });
  });
};