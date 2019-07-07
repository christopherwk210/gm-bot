/** Determines if the bot should exit the process on an uncaught exception */
export const shouldDieOnException: boolean = true;

/** Determines if we should print stack traces on an uncaught expection */
export const shouldPrintStackTrace: boolean = false;

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

/** How long does birthday role last for, in milliseconds */
export const birthdayTimeout = 1000 * 60 * 60 * 24;

/** Default color to use for RichEmbed's */
export const defaultEmbedColor = 0x039D5B;

/** How many spam messages in a row constitute an immediate kick, in a given time period (see spamTimer) */
export const spamMessageCount = 3;

/** How many seconds to track spam messages for */
export const spamTimer = 30;

/** Server-specific IDs */
export const serverIDs = {

  /** Channel IDs */
  channels: {
    helpChannelIDs: [
      '476018443905138706',
      '492765138760368149'
    ],
    dingusSecurityChannelID: '492765261506805760',
    botTestingChannelID: '492765219500720138',
    casualVoiceChannelID: '448314059540922390',
    coworkingVoiceChannelID: '448315541862744075',
    playinaGameVoiceChannelID: '597490944052559905'
  },

  /** Role IDs */
  roles: {
    subredditModsRoleID: '597491401315581954',
    duckyCodeRoleID: '597491465664593920',
    duckyHonouraryRoleID: '597491498958716958',
    duckyArtRoleID: '597491542340403212',
    duckyAudioRoleID: '597491577971277826',
    serverStaff: '597491600544759839',
    botContributerRoleID: '597491637144256553',
    birthdayRoleID: '597491668693942301',
    podcast: '597491793105256459'
  }
};
