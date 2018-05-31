import * as fs from 'fs';
import * as path from 'path';

class MarkdownService {
  /** Contains all markdown file contents by file name */
  files: {
    [key: string]: string;
  } = {};

  /** Location of all markdown files */
  private markdownFileLocation: string = path.join(__dirname, '../assets/markdown');

  /** Loads all Markdown files under ../assets/markdown into memory */
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
