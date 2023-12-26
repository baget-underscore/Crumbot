const { randomBytes } = require('crypto');
const { Collection, Events } = require('discord.js');
const logger = require('../logger');

/* 
This event handles commands that are ran.
It works based on the `name` property of commands, or the custom ID of the interaction received
A lot of commands use the custom ID to determine what function they should run
However some commands just do the same thing all the time, so they are ran without further custom ID specifics
Every interaction response also uses the error handler, the catchErrors() function
*/

// Function to handle errors
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
        // Slash commands or rightclick menu commands
        if (interaction.isChatInputCommand() || interaction.isContextMenuCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            
            // Check if command exists
            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            
            // Handle cooldown for command
            const { cooldowns } = interaction.client;

            // If no user cooldowns for this command are registered yet, add it to collection
            if (!cooldowns.has(command.data.name)) {
                cooldowns.set(command.data.name, new Collection());
            }

            // Get cooldown for command, else apply default cooldown
            const now = Date.now();
            const timestamps = cooldowns.get(command.data.name);
            const defaultCooldownDuration = 3;
            const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1000;

            // If user is in cooldown collection
            if (timestamps.has(interaction.user.id)) {
                const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

                // If user is on cooldown for this command
                if (now < expirationTime) {
                    const expiredTimestamp = Math.round(expirationTime / 1000);
                    return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again in <t:${expiredTimestamp}:R>`, ephemeral: true });
                }
            }

            // Reset cooldown for this user to duration
            timestamps.set(interaction.user.id, now);
            setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

            try {
                // Run the command if all checks were passed
                await command.execute(interaction);
            }
            catch (error) {
                // Catch errors that occur while running the command
                await catchErrors(interaction, command.data.name, error);
            }
        }
        // Button presses or dropdown menus
        else if (interaction.isButton() || interaction.isStringSelectMenu()) {
            // Get the custom ID of the interaction, use it to find function to run
            const command = interaction.client.commands.get(interaction.customId.match(/([^A-Z]*).*/)[1]); // RegEx separates words based on camelCase

            // Check if command exists
            if (!command) {
                logger.error(`No command for button/selectmenu with ID ${interaction.customId}`);
                return;
            }

            try {
                // Run command
                await command.onButton(interaction);
            }
            catch (error) {
                // Catch errors
                await catchErrors(interaction, command.data.name, error);
            }
        }
        // Modals
        else if (interaction.isModalSubmit()) {
            // Use ID to find function to run
            const command = interaction.client.commands.get(interaction.customId.match(/([^A-Z]*).*/)[1]); // RegEx separates words based on camelCase

            // Check command existence
            if (!command) {
                logger.error(`No command for modal with ID ${interaction.customId}`);
                return;
            }

            try {
                // Run command
                await command.onModal(interaction);
            }
            catch (error) {
                // Catch errors
                await catchErrors(interaction, command.data.name, error);
            }
        }
        // Autocomplete (for command arguments)
        else if (interaction.isAutocomplete()) {
            // Get command by name
            const command = interaction.client.commands.get(interaction.commandName);

            // Check if command exists
            if (!command) {
                logger.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                // Run autocomplete function for command
                await command.autocomplete(interaction);
            }
            catch (error) {
                // Catch errors
                await catchErrors(interaction, command.data.name, error);
            }
        }
    },
};