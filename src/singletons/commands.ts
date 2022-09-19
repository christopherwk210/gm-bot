import { syncAllCommands, AppCommands } from '../command-management.js';

let commands: AppCommands | undefined;

export async function getCommands(): Promise<AppCommands> {
  if (commands) return Promise.resolve(commands);

  const syncResult = await syncAllCommands();
  if (!syncResult.data) throw syncResult.err;
  commands = syncResult.data!;
  return commands;
}
