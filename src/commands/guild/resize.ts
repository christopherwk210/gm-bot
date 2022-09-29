import {
	ContextMenuCommandBuilder,
	ApplicationCommandType,
	ModalBuilder,
	ActionRowBuilder,
	ModalActionRowComponentBuilder,
	TextInputBuilder,
	TextInputStyle,
	AttachmentBuilder
} from 'discord.js';

import { default as axios } from 'axios';
import execBuffer from 'exec-buffer';
import jimp from 'jimp';
import gifsicle from 'gifsicle';
import path from 'path';

const command = new ContextMenuCommandBuilder()
.setName('Resize')
.setType(ApplicationCommandType.Message);

const modal = new ModalBuilder()
.setCustomId('resize-modal')
.setTitle('Resize');

const factorRow = new ActionRowBuilder<ModalActionRowComponentBuilder>()
.addComponents(
	new TextInputBuilder()
	.setCustomId('resize-modal-factor')
	.setLabel('How much do you want to resize by?')
	.setStyle(TextInputStyle.Short)
	.setPlaceholder('2')
	.setValue('2')
	.setRequired(true)
	.setMinLength(1)
	.setMaxLength(4)
);

export const cmd: BotContextCommand = {
  command,
	execute: async interaction => {
		if (!!interaction.inGuild() || !interaction.guild) return;

		if (!interaction.isMessageContextMenuCommand()) return;
		let url = '';

		if (interaction.targetMessage.attachments.size > 0) {
			const attachment = interaction.targetMessage.attachments.first();
			if (attachment) url = attachment.url;
		}

		modal.setComponents(
			factorRow,
			new ActionRowBuilder<ModalActionRowComponentBuilder>()
			.addComponents(
				new TextInputBuilder()
				.setCustomId('resize-modal-image-url')
				.setLabel('Image URL')
				.setStyle(TextInputStyle.Short)
				.setValue(url)
				.setRequired(true)
			)
		);

		await interaction.showModal(modal);
	},
	modal: {
		ids: ['resize-modal'],
		execute: async interaction => {
			const factor = interaction.fields.getTextInputValue('resize-modal-factor');
			const parsedFactor = parseFloat(factor);
			if (isNaN(parsedFactor) || parsedFactor <= 0 || parsedFactor > 10) {
				await interaction.reply({
					content: 'Invalid input! You have to type a number >0 and <=10',
					ephemeral: true
				});
				return;
			}

			const url = interaction.fields.getTextInputValue('resize-modal-image-url');
			await interaction.deferReply();
			try {
				const attachment = await scaleImageToAttachment(url, parsedFactor);
				await interaction.editReply({
					content: `Image scaled by ${parsedFactor}x`,
					files: [attachment]
				});
			} catch (e) {
				console.error('Error resizing image:', e);
				await interaction.editReply({
					content: 'Something went wrong while resizing this image... Sorry!'
				});
			}
		}
	}
};

async function scaleImageToAttachment(url: string, scaleFactor: number) {
	const isGif = url.toLowerCase().endsWith('.gif');
	const buffer = await (isGif ? processGif : processImage)(url, scaleFactor);

	return new AttachmentBuilder(buffer, { name: path.basename(url) });
}

async function processImage(url: string, scaleFactor: number) {
	const jimpImage = await jimp.read(url);
	const buffer = await jimpImage.scale(scaleFactor, jimp.RESIZE_NEAREST_NEIGHBOR).getBufferAsync(jimp.MIME_PNG);
	return buffer;
}

async function processGif(url: string, scaleFactor: number) {
	const response = await axios.get(url, { responseType: 'arraybuffer' });
	const data: Buffer = response.data;
	if (!data || response.status !== 200 || !Buffer.isBuffer(data)) throw new Error('Could not fetch gif');

	const buffer: Buffer = await execBuffer({
		input: data,
		bin: gifsicle,
		args: [
			'--scale', String(scaleFactor),
			'--resize-method', 'box',
			'-o', execBuffer.output,
			execBuffer.input
		]
	});

	return buffer;
}
