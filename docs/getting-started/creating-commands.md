# Creating commands
GMBot commands are setup like a list of rules to be parsed. Instead of redefining logic to parse a message for a specific string every time we make a command, we just create a set of rules we can pass on to a parser that does all of the hard work. One way these rules are defined is with an object adhering to the `Rule` interface. Another way is by creating a `CommandClass` for more in-depth commands.

## Rules
Let's start by making a simple rule to respond to a specific message. The `Rule` interface tells us everything we need to know about rules:
```filepath
gm-bot/src/shared/interfaces/rule.interface.ts
```
```typescript
export interface RuleOptions {
  /** All matches to recognize for this command */
  matches: string[];

  /** The prefix for this command, to match before any of the matches */
  prefix?: string;

  /** Position to check for the match, if omitted, match anywhere */
  position?: number;

  /** If true, overrides position and compares the entire string */
  wholeMessage?: boolean;

  /** If omitted or true, it will match case-sensitively */
  exact?: boolean;

  /** Whether or not to delete the matched message (after calling the action) */
  delete?: boolean;
}

export interface Rule extends RuleOptions {
  /**
   * Callback function that is triggered when message satsifies match requirements
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message | TextChannelMessage, args: string[]);

  /**
   * Prevalidation callback which is called every message after a match is found.
   * If a truthy value is returned, it will call the rule action. Useful for determining
   * if a user has permission or not.
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre?(msg: Message, args: string[]): boolean;
}
```

At minimum, a rule must have a `matches` array and an `action` function. The following example defines a rule that responds to a message with the contents "?test" with a message:
```typescript
let rule: Rule = {
  matches: ['test'],
  prefix: '?',
  action: msg => {
    msg.channel.send('hello world!');
  }
};
```

If we pass this to the rule parser, it will automatically check this rule against every message. If it finds a match, it will call the `action` callback and provide the original matched message there for us.

Now that we have our rule, let's actually add it to the bot! Are you excited? Good, you should be. Open up `gm-bot/src/rules.ts`. In this file you will find the `loadRules()` function. This function aggregates all the rules for the entire bot into a single array which we pass on to the rule parser later, which handles all of the hardwork.

The commands are broken up into smaller arrays for organizational purposes. Let's append a command to the `coreCommands` array, because our new rule is obviously an important command:
```typescript
  /** Functional utility commands */
  let coreCommands: (Rule | Type<any>)[] = [
    // all the other commands are above this one...
    {
      matches: ['test'],
      prefix: '?',
      action: msg => {
        msg.channel.send('hello world!');
      }
    }
  ];
```

That's it! Our new rule is correctly setup in the bot. Using this approach, however, is only ideal for very simple commands. Read on to learn about making a [CommandClass](#CommandClass-rules) for more complex rules.

## Rule template
Most of the commands in GMBot share the same rule options, and so there's a template object to make our lives easier. We can use the template options in our rules like so:
```typescript
// Import the rule template from our config
import { prefixedCommandRuleTemplate } from './config';

// Create a rule using the template
let rule = {
  ...prefixedCommandRuleTemplate,
  matches: ['test'],
  action: msg => {
    // Command stuffs
  }
}
```
The `prefixedCommandRuleTemplate` contains the following preset options:
```typescript
export const prefixedCommandRuleTemplate = {
  prefix: '!',
  position: 0,
  exact: false,
  delete: true
};
```
Unless you specifically require otherwise, it's recommended that you always use the template when creating new rules (especially because the server only allows commands prefixed with `!` at the moment).

## CommandClass rules
For more complex commands, you should create your own `CommandClass`. These are separate files that are imported into `rules.ts`, and live inside the `gm-bot/src/commands/` folder. Inside that folder, there also exists an `index.ts` that helps export all commands, which you'll want to add your class to for convenience.

To get started making your own CommandClass, you can run the generator script with the `command` option passed:
```bash
npm run g command
```

You will be prompted to enter a name for your command, which should always be as short as possible. After entering a name, it will create a folder and class file under `gm-bot/src/commands/` for you to get started with. The template file will look something like this:
```filepath
gm-bot/src/commands/sample.command.ts
```
```typescript
import { Message } from 'discord.js';
import { prefixedCommandRuleTemplate } from '../../config';
import { Command, CommandClass } from '../../shared';

@Command({
  matches: ['sample'],
  ...prefixedCommandRuleTemplate
})
export class SampleCommand implements CommandClass {

  constructor() {
    // Initialization code here, if any (constructor can be removed if not needed)
  }

  /**
   * Command action
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  action(msg: Message, args: string[]) {

  }

  /**
   * Command validation action, can be removed if not needed
   * @param msg Original discord message
   * @param args Message contents, split on space character
   */
  pre(msg: Message, args: string[]) {
    // By returning true, we signify that validation has passed, causing the action to trigger
    return true;
  }
}
```
You'll notice that above our class exists a `Command` decorator with some familiar options. The command decorator accepts all `Rule` options except for `action` and `pre`, which you'll see are now methods of our class. Creating commands this way is preferred when the command is more involved than a few lines. It allows you to separate your command and rule logic to a separate file, and break up any needed functionality with various class methods. Feel free to have a look at some existing commands to get a feel for how they are constructed!

## RuleFactory
When creating simple rules, often times you just want to reply to a message with a static message, or react to it with emojis. Because these rules are so common, there exists the `RuleFactory` to help create them. The `RuleFactory` is a class with static methods that create proper rule configurations for replying to messages with text and reacting to them.

To create a reply rule, use the `ReplyRule` method. To create a reaction rule, use the `createReactionRule` method:
```typescript
// The first argument is an array of matches.
// The second is the response message.
let replyRule = RuleFactory.createReplyRule(
  ['lospec', 'palettes', 'palette-list'],
  'Here\'s a list of useful palettes:\nhttps://lospec.com/palette-list'
);

// The first argument is an array of matches.
// The second is an array of emojis to react with.
// The third makes the rule only match whole message strings
let reactRule = RuleFactory.createReactionRule(
  ['hmm'],
  ['🇭', '🇲', 'Ⓜ'],
  true
);
```

These function calls can be placed directly inside of the rules arrays, and each have their own arrays in the `loadRules()` function: `replyRules` and `reactRules`.
