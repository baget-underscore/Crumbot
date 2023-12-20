/* eslint-disable no-shadow */
/* eslint-disable no-unused-vars */
const { ActionRowBuilder, ButtonBuilder, ChannelSelectMenuBuilder, ComponentType, ModalBuilder, SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');
const { Users, Panels } = require('../../dbObjects.js');
const logger = require('../../logger.js');

module.exports = {
    category: 'ticketing',
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('A few commands related to tickets')
        .addSubcommand(subcommand => subcommand.setName('settings').setDescription('The settings menu for your tickets'))
        .addSubcommandGroup(option => option.setName('panel').setDescription('Commands related to ticket panels!')
            .addSubcommand(subcommand => subcommand.setName('create').setDescription('Create a new ticket panel')
                .addStringOption(option => option.setName('name').setDescription('The panel to create').setRequired(true)),
            )
            .addSubcommand(subcommand => subcommand.setName('edit').setDescription('Edit an existing panel')
                .addStringOption(option => option.setName('name').setDescription('The panel to edit').setAutocomplete(true).setRequired(true)),
            )
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Delete an existing panel')
                .addStringOption(option => option.setName('name').setDescription('The panel to delete').setAutocomplete(true).setRequired(true)),
            )
            .addSubcommand(subcommand => subcommand.setName('send').setDescription('Send the panel in a channel')
                .addStringOption(option => option.setName('name').setDescription('The panel to send').setAutocomplete(true).setRequired(true))
                .addChannelOption(option => option.setName('channel').setDescription('The channel to send this panel in').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement).setRequired(true)),
            ),
        )
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async autocomplete(interaction) {
        const panels = await Panels.findAll();

        const focusedValue = interaction.options.getFocused();
        const filtered = panels.filter(panel => panel.name.includes(focusedValue));
        await interaction.respond(
            filtered.map(panel => ({ name: panel.name, value: panel.id })),
        );
    },
    async execute(interaction) {
        const subCmd = interaction.options.getSubcommand();
        let panelInfo;
        let panel;

        logger.info(`Cmd: ${subCmd}`);
        switch (subCmd) {
            case 'create':
            case 'edit':
            case 'delete':
                panelInfo = interaction.options.getString('name');
                panel = await Panels.findOne({ where: { id: panelInfo } });
                await interaction.reply(`${subCmd} panel with name \`${panel.name}\``);
                break;

            case 'send': {
                panelInfo = interaction.options.getString('name');
                const panelSendChannel = interaction.options.getChannel('channel');
                await interaction.reply(`${subCmd} panel with name \`${panelInfo}\` to ${panelSendChannel}`);
                break;
            }
            case 'settings':
                await interaction.reply('The settings command');
                break;
        }
    },
};