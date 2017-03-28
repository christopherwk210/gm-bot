// Express libs
var express = require('express');
var app = express();
var bodyParser = require('body-parser');

app.use(bodyParser.json());

const run = function(bot) {
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
    res.send('echo');
  });

  app.post('//text_channel_message/:channelid', function (req, res) {
    console.log(req);
    res.send(JSON.stringify(req.body));
  });

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
