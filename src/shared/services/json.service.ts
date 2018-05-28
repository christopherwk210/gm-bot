import * as fs from 'fs';
import * as path from 'path';
import { queue, AsyncQueue } from 'async';

class JSONService {
  /** Location of all json files */
  private jsonFileLocation: string = path.join(__dirname, '../assets/json');

  /** Contains all json file contents by file name */
  files: { [key: string]: any; } = {};

  /** Contains all async JSON queue writers */
  private writerQueues: any[] = [];

  /** Loads all JSON files under ../assets/json into memory */
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

  /**
   * Get the async JSON writer for the given file
   * @param file JSON file name without extension
   * @param fullPath If true, denotes that the given path is a full path rather than just a file name (including extension)
   */
  getAsyncWriter(file: string, fullPath: boolean = false): AsyncWriter {
    if (this.writerQueues[file]) {
      return this.writerQueues[file];
    } else {
      return this.writerQueues[file] = this.createAsyncWriter(file, fullPath);
    }
  }

  /**
   * Create an async JSON writer queue for the given file
   * @param file JSON file name without the extension
   * @param fullPath If true, denotes that the given path is a full path rather than just a file name (including extension)
   */
  private createAsyncWriter(file: string, fullPath: boolean = false): AsyncWriter {
    let filePath = fullPath ? file : path.join(this.jsonFileLocation, `${file}.json`);

    // Create the async queue
    let queueWriter = queue((task: any, callback) => {
      fs.unlink(filePath, (err) => {
        if (err) {
          callback(err);
        } else {
          fs.writeFile(filePath, task.contents, 'utf8', (err) => {
            callback(err);
          });
        }
      });
    }, 1);

    // Create the AsyncWriter function
    return (contents: Object|string) => new Promise(resolve => {

      // Stringify object
      if (typeof contents !== 'string') {
        try {
          contents = JSON.stringify(contents);
        } catch(e) {
          resolve(e);
          return;
        }
      }

      // Push to queue
      queueWriter.push({ contents }, err => resolve(err));
    })
  };
}

export let jsonService = new JSONService();

export interface AsyncWriter {
  /**
   * Push an object or string to be written asynchronously.
   * Resolves on completion with an object containing errors, if any
   */
  (contents: Object|string): Promise<any>;
}
