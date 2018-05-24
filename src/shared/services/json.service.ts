import fs = require('fs');
import path = require('path');

class JSONService {
  /** Location of all json files */
  private jsonFileLocation: string = path.join(__dirname, '../assets/json');

  /** Contains all json file contents by file name */
  files: {
    [key: string]: any;
  } = {};

  loadAlljsonFiles() {
    let jsonFiles = fs.readdirSync(this.jsonFileLocation);

    jsonFiles.forEach(file => {
      let fileName = path.basename(file, '.json');
      let filePath = path.join(this.jsonFileLocation, file);
      let fileContent = fs.readFileSync(filePath, 'utf8');

      try {
        this.files[fileName] = JSON.parse(fileContent);
      } catch(e) {
        console.warn(`Could not parse JSON file: ${filePath}`);
      }
    });
  }
}

export let jsonService = new JSONService();
