# Quick start
In order to start development on GameMakerBot (GMBot for short), you'll need to have [Node](https://nodejs.org/) v9.2.0 or greater installed. You can check what version you have with `node -v`.

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

## Running the documentation locally
