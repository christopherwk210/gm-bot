# GameMakerBot
The bot used by the /r/GameMaker Discord server.

## Bot Features
- When new users join the server, the bot greets them with a welcome message
- Can automatically apply jsbeautify rules to code posted with the `clean-code` language:

\`\`\`clean-code

if (condition) { perform_action(); }

\`\`\`

- Can automatically generate a [GMLive](http://yal.cc/r/gml/) link when using the `gmlive` language:

\`\`\`gmlive

if (condition) { perform_action(); }

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

## Development
To work on the source code locally:
```
$ git clone https://bitbucket.org/christopherwk210/gm-bot
$ cd gm-bot
$ npm i
```

Before you run the project, you'll need to create an `auth.json` file in `./src/assets/json` containing your bot token. Copy the format found in `./src/assets/json/auth.example.json`. You can then run the bot with:
```
$ npm start
```

If you wish to contribute, please fork this repo and submit a detailed and clean pull-request. If you want to add new features or commands, please ask topherlicious#1378 or any of the other admins before you start development.

For questions and support, contact topherlicious#1378 on discord.

## Testing
A pre-commit git hook is in place to make sure that `npm test` passes before every commit. Don't force a commit if tests are failing! Make sure to test as you go. If you're adding large functionality that warrants testing, you may add your own test accordingly under `./test`.

## Project Overview
The main entry point of the project is `./gmbot.js`. This file sets up initial callbacks for the Discord API and initializes database connections for logging features. Beyond that, the structure is as follows:

```
./src
├── assets                     // Holds all non-javascript assets
│   │
│   ├── json                     // JSON assets
│   │   ├── auth.example.json    // Template for creating your own with proper discord key
│   │   ├── bad-links.json       // URL blacklist
│   │   ├── ids.json             // ID's of users who are messaged when bot errors
│   │   └── jsbeautify.json      // jsbeautify rules for clean-code
│   │
│   └── markdown               // Markdown assets
│       ├── commandments.md      // Commandment list
│       ├── help.admins.md       // Help message for admins only
│       ├── help.all.md          // Help message for all users
│       ├── help.ducks.md        // Help message for duckies and up
│       ├── resources.md         // Resources list
│       └── welcome.md           // Welcome message
│
├── data                       // Holds database flat-files during runtime
│
├── express  // Holds data related to the integrated express server,
│            // which generally should *not* be explored by those
│            // interested in contributing. These files are responsible
│            // for communicating with a custom front-end meant for
│            // admin use only and is, frankly, not cleanly kept.
│
├── lib                      // The meat of the bot is in here!
│   │
│   ├── commands               // These files are responsible for single bot commands
│   │   ├── assemble.js          // Responsible for `!assemble`
│   │   ├── commandment.js       // Responsible for `!commandment`
│   │   ├── docs.js              // Responsible for `!docs`
│   │   ├── resources.js         // Responsible for `!resources`
│   │   ├── roleControl.js       // Responsible for `!role`
│   │   └── streamer.js          // Responsible for `!streamy`
│   │
│   ├── docs                   // Extra scripts that help the `!docs` command
│   │   ├── searchdat-gms1.js    // Contains valid GMS1 documentation urls
│   │   └── validate.js          // Validates GML functions for GMS1 and 2
│   │
│   ├── logging                // Related to server logs
│   │   ├── presenceLog.js       // Logs anon online user presence
│   │   └── voipLog.js           // Logs voice channel activity
│   │
│   ├── modifiers              // Code block parsers
│   │   ├── gmlive.js            // GMLive code block parsing
│   │   └── prettifier.js        // clean-code block parsing   
│   │
│   ├── rules.js               // Contains all bot message matching rules
│   │
│   └── utils                  // Contains pure helper functionality
│       ├── choose.js            // Simple random array picker function
│       ├── database.js          // Database init function
│       ├── giveAwayLib.js       // Handles give away accessing, `!giveaway`
│       └── parseCommandList.js  // Parses command rule list
│
└── tools        // Contains build tools
    └── seed.js    // Simple node tool to seed the admin DB with sample user,
                   // intended for front-end debugging only. Run with `npm run seed`.
```

## Bot Rules
All of the bot command rules are located in `./src/lib/rules.js` under `module.exports`. It is a large array of objects that define the rules for each command. The structure of each rule looks like this:

```javascript
{
  matches: ['welcome'], // The text that the rule captures, in this case 'welcome'
  prefix: prefix,       // The prefix to the match, optional. In this case, prefix == '!'
  position: 0,          // Position to check for the match, 0 being the start
                        // If position is not included, it will match anywhere in the string.
  wholeMessage: false,  // If true, overrides position and compares the entire string instead
                        // of searching for a substring
  exact: false,         // If omitted or true, it will match case-sensitively
  delete: true,         // Whether or not to delete a matched message (after calling the action)
  action: msg => {      // Action is a callback that triggers when a match is hit,
                        // passes msg and args, where msg === Discord message, and
                        // args === command arguments split by a space character (' ')
  }
}
```

To add a command, append a new object to the array and define a valid rule. At the very minimum, you must include `matches` and `action`. Including *only* these two will result in a rule that matches anywhere in a message and **is** case sensitive.

## Contributors
- topherlicious#1378
- net8floz#3079
- Minty Python#5626
- Ariak#2124
- Natesky9#2964 (in spirit)