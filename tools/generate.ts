import * as fs from 'fs';
import * as path from 'path';
import * as util from 'util';
import * as prompts from 'prompts';
import * as mkdirp from 'mkdirp';

import { commandSchema, Schematic } from './schematics';

// Promisification
const exists = util.promisify(fs.exists);
const asyncMkdirp = util.promisify(mkdirp);
const writeFile = util.promisify(fs.writeFile);

/** Array of all available schematics */
const schematics: Schematic[] = [
  commandSchema
];

// Determine what schematic the user provided
const mode = process.argv[process.argv.length - 1];
let schema = schematics.find(schema => schema.name === mode);

// Execute schema if found
if (schema) {
  executeSchematic(schema);
} else {
  console.error(
    'Could not find a schematic for the given mode!\n',
    'Please run the command with a proper mode, i.e.\n',
    'npm run g command'
  );
}

/**
 * Executes a schematic to generate a given project file
 * @param schematic 
 */
async function executeSchematic(schematic: Schematic) {
  console.log(`Generate schematic '${schematic.name}'`);

  let inputResults = [];

  // Get all schematic inputs
  for (let message of schematic.inputs) {
    const response = await prompts({
      type: 'text',
      name: 'value',
      message
    });

    inputResults.push(response.value);
  }

  // Newline to keep things tidy
  console.log('\n');

  // Trigger schematic pre-write callback
  let preWriteResponse = await schematic.preWrite(inputResults);

  if (typeof preWriteResponse === 'string') {
    // Ensure an extension exists in the path
    if (!path.extname(preWriteResponse).length) {
      schematic.postWrite('Schematic Error: Pre-write did not return a valid file!');
      return;
    }

    const fileDirectory = path.dirname(preWriteResponse);

    // Ensure destination path exists
    let directoryExists = await exists(fileDirectory);
    if (!directoryExists) {
      try {
        await asyncMkdirp(fileDirectory);
      } catch(e) {
        schematic.postWrite(`Write Error: Could not create directory ${fileDirectory}!`);
        return;
      }
    }

    // Write file
    await writeFile(preWriteResponse, schematic.template, 'utf8');

    // Complete
    schematic.postWrite();
  } else {
    // Error object was passed in pre-write
    schematic.postWrite(preWriteResponse);
  }
}
