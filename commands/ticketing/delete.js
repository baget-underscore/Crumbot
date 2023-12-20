const { PermissionFlagsBits, SlashCommandBuilder } = require('discord.js');

module.exports = {
    category: 'ticketing',
    data: new SlashCommandBuilder()
        .setName('delete')
        .setDescription('Delete this ticket')
        .setDefaultMemberPermissions(PermissionFlagsBits.MentionEveryone),
    async execute(interaction) {
        await interaction.reply('In development.');

    },
};