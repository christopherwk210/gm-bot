
import * as fs from 'fs';
import * as path from 'path';

/**
 * Contains information related to Helpcards
 */
class HelpcardService {
  /** Holds helpcard names */
  imageNames: string[] = [];
  imagePath: string = path.join(__dirname, '../assets/images/helpcards');

  /** Initialize the Helpcard service */
  loadHelpcards() {
    let imageFiles = fs.readdirSync(this.imagePath);

    for (let img of imageFiles) {
      this.imageNames.push(img.slice(0, -4));
    }
  }
}

export let helpcardService = new HelpcardService();
