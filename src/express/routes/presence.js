module.exports = function(app, bot) {
  app.post('//presence', function (req, res) {
    let status, game;
    try {
      status = req.body.status;
      game = req.body.game;
    } catch(e) {
      res.status(400).send({
        error: 'Response error'
      });
      return;
    }

    let user = bot.user;
    if (game && (game.length !== 0)) {
      user.setGame(null);
    } else {
      user.setGame(game);      
    }
    user.setStatus(status);
    res.send(user.presence);
  });
};