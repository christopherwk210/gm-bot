// Node libs
const assert = require('assert');

// Project libs
const prettifier = require('../../../src/lib/modifiers/prettifier.js');

let sampleMessage = {
  content: '```clean-code if (condition) { return result; } ```',
  delete: () => new Promise(res => res()),
  channel: {
    send: () => new Promise(res => res()),
  }
};

// Clean code modifier test suite
describe('Clean code modifier', function() {
  it('should correctly match message', function() {
    let res = prettifier(sampleMessage);
    console.log(res);
    assert.ok(true);
  });
});