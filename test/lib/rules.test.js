// Node libs
const assert = require('assert');

// Project libs
const rules = require('../../src/lib/rules.js');

// Rules test suite
describe('Rules', function() {
  it('should define an array of rules', function() {
    assert.equal(typeof rules, 'object');
    assert.ok(rules.length > 1);
  });
});