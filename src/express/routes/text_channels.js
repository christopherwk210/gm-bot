module.exports = function(app, bot) {
  app.get('//text_channels', function (req, res) {
    let channels = bot.guilds.find('name','/r/GameMaker').channels.findAll('type', 'text');
    let sendData = {
      channels: []
    };
    for (let i = 0; i < channels.length; i++) {
      sendData.channels.push({
        id: channels[i].id,
        name: channels[i].name
      });
    }
    res.send(JSON.stringify(sendData));
  });
};