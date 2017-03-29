module.exports = function(app, bot) {
  app.get('//simple_stats', function (req, res) {
    let channel = bot.guilds.find('name','/r/GameMaker');

    let data = {
      id: channel.id,
      name: channel.name,
      memberCount: channel.memberCount,
      iconUrl: channel.iconUrl,
      status: bot.user.presence.status,
      game: bot.user.presence.game
    };

    res.send(data);
  });
};