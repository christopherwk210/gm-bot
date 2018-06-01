import { expect } from 'chai';
import { getMockMessage, MockMessage } from '../../../tools/test';
import { DevmodeModifier } from './devmode.modifier';

let mockMessage: MockMessage;

beforeEach(() => {
  mockMessage = getMockMessage();
});

describe('DevmodeModifier', () => {
  it('should correctly handle replies', () => {
    let devmodeModifier = new DevmodeModifier();

    mockMessage.channel.send = message => {
      expect(message).to.be.equal('pong');
    };

    let contents = [`reply('pong')`];

    devmodeModifier.action(mockMessage as any, contents);
  });

  it('should correctly hold shared reference', () => {
    let devmodeModifier = new DevmodeModifier();

    mockMessage.channel.send = message => {
      expect(message).to.be.equal('string');
    };

    let contents = [`typeof this.shared`];

    devmodeModifier.action(mockMessage as any, contents);
  });
});
