// Express libs
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt');

let hash = '$2a$10$6eizgdtLgfW/zyT8yjud6ua80187t8M2z0r7Wgc0NhfA12rS82P.u';

app.use(bodyParser.json());
app.use(function(req, res, next) {
  if ( req.path == '//login') return next();

  if (req.headers.auth === hash) {
    next();
  } else {
    res.status(401).send('Unauthorized');
  }
});

const run = function(bot) {

  app.get('//validate', function (req, res) {
    res.send({
      status: 'OK'
    });
  });

  app.post('//login', function (req, res) {
    let password;
    try {
      password = req.body.password;
    } catch(e) {
      res.status(400).send({
        error: 'Bad request'
      });
      return;
    }

    bcrypt.compare(password, hash, function(err, result) {
      if (result) {
        res.send({
          hash: hash
        });
      } else {
        res.status(401).send({
          error: 'Unauthorized'
        });
      }
    });
  });

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
      message = req.body.message;
    } catch(e) {
      res.status(400).send({
        error: 'Response error'
      });
      return;
    }

    let channels = bot.guilds.find('name','/r/GameMaker').channels.findAll('type', 'text');
    for (let i = 0; i < channels.length; i++) {
      if (channels[i].id === channelId) {
        channels[i].sendMessage(message).then(msg => {
          // console.log(msg);
        }, err => console.log(err));
        res.send({
          msg: message
        });
        return;
      }
    }

    res.status(404).send({
      error:'Text channel not found.'
    });
  });

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
