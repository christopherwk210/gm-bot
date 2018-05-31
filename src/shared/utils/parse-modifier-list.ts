import { Message } from 'discord.js';
import { Type, ModifierOptions } from '..';

/**
 * Parses a modifier list against a discord message
 * @param modifierList List of modifier classes
 * @param msg Discord message to match against
 * @returns True if a modifier was matched and executed
 */
export function parseModifierList(modifierList: Type<any>[], msg: Message) {
  let modifierExecuted = false;
  let messageContent = msg.content;

  modifierList.some(Modifier => {
    let modifier = new Modifier();
    let rules: ModifierOptions = Modifier.prototype._rules;

    // Get all matched code block contents
    let codeBlocks = getModifierContent(messageContent, rules.match);

    // Skip on no match
    if (!codeBlocks) return false;

    // Ensure prevalidation passes if present
    if (modifier.pre && !modifier.pre(msg, codeBlocks, rules.match)) return true;

    // Execute order 66
    modifier.action(msg, codeBlocks, rules.match);

    // Delete message if needed
    if (rules.delete) msg.delete();

    // Short circuit on successful execution
    return modifierExecuted = true;
  });

  return modifierExecuted;
}

/**
 * Extracts all the code from any code blocks with the given language match
 * @param messageContent Text content of the message
 * @param match Code block language to match
 */
function getModifierContent(messageContent: string, match: string) {
  let regExps = constructModifierRegExp(match);
  let matches = messageContent.match(regExps.fullPattern);

  // No match found!
  if (!matches) return false;

  // Get just the content
  let codeBlocks = matches.map(matched => {
    matched = matched.replace(regExps.openingPattern, '');
    matched = matched.replace(regExps.closingPattern, '');
    return matched;
  });

  return codeBlocks;
}

/**
 * Construct code block modifier regular expressions with the given match string
 * @param match Code block language to match
 */
function constructModifierRegExp(match: string) {
  let openingPattern = `\`\`\`${match}[\\s]*(\\n|\\r)`;
  let closingPattern = `\`\`\``;
  let fullPattern = `${openingPattern}[\\s\\S]*?${closingPattern}`;

  return {
    /** Matches just the opening pattern to the code block */
    openingPattern: new RegExp(openingPattern),

    /** The full code block matching patter */
    fullPattern: new RegExp(fullPattern, 'g'),

    /** Matches just the closing pattern to a code block */
    closingPattern: new RegExp(closingPattern)
  };
}
