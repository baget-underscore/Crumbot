const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../../logger');
const { readdirSync } = require('fs');
const { ownerId } = require('../../config.js').dc;

module.exports = {
    data: new SlashCommandBuilder()
    .setName('reload')
    .setDescription('Reloads a command.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .addStringOption(option => option
        .setName('command')
        .setDescription('The command to reload.')
        .setRequired(true)
        .setAutocomplete(true)),
    async onAutocomplete(interaction) {
        const focusedValue = interaction.options.getFocused().toLowerCase();
        const filtered = [...interaction.client.commands.keys()].filter(commandName => commandName.includes(focusedValue));
        await interaction.respond(
            filtered.map(choice => ({ name: choice, value: choice })),
        );
    },
    async onChatInputCommand(interaction) {
        if (!(interaction.user.id === ownerId)) return await interaction.reply({ content: 'You do not have permission to use this.', ephemeral: true });
        const commandName = interaction.options.getString('command', true).toLowerCase();
        const command = interaction.client.commands.get(commandName);

        if (!command) {
            return interaction.reply({ content: `There is no command with name \`${commandName}\``, ephemeral: true });
        }

        delete require.cache[require.resolve(`../${command.category}/${command.data.name}.js`)];
        const subcommands = readdirSync(`./commands/${command.category}`).filter(fn => fn.startsWith(`_${command.data.name}__`) && fn.endsWith('.js'));
        for (const cmdpath in subcommands) {
            delete require.cache[require.resolve(cmdpath)];
        }

        try {
            interaction.client.commands.delete(command.data.name);
            const newCommand = require(`../${command.category}/${command.data.name}.js`);
            interaction.client.commands.set(newCommand.data.name, newCommand);
            await interaction.reply({ content: `Command \`${newCommand.data.name}\` has reloaded!`, ephemeral: true });
            logger.info(`${interaction.user.username} reloaded '${newCommand.data.name}'`);
        }
        catch (error) {
            console.error(error);
            await interaction.reply({ content: `There was an error while reloading command \`${command.data.name}\`:\n\`${error.message}\``, ephemeral: true });
        }
    },
};