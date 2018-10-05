import * as fs from 'fs';
import { jsonService } from './json.service';
import { TextChannel } from 'discord.js';
import { channelService } from './channel.service';

/**
 * Holds the Docs in memory and retrieves specific entries.
 */
class DocsService {

  // Allow for activation and deactivation of doc logging.
  // tslint:disable-next-line
  public currentlyLogging = false;

  /** These are our docs. */
  private docs: DocFile | undefined;

  constructor() {
    this.docs = undefined;
  }

  init() {
    this.docs = jsonService.files['gmlDocs'];
  }

  docsFindEntry(docWord: string): FuncResult | VarResult | undefined {
    // Quick Exit
    if (this.docs === undefined) {
      return undefined;
    }

    // Check if it's a function first:
    const funcEntry = this.docsFindFunction(docWord);
    if (funcEntry) {
      return {
        entry: funcEntry,
        type: 'function'
      };
    }

    // Check if it's a variable first:
    const varEntry = this.docsFindVariable(docWord);
    if (varEntry) {
      return {
        entry: varEntry,
        type: 'variable'
      };
    }

    // Return undefined if we failed, and ping the Cog Whisperers
    this.docsPingCogWhisperers(docWord);
    return undefined;
  }

  /**
   * Iterates over the Functions from a GML Documentation JSON.
   * @param docWord The word to find a function entry for.
   */
  private docsFindFunction(docWord: string): DocFunction | undefined {
    // Iterate on Functions with the DocWord
    for (const thisFuncEntry of this.docs.functions) {
      if (thisFuncEntry.name === docWord) {
        return thisFuncEntry;
      }
    }

    return undefined;
  }

  /**
   * Iterates over the Variables from a GML Documentation JSON.
   * @param docWord The word to find a variable entry for.
   */
  private docsFindVariable(docWord: string): DocVariable | undefined {
    // Iterate on Variables with the DocWord
    for (const thisVarEntry of this.docs.variables) {
      if (thisVarEntry.name === docWord) {
        return thisVarEntry;
      }
    }

    return undefined;
  }

  /**
   * Pings the Cog Whisperers if we failed but were invoked. This is temporary as
   * the new Service is implemented.  
   */
  private docsPingCogWhisperers(errorWord: string) {
    const errorMessage = `GMBot's new doc service was invoked succesfully but failed to find:\n\`\`\`${errorWord}\`\`\``;
    // Send error to the bot testing channel
    if (this.currentlyLogging) {
      const botTestingChannel: TextChannel = <any>channelService.getChannelByID('417796218324910094');
      if (botTestingChannel) botTestingChannel.send(errorMessage);
    }
  }
}

export let docService = new DocsService();

// Interfaces

interface FuncResult {
  entry: DocFunction;
  type: 'function';
}

interface VarResult {
  entry: DocVariable;
  type: 'variable';
}

/**
 * This describes the saved DocFile we create.
 */
interface DocFile {
  functions: DocFunction[];
  variables: DocVariable[];
}

/**
 * Scrapped Documentation Function information.
 */
interface DocFunction {
  name: string;
  signature: string;
  parameters: DocParams[];
  minParameters: number;
  maxParameters: number;
  example: DocExample;
  documentation: string;
  return: string;
  link: string;
  doNotAutoComplete?: boolean;
}
/**
 * Scrapped Documentation Variable information.
 */
interface DocVariable {
  name: string;
  example: DocExample;
  documentation: string;
  type: string;
  link: string;
  object: string;
  doNotAutoComplete?: boolean;
}

/**
 * Scrapped Documentation Parameter information.
 */
interface DocParams {
  label: string;
  documentation: string;
}
/**
 * Scrapped Documentation Example information.
 */
interface DocExample {
  code: string;
  description: string;
}
