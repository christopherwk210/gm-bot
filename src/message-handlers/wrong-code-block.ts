import { Message } from 'discord.js';

const match = `(?<!\\S)('''|´´´)([^'´]|[^'´][\\s\\S]*?[^'´])\\1(?!\\S)`;
export async function handleWrongCodeBlockMessages(message: Message<boolean>) {
  if (!message.content.match(new RegExp(match, 'g'))) return;
  let formatted = message.content.replace(new RegExp(match, 'g'), '```js\n$2```');

  // prevent pings
  formatted = formatted.replace(/(@everyone)/g, '@ everyone');
  formatted = formatted.replace(/(@here)/g, '@ here');

  const messageContent = `Hey! You tried formatting your code with \`\`'''\`\` or \`\`´´´\`\`, ` +
  `however the correct symbol is the backtick: \`\` \`\`\` \`\`. Here is your message formatted properly:\n\n${formatted}`;

  const isMessageTooLong = messageContent.length > 2000;

  if (isMessageTooLong) {
    await message.reply({
      content: `Hey! You tried formatting your code with \`\`'''\`\` or \`\`´´´\`\`, ` +
        `however the correct symbol is the backtick: \`\` \`\`\` \`\`. Hope that helps!`
    });
  } else {
    await message.reply({ content: messageContent });
  }
}
