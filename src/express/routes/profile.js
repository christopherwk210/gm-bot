module.exports = function(app, db) {
  app.get('//profile', function (req, res) {
    let oneDayAgo = new Date(Date.now() - (3600000 * 24));
    db.profile.find({ 'timestamp': { $gt: oneDayAgo.getTime() } }, function (err, docs) {
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