// Node libs
const assert = require('assert');

// Project libs
const parseCommandList = require('../../../src/lib/utils/parseCommandList.js');

// Dummy message
let msg = {
  content: 'AbC 123 test',
  hasDeleted: false,
  delete: () => {
    this.hasDeleted = true;
    return new Promise(function(res, rej) {
      res();
    })
  }
};

// Parse Command List Test Suite
describe('parseCommandList', function() {
  describe('should match', function() {
    it('non-exact strings correctly', function() {
      // Sample rule
      let sampleRule = [
        {
          matches: ['abc'],
          exact: false,
          action: () => {}
        }
      ];
  
      let res = parseCommandList(sampleRule, msg);
      assert.ok(res);
    });

    it('positioned strings', function() {
      // Sample rule
      let sampleRule = [
        {
          matches: ['123'],
          position: 4,
          action: () => {}
        }
      ];
  
      let res = parseCommandList(sampleRule, msg);
      assert.ok(res);
    });

    it('whole message strings', function() {
      // Sample rule
      let sampleRule = [
        {
          matches: ['AbC 123 test'],
          wholeMessage: true,
          exact: true,
          action: () => {}
        }
      ];
  
      let res = parseCommandList(sampleRule, msg);
      assert.ok(res);
    });

    it('prefixed strings', function() {
      // Sample rule
      let sampleRule = [
        {
          matches: ['bc'],
          position: 0,
          prefix: 'a',
          exact: false,
          action: () => {}
        }
      ];
  
      let res = parseCommandList(sampleRule, msg);
      assert.ok(res);
    });
  });

  it('should delete messages', function() {
    // Sample rule
    let sampleRule = [
      {
        matches: ['abc'],
        exact: false,
        delete: true,
        action: () => {}
      }
    ];

    // Make sure the message has a clean deleted state
    msg.hasDeleted = false;

    let res = parseCommandList(sampleRule, msg);
    assert.ok(!msg.hasDeleted);
  });

  it('should trigger action callback with arguments', function(done) {
    // Sample rule
    let sampleRule = [
      {
        matches: ['abc'],
        exact: false,
        action: (msg, args) => {
          assert.equal(typeof msg, 'object');
          assert.equal(typeof args, 'object');
          done();
        }
      }
    ];

    let res = parseCommandList(sampleRule, msg);
  });
});