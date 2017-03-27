// Express libs
var express = require('express');
var app = express();

const run = function(bot) {
  app.get('/', function (req, res) {
    let channels = bot.channels.findAll('type','text');
    for (var i = 0; i < channels.length; i++) {
      console.log(channels[i].guild);
    }
    res.send('echo');
  });

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
