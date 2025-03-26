const { REST, Routes } = require('discord.js');
const { clientId, testGuildId, token } = require('./config.js').dc;
const fs = require('node:fs');
const path = require('node:path');
const logger = require('./logger');

module.exports = {
    deploy(guild = testGuildId) {
        const commands = [];
        const foldersPath = path.join(__dirname, 'commands');
        const commandFolders = fs.readdirSync(foldersPath);

        for (const folder of commandFolders) {
            const commandsPath = path.join(foldersPath, folder);
            const commandFiles = fs.readdirSync(commandsPath).filter(file => !(file.startsWith('_')) && file.endsWith('.js'));
            for (const file of commandFiles) {
                const filePath = path.join(commandsPath, file);
                const command = require(filePath);
                switch (true) {
                    case (!('data' in command)): {
                        logger.warn(`The command at ${filePath} is missing a required "data" property.`);
                        break;
                    }
                    case (!('name' in command.data)): {
                        logger.warn(`The SlashCommandBuilder at ${filePath} is missing a required "name" property.`);
                        break;
                    }
                    case (!('description' in command.data)): {
                        logger.warn(`The SlashCommandBuilder at ${filePath} is missing a required "description" property.`);
                        break;
                    }
                    default: commands.push(command);
                }
            }
        }

        const rest = new REST().setToken(token);

        (async (g) => {
            try {
                const commandsJson = [];
                commands.forEach(command => commandsJson.push(command.data.toJSON()));
                logger.info(`Started refreshing ${commands.length} application (/) commands.`);

                const data = await rest.put(
                    Routes.applicationGuildCommands(clientId, g),
                    { body: commandsJson },
                );

                logger.info(`Successfully reloaded ${data.length} application (/) commands with provided guild.`);
            }
        catch (error) {
                logger.error(error);
            }
        })(guild);
        return commands;
    },
};