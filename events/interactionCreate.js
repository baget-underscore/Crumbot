const { Collection, Events } = require('discord.js');
const logger = require('../logger');


async function catchErrors(interaction, cmdName, err) {
    logger.error(`Error executing ${cmdName}: ${err.message}`);
    console.error(err);
    const errRes = { content: 'There was an error when you tried this!', ephemeral: true };
    if (interaction.replied || interaction.deferred) {
        await interaction.followUp(errRes);
    }
    else {
        await interaction.reply(errRes);
    }
}

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            const { cooldowns } = interaction.client;

            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again in <t:${expiredTimestamp}:R>`, ephemeral: true });
                }
            }

            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                await command.execute(interaction);
            }
            catch (error) {
                await catchErrors(interaction, command.data.name, error);
            }
        }
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            const command = interaction.client.commands.get(interaction.customId.match(/([^A-Z]*).*/)[1]);
            if (!command) {
                logger.error(`No command for button/selectmenu with ID ${interaction.customId}`);
                return;
            }

            try {
                await command.onButton(interaction);
            }
            catch (error) {
                await catchErrors(interaction, command.data.name, error);
            }
        }
        else if (interaction.isModalSubmit()) {
            const command = interaction.client.commands.get(interaction.customId.match(/([^A-Z]*).*/)[1]);
            if (!command) {
                logger.error(`No command for modal with ID ${interaction.customId}`);
                return;
            }

            try {
                await command.onModal(interaction);
            }
            catch (error) {
                await catchErrors(interaction, command.data.name, error);
            }
        }
        else if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);

            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.autocomplete(interaction);
            }
            catch (error) {
                await catchErrors(interaction, command.data.name, error);
            }
        }
    },
};