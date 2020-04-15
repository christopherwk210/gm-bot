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

/** How long a message should be allowed in a voice text channel before it is purged, in milliseconds */
export const voiceTextMessageTimeout = 1000 * 60 * 60 * 3;

/** Server-specific IDs */
export const serverIDs = {

  /** Channel IDs */
  channels: {
    helpChannelIDs: [
      '262836222089625602',
      '295210810823802882',
      '331106795378442240',
      '490232902110674964'
    ],
    dingusSecurityChannelID: '492767948155518976',
    botTestingChannelID: '417796218324910094',
    casualVoiceChannelID: '332567530025779200',
    coworkingVoiceChannelID: '262834612932182026',
    playinaGameVoiceChannelID: '295976186625130512',
    coworkingTextChannelID: '390555974953336832',
    casualTextChannelID: '275366765574225920'
  },

  /** Role IDs */
  roles: {
    subredditModsRoleID: '262843600730062849',
    duckyCodeRoleID: '262926334118985728',
    duckyHonouraryRoleID: '390437904859660290',
    duckyArtRoleID: '345222078577901569',
    duckyAudioRoleID: '398875444360904704',
    serverStaff: '324536542737727488',
    botContributerRoleID: '417797331409436682',
    birthdayRoleID: '381386952903098368',
    podcast: '517061681894129664'
  }
};
