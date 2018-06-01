# Testing and linting
GMBot comes with `mocha` and `chai` for testing, and `tslint` for linting. These are both run *automatically* before a commit is made, and will prevent the commit from being made if either of them fail. It's important to run these as you develop to prevent any errors from surprising you before you commit. They can both be run with `npm test` and `npm run lint` respectively

## Writing your own tests
Mocha is configured to automatically test any `*.spec.ts` file that is found under the `gm-bot/src` folder. Accompanying your modifier or command files with a matching `*.spec.ts` file is the best way to write tests for them. When writing these tests, you'll most likely want to create a mock Discord message, since the bot will *not* be connected to Discord during the tests. To help with this, a mock message generator function is exported from `gm-bot/tools/test` and can be used like this:
```filepath
gm-bot/src/commands/cool/cool.spec.ts
```
```typescript
import { expect } from 'chai';
import { getMockMessage, MockMessage } from '../../../tools/test';
import { CoolCommand } from './cool.command';

let mockMessage: MockMessage;

beforeEach(() => {
  // Create a fresh message mock before each test
  mockMessage = getMockMessage();
});

describe('CoolCommand', () => {
  it('should totally work', () => {
    let coolCommand = new CoolCommand();

    // Override the channel.send mock to make sure the right value is sent from our command
    mockMessage.channel.send = message => {

      // Make sure that our command worked as expected,
      // by checking the message it sent to the message channel
      expect(message).to.be.equal('hello world!');
    };

    // Trigger the command with the mock message and a fake arguments array
    coolCommand.action(mockMessage as any, ['!cool']);
  });
});

``` 
