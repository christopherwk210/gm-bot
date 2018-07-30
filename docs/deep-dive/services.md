# Services
There are various persistent classes included with GMBot labelled as services. These services include a variety of helpful functionality when deveoping new features.

## Asset services
These services load a specific type of a asset file on bot load and keeps them in memory for easy access. They do **not** detect changes, so if changes are made you must read from them manually.

The files they load are available under a `files` class property, and can be accessed by passing the file name (without extension) as an object property of `files`:
```typescript
// Gets the contents of the auth.json file
let auth = jsonService.files['auth'];

// Gets the contents of the banner.txt file
let banner = textService.files['banner'];
```
### Markdown service `gm-bot/src/shared/services/markdown.service.ts`

This service loads all markdown files found under `gm-bot/src/shared/markdown/*.md`.

### Text service `gm-bot/src/shared/services/text.service.ts`
This service loads all text files found under `gm-bot/src/shared/assets/text/*.txt`.

### JSON service `gm-bot/src/shared/services/json.service.ts`
This service loads all JSON files found under `gm-bot/src/shared/assets/json/*.json`.

The JSON service also includes helper functions for writing to JSON files:
```typescript
// This method returns a function that writes to the auth.json file asynchronously
let asyncWriter = jsonService.getAsyncWriter('auth');

// You can call the function passing in an object or string to write to the JSON file.
// If an object is passed, it will be converted to a string with JSON.stringify()
asyncWriter({ token: 'new token' }).then(err => {
  if (err) {
    console.error('Something went wrong, but this will proooobably never happen.');
  }
});
```

The JSON service provides `AsyncWriter` functions that are set up as non-parallel async queue's, which means you don't need to worry about waiting for one to finish before attempting to write to the file again. If a previous operation isn't complete, the operation is queued until ready. Its also important to note that this completely overwrites the file contents with whatever you pass.

## Guild services
These services load guild information on bot load and provided references to them for easy access.

### Guild service `gm-bot/src/shared/services/guild.service.ts`
This service exposes the /r/GameMaker server guild under the `guild` property.

### Role service `gm-bot/src/shared/services/role.service.ts`
This service exposes all of the roles on the /r/GameMaker guild and exposes them under the `roles` property as an array of `Role`'s. It also stores just the role names as an array under `roleNames`.

Specific roles can be retrieved with the `getRoleByName()` and `getRoleById()` methods.

### Channel service
This service exposes the /r/GameMaker server channels under the `channels` property. It also exposes `getChannelByName()` and `getChannelByID()` accessor methods.

The channels are also made available through separate array properties that separates them by type:
```typescript
/** All server categories */
categoryChannels: CategoryChannel[];

/** All server text channels */
textChannels: TextChannel[];

/** All server voice channels */
voiceChannels: VoiceChannel[];
```

### HelpChannel service
This service handles renaming the help channels when they're busy. It's completely automatic, and will append `_busy` to any help channel that's had a message sent in the last few minutes. If there hasn't been a messsage in a while, it will remove the `_busy` tag from the name.

The exact amount of time it waits before going back to "not busy" state can be changed in the bot config (`./src/config.ts`).
