const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const logger = require('./logger');
const prompt = require('prompt-sync')();

const rest = new REST().setToken(token);

const commandId = prompt('Command ID for command to delete\n> ');

if (commandId) {
    rest.delete(Routes.applicationGuildCommand(clientId, guildId, commandId))
        .then(() => logger.info(`Successfully deleted guild command with ID ${commandId} from testing server`))
        .catch(logger.error);
    rest.delete(Routes.applicationCommand(clientId, commandId))
        .then(() => logger.info(`Successfully deleted global command with ID ${commandId}`))
        .catch(logger.error);
}
 else {
    logger.warn('You did not provide a command ID');
}
