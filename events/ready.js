const { Collection, Events } = require('discord.js');
const { Users, Applications } = require('../dbObjects.js');
const logger = require('../logger.js');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        client.db = {};

        client.db.userCache = new Collection();
        const storedUsers = await Users.findAll();
        storedUsers.forEach(u => client.db.userCache.set(u.user_id, u));
        logger.info(`Cached ${client.db.userCache.length} user(s)`);

        client.db.appCache = new Collection();
        const storedApps = await Applications.findAll();
        storedApps.forEach(u => client.db.appCache.set(u.app_id, u));
        logger.info(`Cached ${client.db.appCache.length} app(s)`);

        client.usersInfo = {};
        client.usersInfo.applications = new Collection();
        console.log(client.usersInfo);

        function descreaseCooldown() {
            if (client.advertCooldown > 0) {
                client.advertCooldown--;
            }
        }
        setInterval(descreaseCooldown, 1_000);

        logger.info(`Ready! Logged in as ${client.user.tag}`);
    },
};