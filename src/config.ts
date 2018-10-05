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

/** Server-specific channel IDs **/
export const botTestingChannelID = '417796218324910094';
export const dingusSecurityChannelID = '492767948155518976';
export const helpChannelIDs = ['262836222089625602',
                               '295210810823802882',
                               '331106795378442240',
                               '490232902110674964'];

export casualVoiceChannelID = '332567530025779200';
export coworkingVoiceChannelID = '262834612932182026';
export playinagameVoiceChannelID = '295976186625130512';


/*** Server-specific role IDs **/
export adminRoleID = '262835321694060547';
export subredditmodsRoleID = '262843600730062849';
export duckycodeRoleID = '262926334118985728';
export duckyhonouraryRoleID = '390437904859660290';
export duckyartRoleID = '345222078577901569';
export duckyaudioRoleID = '398875444360904704';

export voipRoleID = '275366872189370369';
export voiceactivityRoleID = '390434366125506560';
export voicealumniRoleID = '390563903085477888';

export botcontributerRoleID = '417797331409436682';
