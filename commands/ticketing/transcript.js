const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'ticketing',
    data: new SlashCommandBuilder()
        .setName('transcript')
        .setDescription('Create transcript of this ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),
    async execute(interaction) {
        await interaction.reply('In development.');

    },
};