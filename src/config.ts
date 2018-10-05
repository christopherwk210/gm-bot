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

class ServerIDs {
  /* tslint:disable */
  public botTestingChannelID = '417796218324910094';
  public dingusSecurityChannelID = '492767948155518976';
  public helpChannelIDs = ['262836222089625602',
                          '295210810823802882',
                          '331106795378442240',
                          '490232902110674964'];
  public casualVoiceChannelID = '332567530025779200';
  public coworkingVoiceChannelID = '262834612932182026';
  public playinagameVoiceChannelID = '295976186625130512';
  /*** Server-specific role IDs **/
  public adminRoleID = '262835321694060547';
  public subredditmodsRoleID = '262843600730062849';
  public duckycodeRoleID = '262926334118985728';
  public duckyhonouraryRoleID = '390437904859660290';
  public duckyartRoleID = '345222078577901569';
  public duckyaudioRoleID = '398875444360904704';
  
  public voipRoleID = '275366872189370369';
  public voiceactivityRoleID = '390434366125506560';
  public voicealumniRoleID = '390563903085477888';
  
  public botcontributerRoleID = '417797331409436682';
  /* tslint:enable */
}

export let serverIDs = new ServerIDs();
