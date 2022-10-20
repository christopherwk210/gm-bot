![](./media/v2-bot-image.png)

# GameMakerBot 2
> The bot used by the GameMaker Discord server.

[Features](./FEATURES.md)

This is a complete rewrite from the first version of the bot. Because of this, the git history has been cleaned to start fresh since it is essentially a new project. If you wish to see the code for the old version, it is preserved in the [v1 branch](https://github.com/christopherwk210/gm-bot/tree/v1).

## Setup
Clone the project and install dependencies with npm. Create a `.env` file in the root of the project with the following format:

```
application_id=0000000000000000000
token=00000000000000000000000000.000000.00000000000000000000000000000000000000
```

Replace the 0'd out placeholders with your own bot application and token. After that, create a `dev-ids.json` file in the `./static` folder:

```json
{
  "guildId": "000000000000000000",
  "channels": {
    "helpChannels": ["000000000000000000"],
    "securityChannel": "000000000000000000"
  },
  "roles": {
    "pronouns": {
      "heHim": "000000000000000000",
      "sheHer": "000000000000000000",
      "theyThem": "000000000000000000",
      "ask": "000000000000000000"
    },

    "birthday": "000000000000000000"
  }
}
```

These values will override the `discordIds` values in the `./src/data/config.ts` file during development, so that you can point the bot at ids for your test server without removing the correct ones. Just replace all of the values with the ids that go with your test server.

Optional last step is to run `npm run docs:cache` to make a cached version of the game maker docs. If it hangs or fails just run it again until it works. This step is optional since this generates a cached docs file that is committed to the repo, so you should already have a version when you clone the project. This command exists so that the docs can be recached next time the docs get updated.

## Dev

`npm start` will run the bot, and `npm run build` will build it. Building the bot outputs to the `./dist` directory which contains a compiled version of the code that can be `npm install`'d and deployed.

When you run the project, it will automatically sync commands on every startup. The first time you launch it, it may take a while to do this. Commands can all be found under `./src/commands/` and all follow a similar format. If you're looking to make a command yourself, you can make one based on this template:

```typescript
import { SlashCommandBuilder } from 'discord.js';

const command = new SlashCommandBuilder()
.setName('mycommand')
.setDescription(`This command does a thing`);

export const cmd: BotCommand = {
  command,
  execute: async interaction => {
    await interaction.reply('Hello world!');
  }
};
```

The `./pm2.sh` script has a sensible default for creating a pm2 instance if you wish to run the bot with persistence and good logging.

## License
MIT, see `./LICENSE.txt`.

A special thanks to the GameMaker Discord community and staff for their feedback and support.
