module.exports = function(app, bot, dmLog) {
  app.get('//fools', function (req, res) {
    res.send(dmLog);
  });
};