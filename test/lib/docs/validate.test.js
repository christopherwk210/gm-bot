// Node libs
const assert = require('assert');

// Project libs
const validate = require('../../../src/lib/utils/validate-gml.js');

// Validate test suite
describe('Validate lib', function() {
  it('should correctly identify gms1 functions', function() {
    assert.ok( validate.gml.gms1('draw_sprite') );
    assert.ok( validate.gml.gms1('draw_self') );
  });

  it('should correctly identify gms2 functions', function() {
    assert.ok( validate.gml.gms2('gpu_set_blendenable') );
    assert.ok( validate.gml.gms2('draw_self') );
  });
});
