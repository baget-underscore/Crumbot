const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
const { token } = require('./config.js').dc;
const logger = require('./logger');
const fs = require('node:fs');
const path = require('node:path');
const { deploy } = require('./deploy-commands');
// Client instance, can read messages and members
const client = new Client({ intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.MessageContent,
    ],
});

// Use Array of commands to create Collection
const commands = deploy();
client.commands = new Collection();
commands.forEach(command => client.commands.set(command.data.name, command));

// Command cooldown is specified in <command>.js file, on same level as data
client.cooldowns = new Collection();

// Add all events to the client event listener
const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
    const filePath = path.join(eventsPath, file);
    const event = require(filePath);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
    }
    else {
        client.on(event.name, (...args) => event.execute(...args));
    }
}

// Add error-catching events
client.on(Events.Debug, msg => logger.debug(msg));
client.on(Events.Warn, msg => logger.warn(msg));
client.on(Events.Error, msg => logger.error(msg));

// Login using the token from config
client.login(token);