module.exports = function(app, bot) {
  app.get('//users/:id', function (req, res) {
    let userid;
    try {
      userid = req.params.id;
    } catch(e) {
      res.status(400).send({
        error: 'Request error'
      });
      return;
    }

    bot.fetchUser(userid).then(user => {
      res.send(user);
    }, err => {
      res.status(404).send({
        message: 'User not found',
        error: err
      });
    });
  });
};