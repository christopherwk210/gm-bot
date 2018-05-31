import { expect } from 'chai';
import { getMockMessage, MockMessage } from '../../../tools/test';
import { Message } from 'discord.js';
import { parseCommandList } from './parse-command-list';
import { Rule } from '..';

let mockMessage: MockMessage;
let sampleRule: Rule;

beforeEach(() => {
  mockMessage = getMockMessage();
  mockMessage.content = 'abc';
  sampleRule = {
    matches: ['abc'],
    action: (msg, args) => true
  };
});

describe('parseCommandList', () => {
  describe('should match', () => {
    it('non-exact strings correctly', () => {
      sampleRule.exact = false;
      let result = parseCommandList([sampleRule], mockMessage as any);
      expect(result).to.be.true;
    });

    it('prefixed strings', () => {
      sampleRule.prefix = '!';
      mockMessage.content = '!abc';
      let result = parseCommandList([sampleRule], mockMessage as any);
      expect(result).to.be.true;
    });

    it('positioned strings', () => {
      sampleRule.position = 2;
      mockMessage.content = '  abc';
      let result = parseCommandList([sampleRule], mockMessage as any);
      expect(result).to.be.true;
    });
  });

  it('should delete messages', () => {
    mockMessage.delete = mockMessage.hasDeleted = true;
    let res = parseCommandList([sampleRule], mockMessage as any);
    expect(mockMessage.hasDeleted).to.be.true;
  });

  it('should trigger action callback with arguments', done => {
    sampleRule.action = (msg, args) => {
      expect(typeof msg).to.be.equal('object');
      expect(typeof args).to.be.equal('object');
      done();
    };

    parseCommandList([sampleRule], mockMessage as any);
  });
});
