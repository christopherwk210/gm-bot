import { Client } from "discord.js";

var path = require('path');

// Express libs
var express = require('express'),
    app = express();

// Middlewares
var bodyParser = require('body-parser'),
    cors = require('cors');

// Apply middlewares
app.use(bodyParser.json());
app.use(cors());
app.use('//gmlive', express.static(path.join(__dirname, 'gmlive')));

/**
 * Init the express server providing needed references
 * @param bot Bot client reference
 * @param {*} dmLog In-memory reference to current DM bot logs
 * @param {*} db In memory database
 */
export function run(bot: Client, dmLog, db) {
  app.get('//gmlive', (req, res) => res.sendFile(path.join(__dirname, 'gmlive/index.html')));

  // Run the server
  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};
