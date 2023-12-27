const { AttachmentBuilder, EmbedBuilder, Events } = require('discord.js');
const logger = require('../logger');

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // If cooldown is 0, send advertisement embed and raise the cooldown
        if (message.client.advertCooldown === 0 && !(message.author.bot) && message.content.match(/wep|wawet|host|server/)) {
            const wepwaFile = new AttachmentBuilder('./assets/wepwawet-logo.png');
            const wepwaEmbed = new EmbedBuilder()
            .setColor('#E0C691')
            .setDescription('Do you want to host any type of server?\nClick [here](https://wepwawet.net/), and use code `ThePrestonSho` for 10% off!')
            .setImage('attachment://wepwawet-logo.png')
            .setFooter({ text: `Powered by ${message.client.user.username}`, iconURL: message.client.user.displayAvatarURL() })
            .setTimestamp(new Date());

            const adMsg = await message.channel.send({ embeds: [wepwaEmbed], files: [wepwaFile] });
            message.client.advertCooldown = 120;
            setTimeout(async () => {try {await adMsg.delete();} catch(e) {logger.warn(e);}}, 30_000);
        }
    },
};