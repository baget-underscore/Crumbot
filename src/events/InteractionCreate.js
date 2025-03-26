const { Collection, Events, InteractionType } = require('discord.js');
const logger = require('../logger');

/*
This event handles commands that are ran.
It works based on the `name` property of commands, or the custom ID of the interaction received
A lot of commands use the custom ID to determine what function they should run
However some commands just do the same thing all the time, so they are ran without further custom ID specifics
*/

async function runCommand(interaction, interactionType, regex) {
    let command;
    if (regex == true) {
        // Get the custom ID of the interaction, use it to find command to run
        // RegEx separates words based on camelCase
        command = interaction.client.commands.get(interaction.customId.match(/([^A-Z]*).*/)[1]);
    }
    else {
        command = interaction.client.commands.get(interaction.commandName);
    }

    // Check if command exists
    if (!command) {
        logger.error(`No command for ${interactionType} with ID ${interaction.customId}`);
        return;
    }

    if (interactionType === 'ChatInputCommand') {
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
    }

    try {
        // Run autocomplete function for command
        eval(`(async () => { await command.on${interactionType}(interaction) })()`);
    }
    catch (error) {
        // Catch errors
        await catchErrors(interaction, command.data.name, error);
    }
}

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
        interaction.client.interactions.set(interaction.id, interaction);
        switch (true) {
            case (interaction.type === InteractionType.ApplicationCommandAutocomplete): {
                await runCommand(interaction, 'Autocomplete');
                break;
            }
            case (interaction.isButton()): {
                await runCommand(interaction, 'Button', true);
                break;
            }
            case (interaction.isChatInputCommand()): {
                await runCommand(interaction, 'ChatInputCommand');
                break;
            }
            case (interaction.type === InteractionType.ModalSubmit): {
                await runCommand(interaction, 'ModalSubmit', true);
                break;
            }
            case (interaction.isChannelSelectMenu()):
            case (interaction.isMentionableSelectMenu()):
            case (interaction.isRoleSelectMenu()):
            case (interaction.isStringSelectMenu()):
            case (interaction.isUserSelectMenu()): {
                await runCommand(interaction, 'SelectMenu', true);
                break;
            }
            default: {
                logger.error(`No valid interaction type found for ${interaction}`);
            }
        }
    },
};