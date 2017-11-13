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

- Has a list of commands available:
    - `!help` - sends the user a helpful message on the available commands the bot has to offer
    - `!role [role]` - allows user to toggle server roles on and off
    - `!resources` - sends the user a list of curated gamemaker resources, can be used by staff to send the list to other users
    - `!docs [function] [version] [i]` - fetches a link or screenshot to official gamemaker documentation for the specified function
    - `!streamy` - toggles the streamy role for the user
    - `!3d` - toggles the three dimensional role for the user
    - `!commandment [roman numeral | 'list']` - outputs a GIF version of one of pix pope's gamemaker commandments
    - `!rtfm` - shorthand for `!commandment I`
    - `!bgmhammer` - posts a custom set of emoji created for AndrewBGM
    - `!givesidadonut` - gives sid a donut
    - `!topher` - pings topherlicious (hey, that's me)
    - `!welcome` - sends the user the welcome message as if they just joined
    - `!giveaway [name]` - allows users to join a giveaway
    - `!assemble` - pings all duckies (only usable by staff and duckies)
    - `!say [channel(s)?] "[message]"` - sends a message to the current channel or channel(s) specified (only usable by staff)
    - `!changelog` - sends a screenshot of the current changelog
- Limits spamming of too many images in a short period of time
- Automatically deletes messages including blacklisted URLs
- Full audio streaming integration is in beta and currently being developed
- Will automatically react with a 👋 when mentioned
- Will automatically react with 🇲 Ⓜ when someone posts a message containing only 'mm'
- Will automatically react with 🇭 🇲 Ⓜ when someone posts a message containing only 'hmm'
- Will automatically ping GiftOfDeath when someone posts a message starting with 🎁 💀
- Will automatically ping thirteen when someone posts a message starting with 1⃣ 3⃣
- Keeps a detailed log of all voice channel activity
- Keeps a detailed (anonymous) log of online user presences
- Has an integrated Express server to communicate with a custom front-end for admin use (which is closed source)

## Development
This project requires:

- Node >= 8.0.0
- FFMPEG for audio related functionality (not needed to run)
- libtool (libtool-bin)

To work on the source code locally:
```
$ git clone https://bitbucket.org/christopherwk210/gm-bot
$ cd gm-bot
$ npm install --silent
```
*Note: The installation may take a good while, as some of the dependencies are fairly large.*

*Another note: `--silent` is used to suppress unnecessary peer dependency warnings.*

Before you run the project, you'll need to create an `auth.json` file in `./src/assets/json` containing your bot token. Copy the format found in `./src/assets/json/auth.example.json`. You can then run the bot with:
```
$ npm start
```

If you wish to contribute, please fork this repo and submit a detailed and clean pull-request. If you want to add new features or commands, please ask topherlicious#1378 or any of the other admins before you start development.

For questions and support, contact topherlicious#1378 on discord.

## Common Issues
If you are running the bot on your local machine, make sure you halt the process *before* attempting to make a commit or run tests, otherwise the tests will most likely fail. Discord.js occupies port 8080 which needs to be open for tests to commence properly.

If the application doesn't run after updating to a newer version due to bcrypt related errors, try deleting the package lock & node_modules and reinstalling:
```
$ rm package-lock.json && rm -rf node_modules && npm i --silent
```
In general, this is just a good fix to know about, and can solve common packaging issues.

## Testing
A pre-commit git hook is in place to make sure that `npm test` passes before every commit. If tests don't pass, then the commit will be cancelled. Make sure to test as you go. If you're adding large functionality that warrants testing, you may add your own test accordingly under `./test`.

In addition to testing, eslint is also integrated into the project as a pre-commit hook. To ensure the project passes the lint, you should use `npm run lint`. Same as with failing tests, if the project doesn't pass the lint, you can't create a commit.

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
│   ├── markdown               // Markdown assets
│   │   ├── commandments.md      // Commandment list
│   │   ├── help.admins.md       // Help message for admins only
│   │   ├── help.all.md          // Help message for all users
│   │   ├── help.ducks.md        // Help message for duckies and up
│   │   ├── resources.md         // Resources list
│   │   └── welcome.md           // Welcome message
│   │
│   └── text                   // Text-only assets
│       ├── banner.txt           // Post-install banner
│       └── getting-started      // Post-install message
│
├── data                       // Holds database flat-files during runtime
│
├── express  // Holds data related to the integrated express server,
│            // which generally should *not* be explored by those
│            // interested in contributing. These files are responsible
│            // for communicating with a custom front-end meant for
│            // admin use only and is, frankly, not cleanly kept.
│
├── lib                        // The meat of the bot is in here!
│   │
│   ├── commands               // These files are responsible for single bot commands
│   │   ├── assemble.js          // Responsible for `!assemble`
│   │   ├── audio.js             // Responsible for all audio functions
│   │   ├── commandment.js       // Responsible for `!commandment`
│   │   ├── docs.js              // Responsible for `!docs`
│   │   ├── resources.js         // Responsible for `!resources`
│   │   ├── roleControl.js       // Responsible for `!role`
│   │   ├── streamer.js          // Responsible for `!streamy`
│   │   └── welcome.js           // Responsible for `!welcome` and sending the initial welcome
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
│   └── utils                  // Contains 'pure' helper functionality
│       ├── choose.js            // Simple random array picker function
│       ├── database.js          // Database init function
│       ├── detectStaff.js       // Detects if a GuildMember is staff (admin or ducky)
│       ├── fsHelper.js          // Several utility functions to help with filesystem operations
│       ├── giveAwayLib.js       // Handles give away accessing, `!giveaway`
│       └── parseCommandList.js  // Parses command rule list
│
└── tools        // Contains build tools
    ├── seed.js    // Simple node tool to seed the admin DB with sample user,
    │              // intended for front-end debugging only. Run with `npm run seed`.
    │
    └── post-install.js  // Post-install script
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
  },
  pre: msg => {         // This is a prevalidation callback which is called every message
    return true;        // after a match is found. If a truthy value is returned, it will call
  }                     // the action. If a falsey value is returned, the action will not be
}                       // called. Useful for determining if a user has permission or not.
```

To add a command, append a new object to the array and define a valid rule. At the very minimum, you must include `matches` and `action`. Including *only* these two will result in a rule that matches anywhere in a message and **is** case sensitive.

## Contributors
- topherlicious#1378
- net8floz#3079
- Minty Python#5626
- Ariak#2124
- Natesky9#2964 (in spirit)

A special thanks to the /r/GameMaker Discord community and staff for their feedback and support.

## License
```javascript
/**
 * GameMakerBot
 * Copyright © 2017 Chris Anselmo <christopherwk210@gmail.com> & contributors.
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 */
```
See `./LICENSE.txt`.
