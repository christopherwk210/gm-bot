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
  });

  app.post('//text_channel_message/:channelid', function (req, res) {
    let channelId;
    let message;
    try {
      channelId = req.params.channelid;
      message = req.body.message.test;
    } catch(e) {
      res.status(400).send('Response error');
      return;
    }

    let channels = bot.guilds.find('name','/r/GameMaker').channels.findAll('type', 'text');
    for (let i = 0; i < channels.length; i++) {
      if (channels[i].id === channelId) {
        channels[i].sendMessage(message).then(msg => {
          console.log(err);
        }, err => console.log(err));
        res.send('Message sent.');
        return;
      }
    }

    res.status(404).send('Text channel not found.');
  });

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
