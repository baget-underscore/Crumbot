const { Events } = require('discord.js');
const { deploy } = require('../deploy-commands');
const logger = require('../logger');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        logger.info(`Left guild: ${guild.name}`);
    },
}