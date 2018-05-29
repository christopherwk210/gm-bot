import * as fs from 'fs';
import * as path from 'path';

import { Project } from '../../tool.config';
import { Schematic, stringToPascalCase, stringToKebabCase } from '../';

const templatePath = path.join(__dirname, './modifier.template.txt');

/** Schematic for generating modifiers */
export const modifierSchema: Schematic = {
  name: 'modifier',
  template: fs.readFileSync(templatePath, 'utf8'),
  inputs: [
    'What is the name of your modifier?'
  ],
  preWrite: async function(inputResults) {
    if (!inputResults[0]) {
      return { err: 'No modifier name provided!' };
    }

    let kebabName = stringToKebabCase(inputResults[0]);
    let pascalName = stringToPascalCase(inputResults[0]);

    // Replace match
    this.template = this.template.replace('$0', kebabName);

    // Replace class
    this.template = this.template.replace('$1', pascalName);

    return path.join(Project.SOURCE_ROOT, `./modifiers/${kebabName}/${kebabName}.modifier.ts`);
  },
  postWrite: res => {
    if (res) {
      res.err ? console.error(res.err) : console.error(res);
    } else {
      console.log('Modifier successfully generated!\nYou still need to correctly add it to [N/A]');
    }
  }
};
