const { SlashCommandBuilder } = require('discord.js');
const { ownerId } = require('../../config.js').dc;
const { query } = require('../../dbFunctions.js');
module.exports = {
    category: 'database',
    data: new SlashCommandBuilder()
    .setName('sql')
    .setDescription('Execute a SQL query.')
    .addStringOption(option => option
        .setName('query')
        .setDescription('The query to execute')
        .setRequired(true)),
    async execute(interaction) {
        if (!(interaction.user.id === ownerId)) return await interaction.reply({ content: 'You do not have permission to use this.', ephemeral: true });
        const input = interaction.options.getString('query');
        await interaction.reply(`Working...`);
        const result = await query(input);
        const messages = [];
        if (result) {
            let rowMsg = '';
            for (const row of result) {
                const rowStr = `\`\`\`js\n${JSON.stringify(row)}\n\`\`\``;
                if (rowMsg.length < 1980) {
                    rowMsg += rowStr;
                }
                else {
                    messages.push(rowMsg);
                    rowMsg = rowStr;
                }
            }
            messages.push(rowMsg);
        }
        await interaction.editReply(`Query \`${input}\` returns:`);
        messages.forEach(async (message) => await interaction.channel.send(message));
        await interaction.channel.send(`Finished! Found ${result.length} results.`);
    },
};