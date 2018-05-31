import * as fs from 'fs';
import * as path from 'path';

import { Project } from '../../tool.config';
import { Schematic, stringToPascalCase, stringToKebabCase } from '../';

const templatePath = path.join(__dirname, './command.template.txt');

/** Schematic for generating commands */
export const commandSchema: Schematic = {
  name: 'command',
  template: fs.readFileSync(templatePath, 'utf8'),
  inputs: [
    'What is the name of your command?'
  ],
  async preWrite(inputResults) {
    if (!inputResults[0]) {
      return { err: 'No command name provided!' };
    }

    // Transform name
    let kebabName = stringToKebabCase(inputResults[0]);
    let pascalName = stringToPascalCase(inputResults[0]);

    // Replace match
    this.template = this.template.replace('$0', kebabName);

    // Replace class
    this.template = this.template.replace('$1', pascalName);

    return path.join(Project.SOURCE_ROOT, `./commands/${kebabName}/${kebabName}.command.ts`);
  },
  postWrite: res => {
    if (res) {
      res.err ? console.error(res.err) : console.error(res);
    } else {
      console.log('Command successfully generated!\nYou still need to correctly add it to the rules in ./src/rules.ts');
    }
  }
};
