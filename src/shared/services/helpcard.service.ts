
import * as fs from 'fs';
import * as path from 'path';

class HelpcardService {

  imagePath: string = path.join(__dirname, '../assets/images/helpcards');
  imageNames: string[] = [];

  loadHelpcards() {
      let imageFiles = fs.readdirSync(this.imagePath);

      imageFiles.forEach(file => {
        this.imageNames.push(file.slice(0, -4));
      });
  }
}

export let helpcardService = new HelpcardService();
