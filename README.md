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

- Can return a GML hastebin link with the code in the message:

\`\`\`haste

if (condition) { perform_action(); }

\`\`\`

- Feature list:
    - `!help` - sends the user a helpful message on the available commands the bot has to offer
    - `!role [role]` - allows user to toggle server roles on and off
    - `!resources` - sends the user a list of curated gamemaker resources, can be used by staff to send the list to other users
    - `!docs [function] [version] [i]` - fetches a link or screenshot to official gamemaker documentation for the specified function
    - `!3d` - toggles the three dimensional role for the user
    - `!commandment [roman numeral | 'list']` - outputs a GIF version of one of pix pope's gamemaker commandments
    - `!rtfm` - shorthand for `!commandment I`
    - `!bgmhammer` - posts a custom set of emoji created for AndrewBGM
    - `!givesidadonut` - gives sid a donut
    - `!topher` - pings topherlicious (hey, that's me)
    - `!welcome` - sends the user the welcome message as if they just joined
    - `!giveaway [name]` - allows users to join a giveaway
    - `!gaa` - allows managing giveaways (only usable by staff);
    - `!assemble` - pings all duckies (only usable by staff and duckies)
    - `!say [channel(s)?] "[message]" [-f]` - sends a message to the current channel or channel(s) specified (only usable by staff)
    - `!inversekinematics` - pings TonyStr
    - `!changelog` - sends a screenshot of the current GM changelog
    - `!lifetime` - sends the date you joined the server
    - `!dingus` - dingus
    - `!dinguses`- dinguses
    - `!resize [scale_factor] [-b] [o]` - when used while uploading an image, will resize the image by the factor given. Use `-b` to use bilinear scaling instead of nearest neighbor. Uploads the original if `-o` is present.
    - `!palette [palette_name]` - sends an image of the palette, and embeds a link to the palette's lospec page.
    - `!pixelchallenge` - when used while uploading an image, will add that image as an entry to the current pixel challenge
    - `!mp "[query]"` - search the YYG marketplace
    - `!miniboss [image_name | image_number] [index]` - will post a pixelart reference from the list at http://blog.studiominiboss.com/pixelart, that matches the name or number specified. Can optionally specify an index if the post has more than one image attached.
    - `!miniboss ['help' | 'link']` - will either link to the miniboss pixelart webpage (link), or send a message explaining how to use the command (help).
- Limits spamming of too many images in a short period of time
- Automatically deletes messages including blacklisted URLs
- Full audio streaming integration is in beta and currently being developed
- Will automatically react with a 👋 when mentioned
- Will automatically react with 🇲 Ⓜ when someone posts a message containing only 'mm'
- Will automatically react with 🇭 🇲 Ⓜ when someone posts a message containing only 'hmm'
- Will automatically react with ❤️ when someone posts a message containing only 'good bot'
- Will automatically ping GiftOfDeath when someone posts a message starting with 🎁 💀
- Will automatically ping thirteen when someone posts a message starting with 1⃣ 3⃣
- Keeps a detailed log of all voice channel activity
- Keeps a detailed (anonymous) log of online user presences
- Babaaay, I compare you to a kiss from a rose on the grey...
- Can automatically assign christmas colors to roles
- Has an integrated Express server to communicate with a custom front-end for admin use (which is closed source)
- Can execute GML (powered by GMLive, beta feature)

## Development
This project requires:

- Node >= 9.0.0

If you want to test audio-related functionality you'll also need:
- FFMPEG for audio related functionality
- `npm install node-opus` or `npm install opusscript`
- (optional) sodium for faster voice connection

To work on the source code locally:
```
$ git clone https://bitbucket.org/christopherwk210/gm-bot
$ cd gm-bot
$ npm install --silent
```

*Note: `--silent` is used to suppress unnecessary peer dependency warnings.*

Before you run the project, you'll need to create an `auth.json` file in `./src/assets/json` containing your bot token. Copy the format found in `./src/assets/json/auth.example.json`. You can then run the bot with:
```
$ npm start
```

This bot has an in-chat dev mode feature that allows you to execute JS from within Discord. This is a **very powerful** tool that should be used with extreme caution. This feature can be found in `./src/lib/modifiers/devmode.js`. By default, it won't work for anyone except me (topherlicious) for security reason, which you can disable to aid in development.

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
│   ├── images                 // Image assets
│   │   ├── grog.gif             // Unused GIF from old !palette command
│   │   └── kissfromarose.gif    // Don't worry about it
│   │
│   ├── json                   // JSON assets
│   │   ├── auth.example.json    // Template for creating your own with proper discord key
│   │   ├── bad-links.json       // URL blacklist
│   │   ├── gms1-docs-urls.json  // URLs to GMS1 documentation pages
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
│       ├── getting-started.txt  // Post-install banner
│       ├── gml-functions.txt    // List of all functions found in GML v1
│       └── gml2-functions.txt   // List of all functions found exclusively in GML v2
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
│   │   ├── assemble.js           // Responsible for `!assemble`
│   │   ├── audio.js              // Responsible for all audio functions
│   │   ├── changelog.js          // Responsible for `!changelog`
│   │   ├── christmas.js          // Responsible for handling christmas role colors!
│   │   ├── commandment.js        // Responsible for `!commandment`
│   │   ├── docs.js               // Responsible for `!docs`
│   │   ├── giveAwayManagement.js // Responsible for `!gaa`
│   │   ├── martketplace.js       // Responsible for `!marketplace`
│   │   ├── miniboss.js           // Responsible for `!miniboss`
│   │   ├── miniboss.keywords.js  // Holds keyword shortcuts for use in `!miniboss`
│   │   ├── palette.js            // Responsible for `!palette`
│   │   ├── pixelChalleng.js      // Responsible for `!pixelchallenge`
│   │   ├── resize.js             // Responsible for `!resize`
│   │   ├── resources.js          // Responsible for `!resources`
│   │   ├── roleControl.js        // Responsible for `!role`
│   │   ├── say.js                // Responsible for `!say`
│   │   └── welcome.js            // Responsible for `!welcome` and sending the initial welcome
│   │
│   ├── modifiers              // Code block parsers
│   │   ├── devmode.js           // Live code execution parsing
│   │   ├── gml.js               // GMLive code execution
│   │   ├── gmlive.js            // GMLive code block parsing
│   │   ├── haste.js             // GML Hastebin link creation
│   │   └── prettifier.js        // clean-code block parsing
│   │
│   ├── rules.js               // Contains all bot message matching rules
│   │
│   ├── services               // Persistent helper services
│   │   ├── channel.service.js   // Contains server channel information and helpers 
│   │   ├── guild.service.js     // Contains server guild information and helpers
│   │   └── role.service.js      // Contains server role information and helpers
│   │
│   └── utils                  // Contains 'pure' helper functionality
│       ├── choose.js            // Simple random array picker function
│       ├── database.js          // Database init function
│       ├── detectStaff.js       // Detects if a GuildMember is staff (admin or ducky)
│       ├── giveAwayLib.js       // Handles give away accessing, `!giveaway`
│       ├── gmlexec.js           // Handles executing GML
│       ├── parseCommandList.js  // Parses command rule list
│       ├── presence-log.js      // Logs anon online user presence
│       ├── validate-gml.js      // Validates GML functions for GMS1 and 2
│       └── voip-log.js          // Logs voice channel activity
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
  action: (msg, args) => {      // Action is a callback that triggers when a match is hit,
                        // passes msg and args, where msg === Discord message, and
                        // args === command arguments split by a space character (' ')
  },
  pre: msg => {         // This is a prevalidation callback which is called every message
    return true;        // after a match is found. If a truthy value is returned, it will call
  }                     // the action. If a falsey value is returned, the action will not be
}                       // called. Useful for determining if a user has permission or not.
```

To add a command, append a new object to the array and define a valid rule. At the very minimum, you must include `matches` and `action`. Including *only* these two will result in a rule that matches anywhere in a message and **is** case sensitive.

## Third-Party Contributors
- YellowAfterlife#3735 for creating a custom GMLive implementation just for the bot

## Early Contributors
- net8floz#3079
- Minty Python#5626
- Ariak#2124

A special thanks to the /r/GameMaker Discord community and staff for their feedback and support.

## License
MIT, see `./LICENSE.txt`.
