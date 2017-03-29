module.exports = function(app) {
  app.get('//validate', function (req, res) {
    res.send({
      status: 'OK'
    });
  });
};