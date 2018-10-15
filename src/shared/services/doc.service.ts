import * as fs from 'fs';
import { jsonService } from './json.service';
import { TextChannel } from 'discord.js';
import { channelService } from './channel.service';
import { serverIDs } from '../../config';
import * as stringSimilarity from 'string-similarity';

/**
 * Holds the Docs in memory and retrieves specific entries.
 */
class DocsService {

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

    try {
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

    } catch (err) {
      console.log('There was an error parsing our gmlDocs file, even though it exists.');
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

    // collect scores from functions
    for (const thisFuncEntry of this.docs.functions) {
      let similarity = stringSimilarity.compareTwoStrings(docWord, thisFuncEntry.name);
      scores.push({name: thisFuncEntry.name, similarity, link: thisFuncEntry.link});
    }

    // collect scores from variables
    for (const thisVarEntry of this.docs.variables) {
      let similarity = stringSimilarity.compareTwoStrings(docWord, thisVarEntry.name);
      scores.push({name: thisVarEntry.name, similarity, link: thisVarEntry.link});
    }

    // sort list
    scores.sort((a, b) => b.similarity - a.similarity);

    return scores.slice(0, nClosest);
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
    const botTestingChannel: TextChannel = <any>channelService.getChannelByID(serverIDs.channels.botTestingChannelID);
    if (botTestingChannel) botTestingChannel.send(errorMessage);
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
interface DocFile {
  functions: DocFunction[];
  variables: DocVariable[];
}

/**
 * Scraped Documentation Function information.
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
 * Scraped Documentation Variable information.
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
 * Scraped Documentation Parameter information.
 */
interface DocParams {
  label: string;
  documentation: string;
}
/**
 * Scraped Documentation Example information.
 */
interface DocExample {
  code: string;
  description: string;
}
