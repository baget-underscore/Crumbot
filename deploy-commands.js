const { REST, Routes } = require('discord.js');
const { clientId, guildId, token } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');
const logger = require('./logger');

module.exports = {
    async deploy() {
        const commands = [];
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    if ('name' in command.data && 'description' in command.data) {
                        commands.push(command.data.toJSON());
                    }
                    else {
                        logger.warn(`The command at ${filePath} is missing a required "name" or "description" property.`);
                    }
                }
                else {
                    logger.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            }
        }

        const rest = new REST().setToken(token);

        (async () => {
            try {
                logger.info(`Started refreshing ${commands.length} application (/) commands.`);

                const data = await rest.put(
                    Routes.applicationGuildCommands(clientId, guildId),
                    { body: commands },
                );

                logger.info(`Successfully reloaded ${data.length} application (/) commands with testing server.`);
            }
        catch (error) {
                logger.error(error);
            }
        })();
    },
}