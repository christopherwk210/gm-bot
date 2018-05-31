# Quick start
In order to start development on GameMakerBot (GMBot for short), you'll need to have [Node](https://nodejs.org/) v9.2.0 or greater installed. You can check what version you have with `node -v`.

## Installation
Clone the repo with git using:
```bash
git clone https://bitbucket.org/christopherwk210/gm-bot
```

Once finished, enter the project directory and install its dependencies:
```bash
cd gm-bot && npm install --slient
```

?> `--silent` is used to suppress unnecessary peer dependency warnings.

After installation is finished, you'll need to add an `auth.json` to your project. This file provides your Discord secret token to the bot so it can properly connect. This token is provided by Discord when you [create your own bot app](https://discordapp.com/developers/applications/me).

The file should look like this:

```filepath
gm-bot/src/shared/assets/json/auth.json
```
```json
{
  "token": "YOUR AUTH TOKEN GOES HERE"
}
```

!> Never upload your auth file! Your token should be a secret to everyone. This file is automatically ignored by the project `.gitignore` file.

Once your auth file is in place, you're ready to go! The bot can be started with:

```bash
npm start
```

If there are any errors, they will be logged to the console.

## Missing peer dependencies
It is recommended that you install dependencies with the `--silent` flag so as to hide  unnecessary peer dependency warnings. These warnings are for peer dependencies of `discord.js`, the Discord API library used by GMBot. They are not required to run the bot itself, however the bot won't be able to use its audio capabilities without installing either `node-opus` or `opusscript`:
```bash
npm install node-opus
```
or:
```bash
npm install opusscript
```
Be sure to install one of these if you wish to work on anything related to the bots ability to join voice channels and play audio. Discord.js highly suggests using `node-opus` over `opusscript`.
Your system must also have FFMPEG installed for this to work.

There are other optional peer dependencies as well, which you can read about in the [discord.js docs](https://discord.js.org/#/docs/main/stable/general/welcome).

## A note on uncaught exceptions
By default, uncaught exceptions will **not** halt the bot process. This is done so that the bot can log exceptions directly in Discord, however the Node documentation [warns against this](https://nodejs.org/api/process.html#process_warning_using_uncaughtexception_correctly). You can disable this feature by setting `shouldDieOnException` to `true` inside of the
`gm-bot/src/config.ts` file.

## Running the documentation locally
The documentation site can be run locally with:
```bash
npm run docs
```
