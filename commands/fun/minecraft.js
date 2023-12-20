const { ActionRowBuilder, ModalBuilder, SlashCommandBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js');
const { Rcon } = require('rcon-ts');
const { ip, port, passw } = require('../../config.json');

module.exports = {
    cooldown: 5,
    category: 'fun',
    modalId: ['mineraftCommandModal'],
    data: new SlashCommandBuilder()
    .setName('minecraft')
    .setDescription('Execute a command on the Minecraft server.')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),
    async execute(interaction) {
        const commandModal = new ModalBuilder()
        .setCustomId('mineraftCommandModal')
        .setTitle('Command');

        const commandInput = new TextInputBuilder()
        .setCustomId('commandTextInput')
        .setLabel('Command to run:')
        .setPlaceholder('title @a title "Hi there"')
        .setStyle(TextInputStyle.Paragraph)
        .setMinLength(1)
        .setMaxLength(500);

        const commandRow = new ActionRowBuilder()
        .addComponents(commandInput);

        commandModal.addComponents(commandRow);

        await interaction.showModal(commandModal);
    },
    async onModal(interaction) {
        const commandText = interaction.fields.getTextInputValue('commandTextInput');
        await interaction.deferReply();

        try {
            const rcon = new Rcon({
                host: ip,
                port: port,
                password: passw,
                timeout: 5000,
            });

            rcon.session(
                async c => {
                let res = await c.send(commandText);
                if (res == '') {
                    res = 'Command did not return output';
                }
                await interaction.editReply(`Command \`${commandText}\` returned the following result:\n\`\`\`\n${res}\n\`\`\``);
                },
            );
        }
        catch (e) {
            await interaction.editReply(`Error occured: ${e}`);
        }
    },
};