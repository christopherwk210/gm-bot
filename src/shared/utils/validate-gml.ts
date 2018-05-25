import { textService } from '../services/text.service';

// GMS1 function list
const gms1FunctionList = textService.files['gml-functions'];

// GMS2 exclusive function list
const gms2FunctionList = textService.files['gml2-functions'];

/**
 * Determine if a function is located in the given gml list
 * @param func Function name to check
 * @param list Function list to check
 */
export function validate(func: string, list: string) {
  // Set up for global searching
  let regex = new RegExp(func, 'g');
  let match;
  let matches = [];
  let found = false;

  // Get all positions
  // eslint-disable-next-line no-eq-null
  while ((match = regex.exec(list)) !== null) {
    matches.push(match.index);
  }

  // Find the valid match
  matches.some(pos => {
    if ((list[pos - 1] === ';') && (list[pos + func.length] === ';')) {
      // Find
      found = true;
      return true;
    }
  });

  // Return results
  return found;
}

/**
 * Determine if function is a valid GMS1 function
 * @param func Function name to check
 */
export function validateGMS1(func: string) {
  return validate(func, gms1FunctionList);
}

/**
 * Determine if function is a valid GMS2 function
 * @param func Function to check
 */
export function validateGMS2(func: string) {
  return this.gml(func, gms1FunctionList + gms2FunctionList);
}
