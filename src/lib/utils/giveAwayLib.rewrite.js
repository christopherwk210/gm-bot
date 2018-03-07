// Node libs
const fs = require('fs');
const path = require('path');

// Init
let data = {}
let filePath = path.join(__dirname, '../../data/giveAwaysData.json');

// Load existing data or create it, if not present
if (fs.existsSync(filePath)) {
  data = require('../../data/giveAwaysData.json');
} else {

}


