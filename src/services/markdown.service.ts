import fs = require('fs');
import path = require('path');

class MarkdownService {
  /** Location of all markdown files */
  private markdownFileLocation: string = path.join(__dirname, '../../shared/assets/markdown');

  /** Contains all markdown file contents by file name */
  files: {
    [key: string]: string;
  } = {};

  loadAllMarkdownFiles() {
    let markdownFiles = fs.readdirSync(this.markdownFileLocation);

    markdownFiles.forEach(file => {
      let fileName = path.basename(file, '.md');
      let filePath = path.join(this.markdownFileLocation, file);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      this.files[fileName] = fileContent;
    });
  }
}

export let markdownService = new MarkdownService();
