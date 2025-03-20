import { writeFile, readFile, unlink } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { Message } from 'discord.js';
import { getTextChannel, parseCodeBlocks } from '@/misc/discord-utils.js';
import { projectRootPath } from '../data/environment.js';
import { config } from '@/data/config.js';

const goboDirectory = join(projectRootPath, 'gobo');
let goboExecutable = '';

switch (process.platform) {
  case 'win32':
    goboExecutable = join(goboDirectory, 'gobo.exe');
    break;
  case 'linux':
    goboExecutable = join(goboDirectory, 'gobo-ubuntu');
    break;
  case 'darwin':
    goboExecutable = join(goboDirectory, 'gobo-mac');
    break;
  default:
    console.warn('Warning: Gobo is not supported on this platform');
    break;
}

let fileIndex = 0;

export async function handleGMLCodeBlockMessages(message: Message<boolean>, allowAny = false) {
  if (goboExecutable === '') return;

  const lang = allowAny ? undefined : 'gobo';

  const codes: string[] = [];
  for (const { code } of parseCodeBlocks(message.content, lang)) codes.push(code);
  
  if (codes.length === 0) return;

  const results = await Promise.all(codes.map(code => new Promise(async resolve => {
    if (++fileIndex > 1000) fileIndex = 0;

    const filePath = join(goboDirectory, `code-${message.id}-${fileIndex}.gml`);
    const cleanup = async () => {
      await unlink(filePath).catch(() => null);
    };

    const writeResult = await writeFile(filePath, code).catch(() => null);
    if (writeResult === null) {
      resolve({ success: false, message: 'Failed to write file' });
      return;
    }

    const execResult = await (new Promise(resolve => {
      execFile(goboExecutable, [filePath], (error, stdout, stderr) => {
        if (error) {
          resolve({ success: false, message: error.message, exec: { stdout, stderr } });
          return;
        }
  
        resolve({ success: true, message: stdout,  exec: { stdout, stderr }  });
      });
    }) as Promise<{ success: boolean; message: string; exec: { stdout: string, stderr: string }; }>);
    if (!execResult.success) {
      await cleanup();
      resolve(execResult);
      return;
    }

    const { exec } = execResult;

    if (exec.stderr.startsWith('[')) {
      resolve({ success: false, message: `❌ [Error]\n\`\`\`\n${exec.stderr.split('\n').splice(1).join('\n')}\n\`\`\``, formattingError: true })
    } else {
      const readResult = await readFile(filePath, 'utf-8').catch(() => null);
      if (readResult === null) {
        resolve({ success: false, message: 'Failed to read file', exec });
        return;
      }
      
      await cleanup();
      resolve({ success: true, message: readResult, exec });
    }
  }) as Promise<{ success: boolean; message: string; exec?: any; formattingError?: boolean; }>));

  const outputCodes = results.filter(result => result.success).map(({ message }) => message);

  if (outputCodes.length > 0) {
    const codeConcats = outputCodes.map(outputCode => `\`\`\`gml\n${outputCode}\`\`\``);
    const outputMessage = codeConcats.join('\n');
  
    if (outputMessage.length < 2000) {
      await message.reply(outputMessage);
    } else {
      for (const codeConcat of codeConcats) {
        await message.reply(codeConcat);
      }
    }
  }

  let botTestingChannel;
  for (const result of results) {
    if (!result.success) {
      if (result.formattingError) {
        await message.reply(result.message);
      } else {
        if (!botTestingChannel) botTestingChannel = await getTextChannel(config.discordIds.channels.botChannel);
        if (botTestingChannel) {
          const message = `Gobo error encountered:\n\nstdout: ${result.exec.stdout}\nstderr: ${result.exec.stderr}\nerror: ${result.message}`;
          await botTestingChannel.send(message);
        }
      }
    }
  }
}