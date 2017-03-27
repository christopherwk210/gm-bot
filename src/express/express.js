// Express libs
var express = require('express');
var app = express();

const run = function(bot) {
  app.get('/', function (req, res) {
    res.send(JSON.stringify(bot.guilds.find('name', '/r/GameMaker')));
  });

  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
