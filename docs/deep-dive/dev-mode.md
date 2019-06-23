# Dev mode
One of GMBot's modifiers is the `DevmodeModifier`. This modifier has a prevalidation check that only passes for whitelisted member id's. The reason for this is because the devmode modifier uses `eval()` to execute code server-side. This modifier allows testing code while the bot is running, and is very helpful during development to quickly test small things. It is, however, **very dangerous** since it allows executing native code, and should only be used in development. If you are developing your own fork of the bot, you can access this modifier by removing the prevalidation check from `gm-bot/src/modifiers/devmode/devmode.modifier.ts`. Alternatively, you can add your Discord user ID to the filter, located at `gm-bot/src/shared/assets/text/devmode-access.txt`.

This modifier includes all of the `shared` exports under `this.shared`, and includes a helper reply function as `reply()` which can be used as a quick way to get output:
````markdown
```!devmode
// This will trigger the bot to send a message to this channel containing your id
reply(msg.author.id);
```
````
