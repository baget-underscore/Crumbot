const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Delete messages in the current channel')
        .addIntegerOption(option => option
            .setName('amount')
            .setDescription('Amount of messages to delete')
            .setRequired(true)
        )
        .addNumberOption(option => option
            .setName('before')
            .setDescription('Delete before a this message (ID)')
            .setRequired(false)
        )
        .addNumberOption(option => option
            .setName('after')
            .setDescription('Delete after this message (ID)')
            .setRequired(false)
        )
        .addUserOption(option => option
            .setName('user')
            .setDescription('Only delete messages from this user')
            .setRequired(false)
        ),
    async execute(interaction) {
        const amount = interaction.options.getInteger('amount');
        const before = interaction.options.getNumber('before');
        const after = interaction.options.getNumber('after');
        const user = interaction.options.getUser('user');
        
        if (before && after) {
            return await interaction.reply({ content: 'You cannot use `before` and `after` at the same time!', ephemeral: true });
        }

        const bMsg = await interaction.channel.messages.fetch(before);
        const aMsg = await interaction.channel.messages.fetch(after);
    },
}