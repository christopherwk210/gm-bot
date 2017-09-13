// Node libs
const assert = require('assert');

// Project
const gmbot = require('../gmbot.js');

// Sample image options
let imageOptions = {
	imageLog: {
		timers: []
	},
	imageCap: 3,		 // 3 images within
	imageTimer: 5    // 5ms
};

// Sample message
let msg = {
  delete: function() {
    hasDeleted = true;
    return new Promise(res => res());
  },
  author: {
    id: 1,
    send: function() {
      return new Promise(res => res());
    }
  },
  member: {
    highestRole: 'voip'
  },
  attachments: {
    array: function() {
      return [
        {
          height: 1
        }
      ];
    }
  }
};

let hasDeleted = false;

// GMBot index file test suite
describe('GMBot', function() {
  it('should detect bad links', function() {
    let badLinkMsg = {
      content: 'dropboxx.ga'
    };

    let res = gmbot.detectBadLink(badLinkMsg.content);
    assert.ok(res);
  });

  describe('image handling', function() {
    it('should prevent image spam', function() {
      hasDeleted = false;
      gmbot.handleImages(msg, imageOptions);
      assert.equal(hasDeleted, false);
      gmbot.handleImages(msg, imageOptions);
      assert.equal(hasDeleted, false);
      gmbot.handleImages(msg, imageOptions);
      assert.equal(hasDeleted, false);
      gmbot.handleImages(msg, imageOptions);
      assert.equal(hasDeleted, true);
    });

    it('should reset after the correct amount of time', function(done) {
      gmbot.handleImages(msg, imageOptions);
      gmbot.handleImages(msg, imageOptions);
      gmbot.handleImages(msg, imageOptions);
      gmbot.handleImages(msg, imageOptions);
      
      setTimeout(function() {
        assert.notEqual(imageOptions.imageLog[msg.author.id], 0);
      }, 2);

      setTimeout(function() {
        assert.equal(imageOptions.imageLog[msg.author.id], 0);
        done();
      }, 7);
    });
  });
});