const { AttachmentBuilder, EmbedBuilder, SlashCommandBuilder } = require('discord.js');
// const { createApplication } = require('./_create__application');
// const { createRolemenu } = require('./_create__rolemenu');

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
    async onChatInputCommand(interaction) {
        // eslint-disable-next-line prefer-const
        let msgContent = 'Nothing here yet!';
        const msgEmbeds = [];
        let msgComponents;
        const msgFiles = [];
        switch (interaction.options.getSubcommand()) {
            case 'application': {
                break;
            }

            case 'embed': {
                const { defaultEmbedButtons } = require('./_create__embed');

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


                const embedRows = defaultEmbedButtons();
                msgComponents = embedRows;

                break;
            }

            case 'rolemenu': {
                break;
            }
        }

        await interaction.reply({ content: msgContent, embeds: msgEmbeds, components: msgComponents, files: msgFiles, ephemeral: false });
    },
    async onButton(interaction) {
        switch (true) {
            case interaction.customId.startsWith('createEmbed'): {
                const { createEmbedOn } = require('./_create__embed');

                const cEmbedStr = interaction.customId.match(/createEmbed(.*)/)[1];
                await createEmbedOn('Button', interaction, cEmbedStr);
                break;
            }
        }
    },
    async onSelectMenu(interaction) {
        switch (true) {
            case interaction.customId.startsWith('createEmbed'): {
                const { createEmbedOn } = require('./_create__embed');

                const cEmbedStr = interaction.customId.match(/createEmbed(.*)/)[1];
                await createEmbedOn('SelectMenu', interaction, cEmbedStr);
                break;
            }
        }
    },
    async onModalSubmit(interaction) {
        switch (true) {
            case interaction.customId.startsWith('createEmbed'): {
                const { createEmbedOn } = require('./_create__embed');

                const cEmbedStr = interaction.customId.match(/createEmbed(.*)/)[1];
                await createEmbedOn('Modal', interaction, cEmbedStr);
                break;
            }
        }
    },
};