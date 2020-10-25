import { jsonService } from './json.service';
import * as stringSimilarity from 'string-similarity';

/**
 * Holds the Docs in memory and retrieves specific entries.
 */
class DocsService {
  /** These are our docs. */
  private docs: GmManual | undefined;

  constructor() {
    this.docs = undefined;
  }

  init() {
    this.docs = jsonService.files['gmlDocs'];
  }

  docsFindEntry(docWord: string): DocEntry | undefined {
    // Quick Exit
    if (this.docs === undefined) {
      return undefined;
    }

    try {
      // Check if it's a function first:
      const funcEntry: GmFunction | undefined = this.docs.functions[docWord];
      if (funcEntry !== undefined) {
        return {
          descriptor: DocType.Func,
          value: funcEntry
        };
      }

      // Check if it's a variable:
      const varEntry: GmVariable | undefined = this.docs.variables[docWord];
      if (varEntry !== undefined) {
        return {
          descriptor: DocType.Var,
          value: varEntry
        };
      }

      // Check if it's a variable:
      const constEntry: GmConstant | undefined = this.docs.constants[docWord];
      if (constEntry !== undefined) {
        return {
          descriptor: DocType.Const,
          value: constEntry
        };
      }
    } catch (err) {
      console.log(
        'There was an error parsing our gmlDocs file, even though it exists.'
      );
    }

    // Return undefined if we failed, and ping the Cog Whisperers
    // this.docsPingCogWhisperers(docWord);
    return undefined;
  }

  /**
   * Iterates over everything and calculates level distance score, returning
   * the n closest matches.
   * @param docWord The word to find a function entry for.
   */
  docsFindClosest(docWord: string, nClosest: number): DocList[] {
    let scores = [];

    const gatherScore = (docHolder: { [key: string]: { link: string } }) => {
      // collect scores from functions
      for (const entry in docHolder) {
        if (docHolder.hasOwnProperty(entry)) {
          let similarity = stringSimilarity.compareTwoStrings(docWord, entry);

          scores.push({
            name: entry,
            similarity,
            link: docHolder[entry].link
          });
        }
      }
    };

    // get our scores...
    gatherScore(this.docs.functions);
    gatherScore(this.docs.variables);
    gatherScore(this.docs.constants);

    // sort list
    scores.sort((a, b) => b.similarity - a.similarity);

    return scores.slice(0, nClosest);
  }
}

export let docService = new DocsService();

// Interfaces

/**
 * The entry we found. Simply a beautiful wrapper.
 */
export interface DocEntry {
  value: GmFunction | GmVariable | GmConstant;
  descriptor: DocType;
}

/**
 * The shorter you name each member, the faster the code runs, it's true
 */
export const enum DocType {
  Func,
  Var,
  Const
}

/**
 * Similarity list for closeness function
 */
interface DocList {
  name: string;
  similarity: number;
  link: string;
}

/**
 * This describes the saved DocFile we create.
 */
interface GmManual {
  functions: { [key: string]: GmFunction | undefined };
  variables: { [key: string]: GmVariable | undefined };
  constants: { [key: string]: GmConstant | undefined };
}

/**
 * Scraped Documentation Function information.
 */
export interface GmFunction {
  /// The name of the function
  name: string;

  /// The parameters of the function.
  parameters: GmFunctionParameter[];

  /// The count of the number of required parameters.
  requiredParameters: number;

  /// By `variadic`, we mean if the final parameter can take "infinite" arguments. Examples
  /// are `ds_list_add`, where users can invoke it as `ds_list_add(list, index, 1, 2, 3, 4 /* etc */);`
  isVariadic: boolean;

  /// The example given in the Manual.
  example: string;

  /// The description of what the function does.
  description: string;

  /// What the function returns.
  returns: string;

  /// The link to the webpage.
  link: string;
}

/**
 * A parameter and description from the manual. Parameters do not directly indicate if they are optional
 * or variadic -- instead, look at the function for that.
 */
export interface GmFunctionParameter {
  /**
   * The name of the parameter.
   */
  parameter: string;

  /**
   * A description of the parameter.
   */
  description: string;
}

/**
 * Scraped Documentation Variable information.
 */
export interface GmVariable {
  /**
   * The name of the variable.
   */
  name: string;

  /**
   * The example given in the Manual.
   */
  example: string;

  /**
   * The description of what the variable does.
   */
  description: string;

  /**
   * The type of the variable.
   */
  returns: string;

  /**
   * The link to the webpage.
   */
  link: string;
}

/**
 * A constant parsed from the GmManual.
 * Because parsing constants is difficult, none of these fields are guarenteed to be non-empty except
 * for name. Additionally, a constant might have more data than just a description -- if that is the case,
 * additional data will be noted in secondary_descriptors. As a consequence of this, if the `description`
 * is empty, then `secondary_descriptors` will also always be empty.
 */
export interface GmConstant {
  /**
   * The name of the constant
   */
  name: string;

  /**
   *  A description of the constant
   */
  description: string;

  /**
   * The link to the webpage.
   */
  link: string;

  /**
   * Additional descriptors present. Most of the time, this will be None, but can
   * have some Descriptors and Values present.
   */
  secondaryDescriptors?: { [key: string]: string };
}
