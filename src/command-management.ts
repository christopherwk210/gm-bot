import { Routes, ApplicationCommand, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import { applicationId, token, projectRootPath } from './environment.js';
import { config } from './config.js';
import glob from 'glob';

type CommandScope = 'global' | 'guild';
type CommandCollection = Collection<string, BotCommand>;

// The same setup must be used for all requests, so might as well re-use
const restClient = () => new REST({ version: '10' }).setToken(token);

// Shared route constructions
const appGuildCommandsRoute = Routes.applicationGuildCommands(applicationId, config.discordIds.guildId);
const appCommandsRoute = Routes.applicationCommands(applicationId);

/**
 * Returns all of the absolute paths to each command JS file
 */
function getProjectCommandPaths(scope: CommandScope): AsyncWrapF<string[], Error> {
	return new Promise(resolve => {
		glob(`${projectRootPath}/commands/**/*.js`, { nosort: true }, (err, files) => {
			if (err !== null) return resolve({ err, data: [] });

			const filteredFiles = files.filter(file => file.includes(`/${scope}/`));
			resolve({ data: filteredFiles });
		});
	});
}

/**
 * Creates a collection of all project commands for the given scope
 */
async function createProjectCommandCollection(scope: CommandScope) {
	const { data } = await getProjectCommandPaths(scope);
	const commands = new Collection<string, BotCommand>();

	for (const filePath of data) {
		const module: BotCommand = await import(filePath);
		commands.set(module.command.name, module);
	}

	return commands;
}

/**
 * Puts all of the local commands of the given scope to the remote
 */
async function syncCommands(scope: CommandScope): AsyncWrap<CommandCollection> {
	const projectCommands = await createProjectCommandCollection(scope);
	const rest = restClient();
	const route = scope === 'guild' ? appGuildCommandsRoute : appCommandsRoute;

	try {
		const commands = projectCommands.toJSON().map(botCommand => botCommand.command);
		await rest.put(route, { body: commands }) as ApplicationCommand[];
		return { data: projectCommands };
	} catch (err) {
		return { err };
	}
}

/**
 * Puts all local commands of both scopes to the remote
 */
export async function syncAllCommands(): AsyncWrap<{ guild: CommandCollection, global: CommandCollection }> {
	const guildCommands = await syncCommands('guild');
	const globalCommands = await syncCommands('global');

	if (!guildCommands.data) return { err: guildCommands.err };
	if (!globalCommands.data) return { err: globalCommands.err };

	return {
		data: {
			guild: guildCommands.data,
			global: globalCommands.data
		}
	};
}
