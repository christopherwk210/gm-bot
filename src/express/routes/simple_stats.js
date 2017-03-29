module.exports = function(app, bot) {
  app.get('//simple_stats', function (req, res) {
    let guild = bot.guilds.find('name','/r/GameMaker');

    let data = {
      id: guild.id,
      name: guild.name,
      memberCount: guild.memberCount,
      iconUrl: guild.iconUrl,
      status: bot.user.presence.status,
      game: bot.user.presence.game
    };

    res.send(data);
  });
};