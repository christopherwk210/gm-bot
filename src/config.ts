/** Determines if the bot should exit the process on an uncaught exception */
export const shouldDieOnException: boolean = false;

/** Server wide command prefix (Go ! or go home) */
export const prefix: string = '!';

/** Template options that include standard command defaults */
export const prefixedCommandRuleTemplate = {
  prefix,
  position: 0,
  exact: false,
  delete: true
};

/** Default color to use for RichEmbed's */
export const defaultEmbedColor = 0x039D5B;
