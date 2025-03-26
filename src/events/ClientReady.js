const { Events, Collection } = require('discord.js');
const { query } = require('../dbFunctions.js');
const repl = require('repl');
const logger = require('../logger.js');

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        // Decrease all cooldowns by 1, every second
        function descreaseCooldown() {
            if (client.advertCooldown > 0) {
                client.advertCooldown--;
            }
        }
        setInterval(descreaseCooldown, 1_000);

        client.interactions = new Collection();

        logger.info(`Ready! Logged in as ${client.user.tag}`);
        await sleep(1000);
        // Make client available in terminal
        const r = repl.start({ prompt: '> ', useGlobal: true });
        r.context.client = client;
        // Allow queries from terminal
        r.context.query = query;

        r.context.reload = function(commandName) {
            const command = client.commands.get(commandName);

            if (!command) {
                return logger.info(`There is no command with name \`${commandName}\``);
            }

            try {
                delete require.cache[require.resolve(`../commands/${command.category}/${command.data.name}.js`)];
            }
            catch {
                logger.info('Cache delete failed.');
            }

            try {
                client.commands.delete(command.data.name);
                const newCommand = require(`../commands/${command.category}/${command.data.name}.js`);
                client.commands.set(newCommand.data.name, newCommand);
                logger.info(`Console reloaded '${newCommand.data.name}'`);
            }
            catch (error) {
                console.error(error);
                logger.info(`There was an error while reloading command \`${command.data.name}\`:\n\`${error.message}\``);
            }
        };
    },
};