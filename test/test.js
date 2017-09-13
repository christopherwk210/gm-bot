// Node libs
const assert = require('assert');

// Project libs
const parseCommandList = require('../src/lib/utils/parseCommandList.js');

// Create sample data
let sampleRules = [
  {
    matches: ['abc'],
    position: 0,
    exact: false,
    action: msg => {}
  }
];

// Dummy message
let msg = {
  content: 'abc 123 test',
  delete: () => {
    return new Promise(function(res, rej) {
      res();
    })
  }
};

// Parse Command List Test Suite
describe('parseCommandList', function() {
  it('should match non-exact strings correctly', function() {
    let res = parseCommandList(sampleRules, msg);
    assert.ok(res);
  });
});