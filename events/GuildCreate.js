const { Events } = require('discord.js');
const { deploy } = require('../deploy-commands');
const logger = require('../logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        deploy(guild.id);
        logger.info(`Joined guild: ${guild.name}`);
    },
}