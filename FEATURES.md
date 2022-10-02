# GameMakerBot 2 Features

A good amount of the slash command features in the bot work very similar to their GameMakerBot v1 counterparts. Some features were scrapped entirely, and some were reworked due to changes in the Discord API.

## Global slash commands

These commands can be used in the GameMaker server, or in a direct message directly to the bot.

### `/backtick`

Sends a message detailing how to create a proper code block with markdown formatting.

### `/commandment`

Posts one of the Pixelated Pope commandments, which can be chosen from a list.

### `/docs`

Searches the GameMaker documentation and provides a small snippet of the result, linking to the full page if needed.

### `/idea`

Generates a random game idea using Orteil's Game Gen.

### `/lospec`

Searches the Lospec Palette List for a given color palette.

### `/starter`

Sends you a handy list of resources.

## Guild slash commands

These commands can only be used inside the GameMaker server, and will not work via direct messages with the bot.

### `/birthday`

Gives a user the birthday role for 24 hours. Only usable by admins.

### `/done`

Sends a message in the channel stating that it is available for another question, only  usable in the help channels. In GMBot v1, this also removed the '__help' part of the channel name. In v2, this whole mechanic has been completely removed due to new rate limits imposed by the latest Discord API, as this system is no longer possible.

### `/lifetime`

Tells you how long you have (or another member has) been part of the GameMaker server.

### `/role-distributor`

Sets up the role distribution message in the channel it was called in. Only usable by admins.

### `/say`

Sends a message as the bot. Only usable by admins.

## Guild message context commands

These are commands that appear when you right click a message within the GameMaker server.

### `resize`

Use this command when right clicking on a message that has an image attachment. It lets you resize the image and post the resized version.

## Global message handlers

These are message detection features that work anywhere.

### Haste code block

Formatting a code block with the `haste` language will automatically post a hastebin link to that snippet.

### Wrong code block

Formatting a code block by using the incorrect characters will automatically post a message letting you know you how to do it correctly.

## Removed features

The following features were removed in version 2:

- GMCW search
- Miniboss
- YoYo Marketplace search
- Help cards
- GM Color
- Assembling
- GM Changelog getter
- Github search
- Giveaway related systems
- Security service (the bot now always logs new users)
- Clean code block modifer
- Brainfuck code block modifier
- GML code block modifier
- GMLive code block modifier
- A handful of rarely used commands related to memes or misc things

---
ALL COMMANDS -> SLASH

done DOCS COMMAND
done HELP CHANNEL STUFF
done !DONE
done DO NOT NEED SPAM PROTECTION
done DO NOT NEED FILTERS
done JOIN LOG

done CHANGE RESIZE TO CONTEXT MENU
done KEEP IDEA
done KEEP STARTER
done KEEP LOSPEC
done KEEP HASTE MODIFIER
done KEEP MALFORMED CODE BLOCK
done KEEP SAY COMMAND
done KEEP THE HMMS

reaction role stuff
KEEP BIRTHDAY
