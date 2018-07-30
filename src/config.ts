/** Determines if the bot should exit the process on an uncaught exception */
export const shouldDieOnException: boolean = true;

/** Server wide command prefix (Go ! or go home) */
export const prefix: string = '!';

/** Template options that include standard command defaults */
export const prefixedCommandRuleTemplate = {
  prefix,
  position: 0,
  exact: false,
  delete: true
};

/** How long to wait before considering a help channel no longer busy, in milliseconds */
export const helpChannelBusyTimeout = 1000 * 60 * 10;

/** Default color to use for RichEmbed's */
export const defaultEmbedColor = 0x039D5B;
