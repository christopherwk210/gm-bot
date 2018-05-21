// Node libs
const assert = require('assert');

// Project libs
const rules = require('../../src/lib/rules.js');

// Mock params
const mock = {
  msg: {
    channel: { send: () => Promise.resolve(mock.msg) },
    author: { send: () => Promise.resolve(mock.msg) },
    delete: () => Promise.resolve(),
    content: '',
    member: {
      send: () => Promise.resolve(mock.msg),
      guild: {
        roles: []
      }
    },
    guild: {
      roles: [],
      emojis: {
        find: () => {}
      }
    },
    attachments: { values: () => [] },
    react: () => Promise.resolve(mock.msg)
  },
  args: ['a','b']
}

// Rules test suite
describe('Rules', function() {
  it('should define an array of rules', function() {
    assert.equal(typeof rules, 'object');
    assert.ok(rules.length > 1);
  });

  it('should contain only valid rules', function() {
    rules.forEach(rule => {
      rule.action(mock.msg, mock.args);
    });
  });
});
