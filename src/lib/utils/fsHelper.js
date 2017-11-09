// Imports
const fs = require('fs');

/**
 * Wraps file existence check in a promise
 * @param {string} file Path to file
 */
function exists(file) {
  return new Promise(resolve => {
    fs.exists(file, exists => resolve(exists));
  });
}

/**
 * Reads a JSON file into memory as an object
 * @param {string} file  Path to JSON file
 */
function readJSON(file) {
  return new Promise((resolve, reject) => {
    fs.readFile(file, { encoding: 'utf8' }, (err, data) => {
      // Reject on error
      if (err) {
        reject(err);
      } else {
        let parsed = '';

        // Attempt to parse and resolve
        try {
          parsed = JSON.parse(data);
          resolve(parsed);
        } catch(e) {

          // Reject on invalid JSON
          reject('Could not parse JSON!');
        }
      }
    });
  });
}

/**
 * Saves a JS object to a file as json
 * @param {Object} object JS object that can be safely converted to JSON
 * @param {string} file Path to JSON file
 */
function saveJSON(object, file) {
  return new Promise((resolve, reject) => {
    let write = '';

    // Attempt to stringify
    try {
      write = JSON.stringify(object);
    } catch(e) {
      reject('Could not stringify.');
    }

    // Attempt to write
    fs.writeFile(file, write, { encoding: 'utf8' }, err => {
      // No!
      if (!err) {
        // Yes!
        resolve();
      }
    });
  });
}

module.exports = {
  exists: exists,
  readJSON: readJSON,
  saveJSON: saveJSON
};
