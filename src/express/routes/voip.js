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
};