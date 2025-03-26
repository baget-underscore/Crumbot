const { Events } = require('discord.js');
const { query } = require('../dbFunctions');
const logger = require('../logger');

module.exports = {
    name: Events.GuildDelete,
    async execute(guild) {
        logger.info(`Left guild: ${guild.name}`);
        await query(`DROP DATABASE IF EXISTS HA${guild.id}db;`);
        logger.info('Dropped database for this guild.');
    },
};