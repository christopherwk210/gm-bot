import { textService } from '../services/text.service';

// GMS1 function list
const gmlFuncRaw = textService.files['gml-functions'];

// GMS2 exclusive function list
const gml2FuncRaw = textService.files['gml2-functions'];

const gml = {
  /**
   * Determine if a function is located in the given gml list
   * @param func Function to check
   * @param list Function list to check
   */
  gml: function (func: string, list: string) {
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
  },
  /**
   * Determine if function is a valid GMS1 function
   * @param func Function to check
   */
  gms1: function (func: string) {
    return this.gml(func, gmlFuncRaw);
  },
  /**
   * Determine if function is a valid GMS2 function
   * @param func Function to check
   */
  gms2: function (func: string) {
    return this.gml(func, gmlFuncRaw + gml2FuncRaw);
  }
};

module.exports.gml = gml;
