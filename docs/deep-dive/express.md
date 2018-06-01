# Express
Included with GMBot is an [Express](https://expressjs.com/) server. This server is configured to use port 8080, and is only used to serve a custom instance of [GMLive](http://yal.cc/r/gml/). This custom version of GMLive was created by [YellowAfterLife](https://twitter.com/YellowAfterlife) for use with the bot, and allows the bot to execute GML by using [puppeteer](https://github.com/GoogleChrome/puppeteer) to manipulate the GMLive instance served by express.

The express setup including the GMLive files can be found under `gm-bot/src/express`.
