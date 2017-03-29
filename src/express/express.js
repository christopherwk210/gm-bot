// Express libs
var express = require('express'),
    app = express();

// Middlewares
var bodyParser = require('body-parser'),
    cors = require('cors');

// Routes
var validate = require('./routes/validate'),
    login = require('./routes/login'),
    textChannels = require('./routes/text_channels'),
    textChannelMessage = require('./routes/text_channel_message'),
    simpleStats = require('./routes/simple_stats'),
    presence = require('./routes/presence');

// Apply middlewares
app.use(bodyParser.json());
app.use(cors());
app.use(require('./middlewares/auth'));

const run = function(bot) {
  // Use each route
  validate(app);
  login(app);
  textChannels(app, bot);
  textChannelMessage(app, bot);
  simpleStats(app, bot);
  presence(app, bot);

  // Run the server
  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};

module.exports.run = run;
