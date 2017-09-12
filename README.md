# GameMakerBot
The bot used by the /r/GameMaker Discord server.

# Bot Features

- When new users join the server, the bot greets them with a welcome message
- Can automatically apply jsbeautify rules to code posted with the `clean-code` language:

\`\`\`clean-code<br>
if (condition) { perform_action(); }<br>
\`\`\`

- Can automatically generate a [GMLive](http://yal.cc/r/gml/) link when using the `gmlive` language:

\`\`\`gmlive<br>
if (condition) { perform_action(); }<br>
\`\`\`

- Has a list of commands available to users:
  - `!help` - sends the user a helpful message on the available commands the bot has to offer
  - `!role [role]` - allows user to toggle server roles on and off
  - `!resources` - sends the user a list of curated gamemaker resources, can be used by staff to send the list to other users
  - `!docs [function] [version]` - fetches a link to official gamemaker documentation for the specified function
  - `!streamy` - toggles the streamy role for the user
  - `!commandment [roman numeral | 'list']` - outputs a GIF version of one of pix pope's gamemaker commandments
  - `!bgmhammer` - posts a custom set of emoji created for AndrewBGM
  - `!topher` - pings topherlicious (hey, that's me)
  - `!welcome` - sends the user the welcome message as if they just joined
  - `!giveaway [name]` - allows users to join a giveaway
  - `!assemble` - pings all duckies (only usable by staff and duckies)
- Limits spamming of too many images in a short period of time
- Automatically deletes messages including blacklisted URLs
- Will automatically react with a 👋 when mentioned
- Will automatically react with 🇲 Ⓜ when someone posts a message containing only 'mm'
- Will automatically react with 🇭 🇲 Ⓜ when someone posts a message containing only 'hmm'
- Will automatically ping GiftOfDeath when someone posts a message starting with 🎁 💀
- Keeps a detailed log of all voice channel activity
- Keeps a detailed (anonymous) log of online user presences
- Has an integrated Express server to communicate with a custom front-end for admin use (which is closed source)

# Development
To work on the source code locally:
```
$ git clone https://bitbucket.org/christopherwk210/gm-bot
$ cd gm-bot
$ npm i
```