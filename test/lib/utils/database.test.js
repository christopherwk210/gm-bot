// Node libs
const assert = require('assert');
const fs = require('fs');

// Project libs
const parseCommandList = require('../../../src/lib/utils/database.js');

// Run db
let db = parseCommandList.initializeDatabase();

// Database util test suite
describe('Database utility', function() {
  describe('return value', function() {
    it('should contain reference to admin database', function() {
      assert.equal(db.admins.filename, './src/data/admins.db');
    });

    it('should contain reference to voip database', function() {
      assert.equal(db.voip.filename, './src/data/voip.db');
    });

    it('should contain reference to profile database', function() {
      assert.equal(db.profile.filename, './src/data/profile.db');
    });
  });

  describe('database file', function() {
    it('admins.db should exists', function() {
      assert.ok(fs.existsSync('./src/data/admins.db'));
    });

    it('voip.db should exists', function() {
      assert.ok(fs.existsSync('./src/data/voip.db'));
    });

    it('profile.db should exists', function() {
      assert.ok(fs.existsSync('./src/data/profile.db'));
    });
  });
});