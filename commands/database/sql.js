const { SlashCommandBuilder } = require('discord.js');
const config = require('../../config.json');
const Sequelize = require('sequelize');
const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});
require('../../models/Applications.js')(sequelize, Sequelize.DataTypes);
require('../../models/Users.js')(sequelize, Sequelize.DataTypes);
require('../../models/Tickets.js')(sequelize, Sequelize.DataTypes);
require('../../models/TicketSettings.js')(sequelize, Sequelize.DataTypes);
require('../../models/Panels.js')(sequelize, Sequelize.DataTypes);

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
        if (!(interaction.user.id === config.ownerId)) return await interaction.reply({ content: 'You do not have permission to use this.', ephemeral: true });
        const input = interaction.options.getString('query');
        await interaction.deferReply();
        const res = await sequelize.query(input);
        const [result, meta] = res;
        meta.length;
        const formatted = [];
        const combineResults = [];
        const finalMessages = [];
        if (result) {
            result.forEach(obj => {
                formatted.splice(0, formatted.length);
                for (const [key, value] of Object.entries(obj)) {
                    formatted.push(`${key}: ${value}`);
                }
                if (combineResults.join('\n').length + formatted.join('    ').length <= 1980) {
                    combineResults.push(`${formatted.join('    ')}`);
                }
                else {
                    finalMessages.push(combineResults.join('\n'));
                    combineResults.splice(0, combineResults.length);
                }
            });
        }
        await interaction.editReply(`Query \`${input}\` returns:`);
        finalMessages.forEach(async message => await interaction.channel.send(`\`\`\`${message}\`\`\``));
        await interaction.channel.send(`Finished! It took ${finalMessages.length} messages to display your query.`);
    },
};