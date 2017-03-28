// Express libs
var express = require('express');
var app = express();

const run = function(bot) {
  app.get('/text_channels', function (req, res) {
    let channels = bot.guilds.findAll('name','/r/GameMaker').channels.findAll('type', 'text');
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

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
