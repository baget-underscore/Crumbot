const { Collection, Events } = require('discord.js');
const logger = require('../logger.js');
const repl = require('repl');
const { query } = require('../dbFunctions.js');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Read the database, write to client pool
        client.pool = {};
        for (const table of ['Users', 'Applications', 'Tickets']) {
            client.pool[table] = new Collection();
            let itemArray = await query(`SELECT * FROM ${table}`);
            itemArray.forEach((item) => client.pool[table].set(item.id, item));
        }
        
        // Decrease all cooldowns by 1, every second
        function descreaseCooldown() {
            if (client.advertCooldown > 0) {
                client.advertCooldown--;
            }
        }
        setInterval(descreaseCooldown, 1_000);
        
        logger.info(`Ready! Logged in as ${client.user.tag}`);
        await sleep(1000);
        const r = repl.start({ prompt: '>> ', useGlobal: true });
        r.context.client = client;
    },
};