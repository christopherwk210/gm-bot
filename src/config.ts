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

/** Server-specific channel IDs */

export const serverIDs = {
  /** Server-specific channel IDs */
  botTestingChannelID: '417796218324910094',
  dingusSecurityChannelID: '492767948155518976',
  helpChannelIDs: ['262836222089625602',
                    '295210810823802882',
                    '331106795378442240',
                    '490232902110674964'],
   casualVoiceChannelID: '332567530025779200',
   coworkingVoiceChannelID: '262834612932182026',
   playinagameVoiceChannelID: '295976186625130512',
  /** Server-specific role IDs */
  adminRoleID: '262835321694060547',
  subredditmodsRoleID: '262843600730062849',
  duckycodeRoleID: '262926334118985728',
  duckyhonouraryRoleID: '390437904859660290',
  duckyartRoleID: '345222078577901569',
  duckyaudioRoleID: '398875444360904704',
  /** VOIP IDs */
  voipRoleID: '275366872189370369',
  voiceactivityRoleID: '390434366125506560',
  voicealumniRoleID: '390563903085477888',
  /** Bot Contributor ID */
  botcontributerRoleID: '417797331409436682'
};
