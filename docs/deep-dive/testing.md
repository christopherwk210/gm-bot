# Testing and linting
GMBot comes with `mocha` and `chai` for testing, and `tslint` for linting. These are both run *automatically* before a commit is made, and will prevent the commit from being made if either of them fail. It's important to run these as you develop to prevent any errors from surprising you before you commit. They can both be run with `npm test` and `npm run lint` respectively

You can also run tests from within [Visual Studio Code](https://code.visualstudio.com/). With the GMBot project open in Visual Studio Code, open the Debug view by clicking the bug icon on the left, or going to `View > Debug`. Ensure that "Execute GMBot tests" is populated in the drop-down control at the top of the panel, and click the green arrow to immediately test the project. The output of the tests will be visible in the debug console, which can be accessed by going to `View > Debug Console`.

## Writing your own tests
Mocha is configured to automatically test any `*.spec.ts` file that is found under the `gm-bot/src` folder. Accompanying your modifier or command files with a matching `*.spec.ts` file is the best way to write tests for them. When writing these tests, you'll most likely want to create a mock Discord message, since the bot will *not* be connected to Discord during the tests. To help with this, a mock message generator function is exported from `gm-bot/tools/test` and can be used like this:
```filepath
gm-bot/src/commands/cool/cool.spec.ts
```
```typescript
import { expect } from 'chai';
import { CoolCommand } from './cool.command';

// Import mock message tools
import { getMockMessage, MockMessage } from '../../../tools/test';

// Create a mock message holder
let mockMessage: MockMessage;

beforeEach(() => {
  // Get a fresh message mock before each test
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
One very important thing to note is that you must cast your `MockMessage` to type `any`. This is because your command or modifier will be expecting a `Message` type as the first argument, but we are passing a `MockMessage` type. Mock messages can't be casted to `Message` types either, as they don't share required properties.
