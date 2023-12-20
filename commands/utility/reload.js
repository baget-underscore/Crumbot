const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../logger');
const config = require('../../config.json');
const fs = require('node:fs');
const path = require('node:path');

const choices = [];
const foldersPath = path.join(__dirname, '/../../commands');
const commandFolders = fs.readdirSync(foldersPath);


module.exports = {
    data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option =>
        option.setName('command')
        .setDescription('The command to reload.')
        .setRequired(true)
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if (command.data.name !== 'reload' && !choices.includes(command.data.name)) {
                    choices.push(command.data.name);
                }
            }
        }

        const focusedValue = interaction.options.getFocused();
        const filtered = choices.filter(choice => choice.includes(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );

    },
    async execute(interaction) {
        if (!(interaction.user.id === config.ownerId)) return await interaction.reply({ content: 'You do not have permission to use this.', ephemeral: true });
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({ content: `There is no command with name \`${commandName}\``, ephemeral: true });
        }

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({ content: `Command \`${newCommand.data.name}\` was reloaded!`, ephemeral: true });
            logger.info(`${interaction.user.username} reloaded '${newCommand.data.name}'`);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: `There was an error while reloading command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral: true });
        }
    },
};