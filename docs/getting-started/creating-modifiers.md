# Creating modifiers
GMBot has the built in capability to recognize custom code-block languages and act upon them, much like how commands are matched and acted upon. These code-block rules are called `Modifiers`. Like rules and command classes, these are in their own array in the `rules.ts` file and get run through their own parser. Unlike commands, there is no simpler `Rule` equivalent - the only way to define these types of rules is as a `ModifierClass`.

## ModifierClass
Much like the `CommandClass`, a ModifierClass has its own folder and file, under `gm-bot/src/modifiers/`. These can also be scaffolded just like commands using the generator script:
```bash
npm run g modifier
```

This will generate a file that looks something like this:
```filepath
gm-bot/src/modifiers/sample/sample.modifier.ts
```
```typescript
import { Message } from 'discord.js';
import { Modifier, ModifierClass } from '../../shared';

@Modifier({
  match: 'sample',
  delete: true
})
export class SampleModifier implements ModifierClass {
  constructor() {
    // Initialization code here, if any (constructor can be removed if not needed)
  }

  /**
   * Modifier action
   * @param msg Original discord message
   * @param contents Contents of all matched code blocks
   * @param match Modifier match string
   */
  action(msg: Message, contents: string[], match: string) {

  }

  /**
   * Prevalidation callback, can be removed if not needed
   * @param msg Original discord message
   * @param contents Contents of all matched code blocks
   * @param match Modifier match string
   */
  pre(msg: Message, contents: string[], match: string) {
    // By returning true, we signify that validation has passed, causing the action to trigger
    return true;
  }
}
```

You'll see that above the class is `Modifier` decorator. This only accepts two options:
```typescript
export interface ModifierOptions {
  /** Code block language to match for this modifier */
  match: string;

  /** Whether or not to delete the matched message (after calling the action) */
  delete?: boolean;
}
```
Whatever you pass to the `match` property will be treated as the language to match. A property of `test` would match the following message:
````markdown
```test
code block contents!
```
````

The `pre` and `action` methods work similarly to how they work with commands. One key difference, is the `contents` argument. This argument is an array of strings equal to the contents of each code block matched in a message. If there was only one code block matched, the array will only have one entry.
