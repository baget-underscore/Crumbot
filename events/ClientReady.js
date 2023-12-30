const { Collection, Events } = require('discord.js');
const logger = require('../logger.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Read the database, put all tables in client variables
        client.db = {};

        client.db.userCache = new Collection();

        client.db.appCache = new Collection();

        // Decrease all cooldowns every 1 second
        function descreaseCooldown() {
            if (client.advertCooldown > 0) {
                client.advertCooldown--;
            }
        }
        setInterval(descreaseCooldown, 1_000);

        logger.info(`Ready! Logged in as ${client.user.tag}`);
    },
};