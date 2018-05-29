import * as path from 'path';
import { Client } from 'discord.js';

import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as cors from 'cors';

let app = express();

// Apply middlewares
app.use(bodyParser.json());
app.use(cors());
app.use('//gmlive', express.static(path.join(__dirname, 'gmlive')));

/**
 * Init the express server
 */
export default function runExpressServer() {
  app.get('//gmlive', (req, res) => res.sendFile(path.join(__dirname, 'gmlive/index.html')));

  // Run the server
  app.listen(8080, function () {
    console.log('Express server listening on 8080.');
  });
};
