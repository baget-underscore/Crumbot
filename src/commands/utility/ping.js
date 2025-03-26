const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!'),
    category: 'utility',
    async onChatInputCommand(interaction) {
        const old = await interaction.reply({ content: 'Pinging...', fetchReply: true });
        await interaction.editReply(`Pong!\nTook \`${old.createdTimestamp - interaction.createdTimestamp}ms\``);
    },
};