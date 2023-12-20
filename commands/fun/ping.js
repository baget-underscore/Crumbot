const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with pong!')
        .addBooleanOption(option =>
            option.setName('ephemeral')
                .setDescription('Whether the response is ephemeral or not')
                .setRequired(true)),
    category: 'fun',
    async execute(interaction) {
        const ephemerally = interaction.options.getBoolean('ephemeral');
        const old = await interaction.reply({ content: 'Pinging...', fetchReply: true, ephemeral: ephemerally });
        await interaction.editReply(`Ping is ${old.createdTimestamp - interaction.createdTimestamp}ms`);
    },
};