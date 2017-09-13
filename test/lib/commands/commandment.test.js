// Node libs
const assert = require('assert');

// Project libs
const commandment = require('../../../src/lib/commands/commandment.js');

let msg = {
  author: {
    send: () => {}
  },
  channel: {
    send: () => {}
  }
};

// Commandment test suite
describe('Commandment lib', function() {
  it('should send the correct gif link', function(done) {
    msg.channel.send = res => {
      assert.equal(res, 'https://gfycat.com/gifs/detail/MediocreYellowishHapuka');
      done();
    }
    commandment(msg, [0, 'V']);
  });
});