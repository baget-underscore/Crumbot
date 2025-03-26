const { Events } = require('discord.js');
const { deploy } = require('../deploy-commands');
const { query, queries } = require('../dbFunctions');
const fs = require('node:fs/promises');
const logger = require('../logger');

module.exports = {
    name: Events.GuildCreate,
    async execute(guild) {
        // Deploy commands to the guild on join
        deploy(guild.id);
        logger.info(`Joined guild: ${guild.name}`);
        await query(`CREATE DATABASE IF NOT EXISTS HA${guild.id}db;`);
        logger.info(`Created database: HA${guild.id}db`);
        await query(`USE HA${guild.id}db;`);
        const data = await fs.readFile('./assets/template.sql', { encoding: 'utf8' });
        await queries(data.split(';').filter(str => (str.length > 4)));
        logger.info('Created all tables for this guild.');
    },
};