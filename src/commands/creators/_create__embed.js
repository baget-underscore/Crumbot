const {
    ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType,
    EmbedBuilder, ModalBuilder,
    StringSelectMenuBuilder, TextInputStyle,
} = require('discord.js');
const emoji = require('../../emoji.json');

function defaultEmbedButtons() {
    const FirstRow = new ActionRowBuilder();
    ['Color', 'Timestamp', 'Thumbnail', 'Image'].forEach(name => FirstRow.addComponents(new ButtonBuilder({ customId: `createEmbed${name}`, label: name, style: ButtonStyle.Secondary })));

    const SecondRow = new ActionRowBuilder();
    ['Author', 'Title', 'Description', 'URL'].forEach(name => SecondRow.addComponents(new ButtonBuilder({ customId: `createEmbed${name}`, label: name, style: ButtonStyle.Secondary })));

    const ThirdRow = new ActionRowBuilder().addComponents(new ButtonBuilder({ customId: 'createEmbedSave', label: 'Save', style: ButtonStyle.Success }));

    return [FirstRow, SecondRow, ThirdRow];
}

function createButtons(creator, buttons = []) {
    const parent = `create${creator}`;
    const rowComponents = [];
    const row = [];
    const prefixes = Array.isArray(buttons[0]) ? buttons[0] : [buttons[0]];
    const properties = Array.isArray(buttons[1]) ? buttons[1] : [buttons[1]];
    prefixes.forEach(prefix => {
        properties.forEach(property => {
            rowComponents.push(
                {
                    customId: `${parent}${property.replace('.', '')}${prefix}`,
                    label: `${prefix} ${property.toLowerCase().replace('.', ' ')}`,
                    style: ButtonStyle.Secondary,
                    type: ComponentType.Button,
                },
            );
        });
    });
    if (rowComponents.length > 5) {
        prefixes.forEach(prefix => {
            row.push(
                new ActionRowBuilder({ components: rowComponents.filter(button => button.label.startsWith(prefix)) }),
            );
        });
        return row;
    }
    else {
        rowComponents.forEach(button => row.push(button));
        return new ActionRowBuilder({ components: row });
    }
}

async function getImage(interaction) {
    return new Promise(resolve => {
        interaction.channel.send({ content: `<a:loading:${emoji['loading']}> ${interaction.user} **reply** <:reply:${emoji['reply']}> to this message with an image or image URL`, fetchReply: true })
        .then((reply) => {
            const collector = interaction.channel.createMessageCollector({
                filter: res => res.author.id === interaction.user.id && res.reference ? res.reference.messageId === reply.id : false,
                max: 1,
                time: 60_000,
            });

            collector.on('collect', async m => {
                const attachment = m.attachments.first();
                if (attachment) {
                    if (attachment.name.match(/png|jpg|jpeg/)) {
                        const url = new AttachmentBuilder(attachment).attachment;
                        await reply.delete();
                        console.log('From image file:');
                        console.log(url);
                        resolve([m, url]);
                    }
                    else {
                        await reply.edit({ content: `<:thdown:${emoji['thdown']}> \`${attachment.name}\` is not an image, try again.` });
                    }
                }
                else if (m.content.match(/https:\/\/(.*)(png|jpg|jpeg)/)) {
                    const url = new AttachmentBuilder(m.content).attachment;
                    await reply.delete();
                    console.log('From image link:');
                    console.log(url);
                    resolve([m, url]);
                }
                else {
                    await reply.edit({ content: `<:thdown:${emoji['thdown']}> \`${m.content}\` is not an image, try again.` });
                }
            });
        });
    });
}

async function createEmbedOnButton(interaction, customID) {
    const createEmbedBack = new ButtonBuilder()
    .setCustomId('createEmbedBack')
    .setLabel('Back')
    .setStyle(ButtonStyle.Danger);
    const back = new ActionRowBuilder().setComponents(createEmbedBack);

    switch (true) {
        case customID === 'Back': {
            const createEmbedComponents = defaultEmbedButtons();
            await interaction.update({ components: createEmbedComponents });
            break;
        }
        case (customID === 'Color'): {
            console.log(interaction.message.attachments);
            const colorPicker = new StringSelectMenuBuilder({
                customId: 'createEmbedColorPicker',
                placeholder: 'Choose a color!',
            });
            ['Grey', 'White', 'Yellow', 'Gold', 'Orange', 'Red', 'Purple', 'Navy', 'Blue', 'Blurple', 'Aqua', 'Green', 'Random'].forEach(
                color => {
                    colorPicker.addOptions({
                        label: color,
                        value: color,
                        emoji: {
                            animated: false,
                            id: emoji[color],
                            name: color,
                        },
                    });
                });

            const colorPickerRow = new ActionRowBuilder().setComponents(colorPicker);

            await interaction.update({ components: [colorPickerRow, back] });
            break;
        }
        case customID.startsWith('Timestamp'): {
            const cETimestampStr = customID.match(/Timestamp(.*)/)[1];
            switch (true) {
                case customID === 'Timestamp': {
                    await interaction.update({ components: [createButtons('Embed', [ ['Enable', 'Disable'], customID ]), back] });
                    break;
                }
                case cETimestampStr.endsWith('Enable'): {
                    const timestampEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setTimestamp();
                    await interaction.update({ embeds: [timestampEmbed] });
                    break;
                }
                case cETimestampStr.endsWith('Disable'): {
                    const timestampEmbed = EmbedBuilder.from(interaction.message.embeds[0]).toJSON();
                    timestampEmbed.timestamp = undefined;
                    await interaction.update({ embeds: [timestampEmbed] });
                    break;
                }
            }
            break;
        }
        case customID.startsWith('Thumbnail'):
        case customID.startsWith('Image'): {
            const cEImageStr = customID.match(/(Image|Thumbnail)(.*)/)[2];
            switch (true) {
                case customID === 'Image' || customID === 'Thumbnail': {

                    await interaction.update({ components: [createButtons('Embed', [ ['Edit', 'Delete'], customID ]), back] });
                    break;
                }
                case cEImageStr.endsWith('Edit'): {
                    await interaction.deferUpdate();
                    const [message, editImage] = await getImage(interaction);
                    const imageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                    if (customID.startsWith('Thumbnail')) {
                        imageEmbed.setThumbnail(`attachment://${editImage.name}`);
                    }
                    else {
                        imageEmbed.setImage(`attachment://${editImage.name}`);
                    }
                    await interaction.editReply({ embeds: [imageEmbed] });
                    await message.delete();
                    break;
                }
                case cEImageStr.endsWith('Delete'): {
                    const imageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                    if (customID.startsWith('Thumbnail')) {
                        imageEmbed.setThumbnail();
                    }
                    else {
                        imageEmbed.setImage();
                    }
                    console.log(interaction.message.attachments);
                    await interaction.update({ embeds: [imageEmbed] });
                    break;
                }
            }
            break;
        }
        case customID.startsWith('Author'): {
            const cEAuthorStr = customID.match(/Author(.*)/)[1];
            switch (true) {
                case customID === 'Author': {
                    await interaction.update({ components: [createButtons('Embed', [ ['Edit', 'Delete'], ['Author.', 'Author.Icon', 'Author.URL'] ]), back].flat() });
                    break;
                }
                case cEAuthorStr.endsWith('Edit'): {
                    const cEAChildStr = cEAuthorStr.match(/(.*)Edit/)[1];
                    switch (true) {
                        case cEAChildStr === '' || cEAChildStr === 'URL': {
                            const authorPrompt = new ModalBuilder()
                            .setTitle('Author')
                            .setCustomId(`createEmbedAuthorModal${cEAChildStr}`)
                            .setComponents(
                                new ActionRowBuilder({
                                    components: [
                                        {
                                            custom_id: 'createEmbedAuthorModalText',
                                            label: `Enter the ${(cEAChildStr === 'URL') ? 'URL' : 'Name'}`,
                                            placeholder: (cEAChildStr === 'URL') ? 'Type the URL.' : 'Type {name} for the username of the invoker.',
                                            style:(cEAChildStr === 'Icon' || cEAChildStr === 'URL') ? TextInputStyle.Paragraph : TextInputStyle.Short,
                                            type: ComponentType.TextInput,
                                        },
                                    ],
                                }),
                            );
                            await interaction.showModal(authorPrompt);
                            break;
                        }
                        case cEAChildStr === 'Icon': {
                            await interaction.deferUpdate();
                            const [message, editImage] = await getImage(interaction);
                            const authorEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                            authorEmbed.data.author.icon_url = editImage.url;
                            await message.delete();
                            await interaction.editReply({ embeds: [authorEmbed] });
                            break;
                        }
                    }
                    break;
                }
                case cEAuthorStr.endsWith('Delete'): {
                    const cEAChildStr = cEAuthorStr.match(/(.*)Delete/)[1];
                    const authorEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                    switch (true) {
                        case cEAChildStr === '':
                            authorEmbed.data.author ? authorEmbed.data.author.name = null : undefined;
                            break;
                        case cEAChildStr === 'Icon':
                            authorEmbed.data.author ? authorEmbed.data.author.icon_url = null : undefined;
                            break;
                        case cEAChildStr === 'URL':
                            authorEmbed.data.author ? authorEmbed.data.author.url = null : undefined;
                            break;
                    }
                    await interaction.update({ embeds: [authorEmbed] });
                    break;
                }
            }
            break;
        }
        case customID.startsWith('Title'): {
            console.log('Title');
            break;
        }
        case customID.startsWith('Description'): {
            console.log('Description');
            break;
        }
        case customID.startsWith('URL'): {
            console.log('URL');
            break;
        }
        default: {
            console.log(`No case found for ${customID}`);
        }
    }
}

async function createEmbedOnSelectMenu(interaction, customID) {
    switch (true) {
        case customID.startsWith('Color'): {
            const cEColorStr = customID.match(/Color(.*)/)[1];
            if (cEColorStr === 'Picker') {
                const colorEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setColor(interaction.values[0]);
                await interaction.update({ embeds: [colorEmbed] });
            }
            break;
        }
    }
}

async function createEmbedOnModal(interaction, customID) {
    switch (true) {
        case customID.startsWith('Author'): {
            const cEAType = customID.match(/AuthorModal(.*)/)[1];
            const cEAValue = interaction.fields.getTextInputValue('createEmbedAuthorModalText');
            const authorEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
            switch (true) {
                case cEAType === '': {
                    try {
                        authorEmbed.data.author.name = cEAValue.replace('{name}', interaction.user.username);
                    }
                    catch (error) {
                        if (error instanceof TypeError) {
                            authorEmbed.setAuthor({ name: cEAValue.replace('{name}', interaction.user.username) });
                        }
                    }
                    break;
                }
                case cEAType === 'URL': {
                    authorEmbed.data.author.url = cEAValue;
                }
            }
            try {
                await interaction.update({ embeds: [authorEmbed] });
            }
            catch (error) {
                if (error.message === 'Invalid Form Body') {
                    await interaction.reply('This is not a valid URL. Try something like `https://www.discord.com/`');
                }
            }
            break;
        }
    }
}

module.exports = {
    async createEmbedOn(type, interaction, customID) {
        interaction, customID;
        eval(`(async () => await createEmbedOn${type}(interaction, customID))()`);
    },
    defaultEmbedButtons, createButtons, getImage,
    createEmbedOnButton, createEmbedOnSelectMenu, createEmbedOnModal,
};