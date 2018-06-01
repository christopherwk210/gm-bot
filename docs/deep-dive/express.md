# Express
Included with GMBot is an [Express](https://expressjs.com/) server. This server is configured to use port 8080, and is only used to serve a custom instance of [GMLive](http://yal.cc/r/gml/). This custom version of GMLive was created by [YellowAfterLife](https://twitter.com/YellowAfterlife) for use with the bot, and allows the bot to execute GML by using [puppeteer](https://github.com/GoogleChrome/puppeteer) to manipulate the GMLive instance served by express.

The express setup including the GMLive files can be found under `gm-bot/src/express`.

Executing GML through the bot is done via a modifier, the `GmlModifier`. The modifier includes a prevalidation check to only allow staff use of the function, since it is too resource intensive to open to all users. All `trace()` and `show_debug_message()` calls will be logged back after execution:
````markdown
The bot will respond to this message with a trace log containing "hello world".
```gml
var map = ds_map_create();
map[? "test"] = "hello world";
trace(map[? "test"]);
```
````
