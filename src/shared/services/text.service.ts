import fs = require('fs');
import path = require('path');

class TextService {
  /** Location of all text files */
  private textFileLocation: string = path.join(__dirname, '../assets/text');

  /** Contains all text file contents by file name */
  files: {
    [key: string]: string;
  } = {};

  loadAllTextFiles() {
    let textFiles = fs.readdirSync(this.textFileLocation);

    textFiles.forEach(file => {
      let fileName = path.basename(file, '.txt');
      let filePath = path.join(this.textFileLocation, file);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      this.files[fileName] = fileContent;
    });
  }
}

export let textService = new TextService();
