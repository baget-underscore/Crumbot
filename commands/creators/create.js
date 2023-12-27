/* eslint-disable no-unused-vars */
const {
    ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType,
    EmbedBuilder, MentionableSelectMenuBuilder, ModalBuilder, SlashCommandBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');
const logger = require('../../logger');
const emoji = require('../../emoji.json');

function defaultButtons() {
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
        interaction.channel.send({ content: `<a:waiting:${emoji[waiting]}> ${interaction.user} **reply** to this message with an image or image URL`, fetchReply: true })
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
                        const file = new AttachmentBuilder(attachment).attachment;
                        await reply.delete();
                        resolve([m, file]);
                    }
                    else {
                        await reply.edit({ content: `<a:error:${emoji[error]}> \`${attachment.name}\` is not an image, try again.` });
                    }
                }
                else if (m.content.match(/https:\/\/(.*)(png|jpg|jpeg)/)) {
                    const file = new AttachmentBuilder(m.content);
                    console.log(file);
                    await reply.delete();
                    resolve([m, file]);
                }
                else {
                    await reply.edit({ content: `<a:error:${emoji[error]}> \`${m.content}\` is not an image, try again.` });
                }
            });
        });
    });
}

module.exports = {
    category: 'creators',
    data: new SlashCommandBuilder()
    .setName('create')
    .setDescription('Create tools for your server')
    .addSubcommand(subcommand => subcommand
        .setName('application')
        .setDescription('Create a new application'))
    .addSubcommand(subcommand => subcommand
        .setName('embed')
        .setDescription('Create a new embed'))
    .addSubcommand(subcommand => subcommand
        .setName('rolemenu')
        .setDescription('Create a new role menu')),
    async execute(interaction) {
        let msgContent;
        const msgEmbeds = [];
        let msgComponents;
        const msgFiles = [];
        switch (interaction.options.getSubcommand()) {
            case 'application':
                break;

            case 'embed': {
                const embedImageName = 'embedImage.png';
                const embedThumbnailName = 'embedThumbnail.png';
                const image = new AttachmentBuilder(`./assets/${embedImageName}`);
                const thumbnail = new AttachmentBuilder(`./assets/${embedThumbnailName}`);
                const guildInvite = await interaction.guild.rulesChannel.createInvite({ maxAge: 120 });

                const embedEmbed = new EmbedBuilder()
                .setColor(interaction.member.roles.color.color)
                .setAuthor({ name: 'Author {user} (256 char) (optional URL)', iconURL: interaction.user.displayAvatarURL(), url: guildInvite.url })
                .setThumbnail(`attachment://${embedThumbnailName}`)
                .setURL(guildInvite.url)
                .setTitle('title can be 256 characters long (optional URL)')
                .setDescription(
`This is the description. It can be up to 4096 characters, it can contain mentions like ${interaction.user}, ${interaction.channel} or ${interaction.member.roles.highest}.
You can also insert timestamps: <t:${Math.floor(Date.now() / 1000)}>.
End a sentence with \`\\n\`
to start on the next line!`,
                )
                .addFields(
                    { name: 'Field name can be up to 256 characters long!', value: 'Field value which can be up to 1024 characters long!' },
                    { name: 'Inline field #1', value: 'It will be on', inline: true },
                    { name: 'Inline field #2', value: 'the same row!', inline: true },
                )
                .setImage(`attachment://${embedImageName}`)
                .setFooter({ text: `Powered by ${interaction.client.user.username} (not editable)`, iconURL: interaction.client.user.displayAvatarURL() })
                .setTimestamp(new Date());

                msgEmbeds.push(embedEmbed);
                msgFiles.push(image, thumbnail);


                const embedRows = defaultButtons();
                msgComponents = embedRows;

                break;
            }

            case 'rolemenu':

                break;
                }

        await interaction.reply({ content: msgContent, embeds: msgEmbeds, components: msgComponents, files: msgFiles, ephemeral: false });
    },
    async onButton(interaction) {
        switch (true) {
            case interaction.customId.startsWith('createEmbed'): {
                const cEmbedStr = interaction.customId.match(/createEmbed(.*)/)[1];

                const createEmbedBack = new ButtonBuilder()
                .setCustomId('createEmbedBack')
                .setLabel('Back')
                .setStyle(ButtonStyle.Danger);
                const back = new ActionRowBuilder().setComponents(createEmbedBack);

                switch (true) {
                    case cEmbedStr === 'Back': {
                        const createEmbedComponents = defaultButtons();
                        await interaction.update({ components: createEmbedComponents });
                        break;
                    }
                    case cEmbedStr.startsWith('Color'): {
                        const cEColorStr = cEmbedStr.match(/Color(.*)/)[1];
                        switch (true) {
                            case cEmbedStr === 'Color': {
                                    const colorPicker = new StringSelectMenuBuilder({
                                        customId: 'createEmbedColorPicker',
                                        placeholder: 'Choose a color!',
                                    });
                                    ['Grey', 'White', 'Yellow', 'Gold', 'Orange', 'Red', 'Purple', 'Navy', 'Blue', 'Blurple', 'Aqua', 'Green', 'Random'].forEach(
                                        color => {
                                            colorPicker.addOptions({ label: color, value: color, emoji: emoji[color] });
                                        });

                                    const colorPickerRow = new ActionRowBuilder().setComponents(colorPicker);

                                    await interaction.update({ components: [colorPickerRow, back] });
                                    break;
                                }
                            case cEColorStr === 'Picker': {
                                const colorEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setColor(interaction.values[0]);
                                await interaction.update({ embeds: [colorEmbed], files: interaction.message.attachments });
                                break;
                            }
                        }
                        break;
                    }
                    case cEmbedStr.startsWith('Timestamp'): {
                        const cETimestampStr = cEmbedStr.match(/Timestamp(.*)/)[1];
                        switch (true) {
                            case cEmbedStr === 'Timestamp': {
                                await interaction.update({ components: [createButtons('Embed', [ ['Enable', 'Disable'], cEmbedStr ]), back] });
                                break;
                            }
                            case cETimestampStr.endsWith('Enable'): {
                                const timestampEmbed = EmbedBuilder.from(interaction.message.embeds[0]).setTimestamp();
                                await interaction.update({ embeds: [timestampEmbed], files: interaction.message.attachments });
                                break;
                            }
                            case cETimestampStr.endsWith('Disable'): {
                                const timestampEmbed = EmbedBuilder.from(interaction.message.embeds[0]).toJSON();
                                timestampEmbed.timestamp = undefined;
                                await interaction.update({ embeds: [timestampEmbed], files: interaction.message.attachments });
                                break;
                            }
                        }
                        break;
                    }
                    case cEmbedStr.startsWith('Thumbnail'):
                    case cEmbedStr.startsWith('Image'): {
                        const cEImageStr = cEmbedStr.match(/(Image|Thumbnail)(.*)/)[2];
                        switch (true) {
                            case cEmbedStr === 'Image' || cEmbedStr === 'Thumbnail': {

                                await interaction.update({ components: [createButtons('Embed', [ ['Edit', 'Delete'], cEmbedStr ]), back] });
                                break;
                            }
                            case cEImageStr.endsWith('Edit'): {
                                await interaction.deferUpdate();
                                const [message, editImage] = await getImage(interaction);
                                const imageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                                if (cEmbedStr.startsWith('Thumbnail')) {
                                    imageEmbed.setThumbnail(`attachment://${editImage.name}`);
                                }
                                else {
                                    imageEmbed.setImage(`attachment://${editImage.name}`);
                                }
                                await interaction.editReply({ embeds: [imageEmbed], files: [editImage] });
                                await message.delete();
                                break;
                            }
                            case cEImageStr.endsWith('Delete'): {
                                const imageEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
                                if (cEmbedStr.startsWith('Thumbnail')) {
                                    imageEmbed.setThumbnail();
                                }
                                else {
                                    imageEmbed.setImage();
                                }
                                await interaction.update({ embeds: [imageEmbed], files: [] });
                                break;
                            }
                        }
                        break;
                    }
                    case cEmbedStr.startsWith('Author'): {
                        const cEAuthorStr = cEmbedStr.match(/Author(.*)/)[1];
                        switch (true) {
                            case cEmbedStr === 'Author': {
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
                                        await interaction.editReply({ embeds: [authorEmbed], files: interaction.message.attachments });
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
                                await interaction.update({ embeds: [authorEmbed], files: interaction.message.attachments });
                                break;
                            }
                        }
                        break;
                    }
                    case cEmbedStr.startsWith('Title'): {
                        console.log('Title');
                        break;
                    }
                    case cEmbedStr.startsWith('Description'): {
                        console.log('Description');
                        break;
                    }
                    case cEmbedStr.startsWith('URL'): {
                        console.log('URL');
                        break;
                    }
                    default: {
                        console.log(`No case found for ${cEmbedStr}`);
                    }

                }
            }
        }
    },
    async onModal(interaction) {
        switch (true) {
            case interaction.customId.startsWith('createEmbed'): {
                const cEmbedStr = interaction.customId.match(/createEmbed(.*)/)[1];
                switch (true) {
                    case cEmbedStr.startsWith('Author'): {
                        const cEAType = cEmbedStr.match(/AuthorModal(.*)/)[1];
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
                            await interaction.update({ embeds: [authorEmbed], files: interaction.message.attachments });
                        }
                        catch (error) {
                            if (error.message === 'Invalid Form Body') {
                                await interaction.reply('This is not a valid URL. Try something like `https://www.discord.com/`');
                            }
                        }
                        break;
                    }
                }
                break;
            }
        }
    },
};