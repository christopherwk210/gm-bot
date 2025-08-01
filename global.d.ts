declare module 'exec-buffer';

/**
 * Wrapper for async functions that have the potential to throw.
 * Provides a cleaner API over the traditional try/catch block.
 * If err is defined, it's assumed the command failed.
 */
type AsyncWrap<T = any, E = any> = Promise<{
  data?: T;
  err?: E;
}>;

/**
 * Wrapper for async functions that have the potential to throw.
 * Provides a cleaner API over the traditional try/catch block.
 * If err is defined, it's assumed the command failed.
 * Data should be provided in both cases.
 */
type AsyncWrapF<T, E = any> = Promise<{
  data: T;
  err?: E;
}>;

type BotCommand = {
  command: (Partial<import('discord.js').SlashCommandBuilder> | Partial<import('discord.js').SlashCommandOptionsOnlyBuilder>) & { name: string };
  execute: (interaction: import('discord.js').ChatInputCommandInteraction<import('discord.js').CacheType>) => Promise<void>;
  autocomplete?: (interaction: import('discord.js').AutocompleteInteraction<import('discord.js').CacheType>) => Promise<void>;
  selectMenu?: {
    ids: string[];
    execute: (interaction: import('discord.js').SelectMenuInteraction<import('discord.js').CacheType>) => Promise<void>;
  };
  modal?: {
    ids: string[];
    execute: (interaction: import('discord.js').ModalSubmitInteraction<import('discord.js').CacheType>) => Promise<void>;
  };
  button?: {
    ids: string[];
    execute: (interaction: import('discord.js').ButtonInteraction<import('discord.js').CacheType>) => Promise<void>;
  };
};

type BotContextCommand = Omit<BotCommand, 'command' | 'execute'> & {
  command: Partial<import('discord.js').ContextMenuCommandBuilder> & { name: string };
  execute: (interaction: import('discord.js').MessageContextMenuCommandInteraction<import('discord.js').CacheType> | import('discord.js').UserContextMenuCommandInteraction<import('discord.js').CacheType>) => Promise<void>;
}
