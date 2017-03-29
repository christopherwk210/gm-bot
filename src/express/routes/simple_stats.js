module.exports = function(app, bot) {
  app.get('//simple_stats', function (req, res) {
    let channel = bot.guilds.find('name','/r/GameMaker');

    let data = {
      id: channel.id,
      name: channel.name,
      owner: channel.owner,
      memberCount: channel.memberCount,
      iconUrl: channel.iconUrl
    };

    res.send(data);
  });
};