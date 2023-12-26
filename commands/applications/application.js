const {
    PermissionFlagsBits, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle,
    ChannelType, EmbedBuilder, ModalBuilder, SlashCommandBuilder,
    StringSelectMenuBuilder, StringSelectMenuOptionBuilder, TextInputBuilder, TextInputStyle,
} = require('discord.js');
const { Users, Applications } = require('../../dbObjects.js');
const { Op } = require('sequelize');
const { appResultChannelId } = require('../../config.json');
const logger = require('../../logger.js');

async function getRandom() {
    const application_id = (Math.floor(Math.random() * 99999) + 100000).toString();
    const duplicates = await Applications.findAll({ where: { app_id: application_id } });
    if (duplicates.length == 0) {
        return application_id;
    }
    getRandom();
}

module.exports = {
    category: 'applications',
    buttonId: ['eventApplyButton'],
    modalId: ['eventAppModal'],
    data: new SlashCommandBuilder()
    .setName('application')
    .setDescription('Manage applications with this command')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addSubcommand(subcommand => subcommand.setName('send')
        .setDescription('Send the event application in the current channel')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel to send the application to')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true),
        )
        .addStringOption(option => option
            .setName('title')
            .setDescription('The title of this application')
            .setMaxLength(50)
            .setRequired(true),
        )
        .addStringOption(option => option
            .setName('desc')
            .setDescription('The description of this event.')
            .setMaxLength(1000),
        )
        .addAttachmentOption(option => option
            .setName('image')
            .setDescription('The image to display below the description'),
        ),
    )
    .addSubcommand(subcommand => subcommand.setName('end')
        .setDescription('End the application')
        .addChannelOption(option => option
            .setName('channel')
            .setDescription('The channel the application was sent in')
            .addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
            .setRequired(true),
        )
        .addStringOption(option => option
            .setName('message')
            .setDescription('The ID of the application message')
            .setRequired(true),
        ),
    )
    .addSubcommand(subcommand => subcommand.setName('view')
        .setDescription('View an application')
        .addStringOption(option => option
            .setName('application')
            .setDescription('The application to view')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    )
    .addSubcommand(subcommand => subcommand.setName('delete')
        .setDescription('Delete an application')
        .addStringOption(option => option
            .setName('application')
            .setDescription('The application to delete')
            .setRequired(true)
            .setAutocomplete(true),
        ),
    ),
    async autocomplete(interaction) {
        const focusedOption = interaction.options.getFocused(true);
        const apps = interaction.client.db.appCache;
        const choices = [];

        apps.forEach(a => choices.push(a));
        const filtered = choices.filter(choice => choice.app_id.includes(focusedOption.value));
        await interaction.respond(filtered.slice(0, 25).map(choice => ({ name: `${choice.app_id}: ${choice.app_name} by ${interaction.client.users.cache.get(choice.user_id).username}`, value: choice.app_id })));

    },
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let appId;
        switch (interaction.options.getSubcommand()) {
            case 'send': {
                const appChannel = interaction.options.getChannel('channel');
                const appTitle = interaction.options.getString('title');
                const appDesc = interaction.options.getString('desc') ?? 'Apply by clicking the button below!';
                const appImage = interaction.options.getAttachment('image') ?? null;
                // eslint-disable-next-line no-constant-condition
                const embImage = new AttachmentBuilder(appImage) ? appImage : null;

                const applyEmbed = new EmbedBuilder()
                .setColor('Aqua')
                .setTitle(appTitle)
                .setDescription(appDesc)
                .addFields(
                    { name: 'This application should take up to 10 minutes.', value: '\u200b' },
                    )
                .setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL() });

                let imageFile = [];
                if (embImage) {
                    applyEmbed.setImage(`attachment://${embImage.name}`);
                    imageFile = [embImage];
                }

                const applyButton = new ButtonBuilder()
                .setCustomId('applicationEventApply')
                .setLabel('Apply here!')
                .setEmoji('📝')
                .setStyle(ButtonStyle.Success);

                const applyRow = new ActionRowBuilder()
                .addComponents(applyButton);

                await appChannel.send({ embeds: [applyEmbed], files: imageFile, components: [applyRow] });
                await interaction.followUp({ content: `Application was sent to ${appChannel}` });
                break;
            }
            case 'end': {
                const appMessageChannel = interaction.options.getChannel('channel');
                const appMessageId = interaction.options.getString('message');
                const appMessage = await appMessageChannel.messages.fetch(appMessageId);
                const appEmbed = EmbedBuilder.from(appMessage.embeds[0]).setDescription('This application has closed!').setColor('Red').setFields().setImage();
                try {
                    await appMessage.edit({ embeds: [appEmbed], components: [], files: [] });
                }
                catch (error) {
                    logger.error(error);
                }
                await interaction.followUp({ content: `Ended the application for ${appEmbed.data.title} in ${appMessageChannel}`, ephemeral: true });
                break;
            }
            case 'view': {
                appId = interaction.options.getString('application');

                const app = interaction.client.db.appCache.get(appId);
                if (app) {
                    const target = await interaction.client.users.cache.get(app.user_id);
                    let color = 'Orange';
                    if (app.passed == true) {
                        color = 'Green';
                    }
                    if (app.passed == false) {
                        color = 'Red';
                    }

                    const appEmbed = new EmbedBuilder()
                    .setColor(color)
                    .setAuthor({ name: `${target.username} (${app.mc_name})`, iconURL: target.displayAvatarURL() })
                    .setTitle(app.app_name)
                    .setDescription(`Application ID: [${app.app_id}]`)
                    .setThumbnail(target.displayAvatarURL())
                    .addFields(
                        { name: 'What\'s your Minecraft name?', value: app.mc_name ? app.mc_name : '`none`' },
                        { name: 'Why do you want to join this event?', value: app.join_reason ? app.join_reason : '`none`' },
                        { name: 'Rule-breakers get banned. Understood?', value: app.rules_accept ? app.rules_accept : '`none`' },
                        { name: 'Available dates:', value: app.avail_dates ? app.avail_dates : '`none`' },
                    )
                    .setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL() })
                    .setTimestamp();

                    await interaction.followUp('Found the application!');
                    await interaction.channel.send({ embeds: [appEmbed] });
                }
                else {
                    await interaction.followUp({ content: `Could not find an application with ID [${appId}]` });
                }
                break;
            }
            case 'delete': {
                appId = interaction.options.getString('application');
                const appToDelete = await interaction.client.db.appCache.get(appId);
                const deletedId = appToDelete.user_id;
                await appToDelete.destroy();
                await interaction.followUp({ content: `Deleted ${interaction.client.users.cache.get(deletedId).username}'s application for ${appToDelete.app_name}`, ephemeral: true });
            }
            }
    },
    async onButton(interaction) {
        if (interaction.customId === 'applicationEventApply') {
            let user = await interaction.client.db.userCache.get(interaction.user.id);

            if (!user) {
                user = await Users.create({ user_id: interaction.user.id, event_blacklist: false });
                interaction.client.db.userCache.set(interaction.user.id, user);
            }
            if (user.event_blacklist) {
                return await interaction.reply({ content: 'You are currently blacklisted from joining events, so you cannot apply.', ephemeral: true });
            }

            const userApps = Applications.findAll({ where: { user_id: user.user_id, app_name: interaction.message.embeds[0].data.title } });
            if (userApps.length > 0) {
                const finishedApps = await Applications.findAll({ where: { user_id: user.user_id, app_name: interaction.message.embeds[0].data.title, finished: true } });
                if (finishedApps.length > 0) {
                    return await interaction.reply({ content: 'You already applied! You cannot send another application.', ephemeral: true });
                }
            }

            const app_id = await getRandom();
            const app = await Applications.create({ app_id: app_id, user_id: interaction.user.id, app_name: interaction.message.embeds[0].data.title, finished: false });
            interaction.client.db.appCache.set(app_id, app);


            const applyModal = new ModalBuilder()
            .setCustomId('applicationApplyModal')
            .setTitle('Event application');

            const appQuestion1 = new TextInputBuilder()
            .setCustomId('applicationQuestion1')
            .setLabel('What\'s your Minecraft name?')
            .setPlaceholder('_baget')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMinLength(4)
            .setMaxLength(25);

            const appQuestion2 = new TextInputBuilder()
            .setCustomId('applicationQuestion2')
            .setLabel('Why do you want to join this event?')
            .setPlaceholder('I want to participate because I like Minecraft events where you have to work together to survive.')
            .setRequired(true)
            .setStyle(TextInputStyle.Paragraph)
            .setMinLength(40)
            .setMaxLength(400);

            const appQuestion3 = new TextInputBuilder()
            .setCustomId('applicationQuestion3')
            .setLabel('Rule-breakers get banned. Understood?')
            .setPlaceholder('Yeah')
            .setRequired(true)
            .setStyle(TextInputStyle.Short)
            .setMaxLength(10);

            const actionRow1 = new ActionRowBuilder().addComponents(appQuestion1);
            const actionRow2 = new ActionRowBuilder().addComponents(appQuestion2);
            const actionRow3 = new ActionRowBuilder().addComponents(appQuestion3);

            applyModal.addComponents(actionRow1, actionRow2, actionRow3);

            await interaction.showModal(applyModal);
        }
        else if (interaction.customId === 'applicationDateSelect') {
            interaction.client.usersInfo.applications.get(interaction.user.id).a4 = interaction.values;
            interaction.message.components[0].components.forEach(component => component.data.disabled = true);
            interaction.message.components[1].components.forEach(component => component.data.disabled = false);
            await interaction.update({
                content: 'Do you want to submit your application? This cannot be undone.',
                components: interaction.message.components,
                ephemeral: true,
                fetchReply: true,
            });
        }
        else if (interaction.customId === 'applicationSubmitApp') {
            const userInfo = interaction.client.usersInfo.applications.get(interaction.user.id);
            console.log(userInfo);
            await confirmation.update({ content: 'Your application was submitted! Check your DM\'s for the ID.', components: [] });

            const allApps = await Applications.findAll({
                where: {
                    user_id: interaction.user.id,
                    app_name: interaction.message.embeds[0].data.title,
                    finished: false,
                },
            });
            await Applications.update({
                finished: true,
                mc_name: userInfo.a1,
                join_reason: userInfo.a2,
                rules_accept: userInfo.a3,
                avail_dates: userInfo.selection.toString(),
            }, {
                where:
                {
                    app_id: allApps[allApps.length - 1].app_id,
                    user_id: interaction.user.id,
                    app_name: interaction.message.embeds[0].data.title,
                    finished: false,
                },
            });
            const app = await Applications.findOne({ where: { app_id: allApps[allApps.length - 1].app_id } });
            if (allApps.length > 1) {
                await Applications.destroy({
                    where: {
                        user_id: interaction.user.id,
                        app_name: interaction.message.embeds[0].data.title,
                        finished: false,
                        [Op.not]: {
                            app_id: app.app_id,
                        },
                    },
                });
            }

            const eventAppEmbed = new EmbedBuilder()
            .setColor('Orange')
            .setAuthor({ name: `${interaction.member.displayName} (${a1})`, iconURL: interaction.member.displayAvatarURL() })
            .setTitle(interaction.message.embeds[0].data.title)
            .setDescription(`Application ID: [${app.app_id}]`)
            .setThumbnail(interaction.member.displayAvatarURL())
            .addFields(
                { name: 'What\'s your Minecraft name?', value: app.mc_name ? app.mc_name : '`none`' },
                { name: 'Why do you want to join this event?', value: app.join_reason ? app.join_reason : '`none`' },
                { name: 'Rule-breakers get banned. Understood?', value: app.rules_accept ? app.rules_accept : '`none`' },
                { name: 'Available dates:', value: app.avail_dates ? app.avail_dates : '`none`' },
            )
            .setFooter({ text: `Powered by ${interaction.client.user.username}`, iconURL: interaction.client.user.displayAvatarURL() })
            .setTimestamp();

            const acceptAppButton = new ButtonBuilder()
            .setCustomId('applicationAccept')
            .setLabel('Accept')
            .setStyle(ButtonStyle.Success);

            const denyAppButton = new ButtonBuilder()
            .setCustomId('applicationDeny')
            .setLabel('Deny')
            .setStyle(ButtonStyle.Danger);

            const appReviewRow = new ActionRowBuilder()
            .addComponents(denyAppButton, acceptAppButton);

            const channel = interaction.client.channels.cache.get(appResultChannelId);
            await channel.send({ embeds: [eventAppEmbed], components: [appReviewRow] });
            try {
                await interaction.user.send({ content: `Your application with ID [${app.app_id}] was submitted! Refer to this ID if you need to create a ticket about your application.` });
            }
            catch (error) {
                await confirmation.followUp({ content: `Could not send you a DM. App ID: [${app.app_id}]`, ephemeral: true });
            }
        }
        else if (interaction.customId === 'applicationCancelApp') {
            await Applications.destroy({ where: { user_id: interaction.user.id, finished: false } });
            await confirmation.update({ content: 'Select the dates that you are available on!', components: [dateRow, confirmRow] });
        }
        else if (interaction.customId === 'applicationAccept' || interaction.customId === 'applicationDeny') {
            await interaction.update({ fetchReply: true });
            const reviewEmbed = EmbedBuilder.from(interaction.message.embeds[0]);
            const appId = reviewEmbed.data.description.match(/\[(.*)\]/)[1];
            const app = await Applications.findOne({ where: { app_id: appId } });

            let appStatus = 'unknown status';
            if (interaction.customId === 'applicationAccept') {
                reviewEmbed.setColor('Green').setTitle(`Accepted - ${interaction.message.embeds[0].data.title}`).setFields();
                await Applications.update({ passed: true }, { where: { app_id: appId } });
                appStatus = 'accepted';

            }
            else if (interaction.customId === 'applicationDeny') {
                reviewEmbed.setColor('Red').setTitle(`Denied - ${interaction.message.embeds[0].data.title}`).setFields();
                await Applications.update({ passed: false }, { where: { app_id: appId } });
                appStatus = 'denied';
            }

            try {
                await interaction.client.users.send(app.user_id, `Your application (${interaction.message.embeds[0].data.title}) with ID [${app.app_id}] was ${appStatus}.`);
            }
            catch (error) {
                if (error.message == 'Cannot send messages to this user') {
                    reviewEmbed.setDescription(`${interaction.message.embeds[0].data.description}\nCould not DM user.`);
                }
                else {
                    console.log(error.message);
                }
            }
            await interaction.editReply({ embeds: [reviewEmbed], components: [] });
        }
    },
    async onModal(interaction) {
        if (interaction.customId === 'applicationApplyModal') {
            const a1 = interaction.fields.getTextInputValue('applicationQuestion1');
            const a2 = interaction.fields.getTextInputValue('applicationQuestion2');
            const a3 = interaction.fields.getTextInputValue('applicationQuestion3');
            interaction.client.usersInfo.applications.set(interaction.user.id, { a1: a1, a2: a2, a3: a3, a4: 'Nothing selected' });

            const dateSelect = new StringSelectMenuBuilder()
            .setCustomId('applicationDateSelect')
            .setPlaceholder('Select dates that you\'re available on!')
            .setMinValues(1)
            .setMaxValues(8)
            .addOptions(
                new StringSelectMenuOptionBuilder()
                .setLabel('Monday, August 21st')
                .setValue('MondayAug21'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Tuesday, August 22nd')
                .setValue('TuesdayAug22'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Wednesday, August 23rd')
                .setValue('WednesdayAug23'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Thurday, August 24th')
                .setValue('ThurdayAug24'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Friday, August 25th')
                .setValue('FridayAug25'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Saturday, August 26th')
                .setValue('SaturdayAug26'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Sunday, August 27th')
                .setValue('SundayAug27'),
                new StringSelectMenuOptionBuilder()
                .setLabel('Monday, August 28th')
                .setValue('MondayAug28'),
            );

            const appSubmit = new ButtonBuilder()
            .setCustomId('applicationSubmitApp')
            .setLabel('Submit')
            .setStyle(ButtonStyle.Success)
            .setDisabled(true);

            const appCancel = new ButtonBuilder()
            .setCustomId('applicationCancelApp')
            .setLabel('Cancel')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(true);

            const dateRow = new ActionRowBuilder()
            .addComponents(dateSelect);

            const confirmRow = new ActionRowBuilder()
            .addComponents(appCancel, appSubmit);

            await interaction.reply({
                content: 'Select the dates that you are available on!',
                components: [dateRow, confirmRow],
                ephemeral: true,
                fetchReply: true,
            });

        }
    },
};