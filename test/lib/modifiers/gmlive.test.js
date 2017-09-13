// Node libs
const assert = require('assert');

// Project libs
const gmlive = require('../../../src/lib/modifiers/gmlive.js');

let generatedLinks = [];

let sampleMessage = {
  content: '```gmlive //test ```',
  generatedLinks: [],
  delete: () => new Promise(res => res()),
  channel: {
    send: () => new Promise(res => res()),
  }
};

// GMLive Modifier test suite
describe('GMLive modifier', function() {
  it('should correctly match message', function() {
    let res = gmlive(sampleMessage);
    assert.ok(res);
  });

  it('should generate correct GMLive links', function() {
    let res = gmlive(sampleMessage);
    assert.equal(res, 'http://yal.cc/r/gml/?mode=2d&gml=IC8vdGVzdCA=');

    sampleMessage.content = '```gmlive //here is a larger, more complex test! ```';
    res = gmlive(sampleMessage);
    assert.equal(res, 'http://yal.cc/r/gml/?mode=2d&gml=IC8vaGVyZSBpcyBhIGxhcmdlciwgbW9yZSBjb21wbGV4IHRlc3QhIA==');
  });
});