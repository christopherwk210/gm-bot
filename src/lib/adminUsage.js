const fs = require('fs');
const path = require('path');

/**
 * Records an admin front-end action to logs
 * @param {string} user The admin user performing the action
 * @param {string} time Time action was done
 * @param {string} message Action or message describing action
 */
const log = function(user, time, message) {
  time = convertTimestamp(time);
  let logString = `${time}, ${user}: ${message}`;
	let dir = path.join(__dirname, '..', '..', 'logs');
  let file = path.join(__dirname, '..', '..', 'logs', 'adminUsage.log');

	if (!fs.existsSync(dir)){
		fs.mkdirSync(dir);
	}

	fs.writeFile(file, '--- Admin Usage Logs ---\n', { flag: 'wx' }, (err) => {
		fs.appendFile(file, logString + '\n', function (err) {
			if (err) {
				console.log(err);
			}
		});
	});
};

/** https://gist.github.com/kmaida/6045266 */
function convertTimestamp(timestamp) {
  var d = new Date(timestamp),
		yyyy = d.getFullYear(),
		mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
		dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
		hh = d.getHours(),
		h = hh,
		min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
		ampm = 'AM',
		time;
			
	if (hh > 12) {
		h = hh - 12;
		ampm = 'PM';
	} else if (hh === 12) {
		h = 12;
		ampm = 'PM';
	} else if (hh == 0) {
		h = 12;
	}
	
	// ie: 2013-02-18, 8:35 AM	
	time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
		
	return time;
}

module.exports.log = log;