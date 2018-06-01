import { expect } from 'chai';
import { getMockMessage, MockMessage } from '../../../tools/test';
import { CommandmentCommand } from './commandment.command';

let mockMessage: MockMessage;

beforeEach(() => {
  mockMessage = getMockMessage();
});

describe('CommandmentCommand', () => {
  it('should send the correct gif link', () => {
    let commandmentCommand = new CommandmentCommand();

    mockMessage.channel.send = res => {
      expect(res).to.be.equal('https://gfycat.com/gifs/detail/MediocreYellowishHapuka');
    };

    commandmentCommand.action(mockMessage as any, ['', 'V']);
  });
});
