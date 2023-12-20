const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    cooldown: 5,
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Ban the selected member.')
        .addUserOption(option => option
            .setName('target')
            .setDescription('The member to ban')
            .setRequired(true))
        .addStringOption(option => option
            .setName('reason')
            .setDescription('The reason for banning this member'))
        .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
        .setDMPermission(false),
    category: 'moderation',
    async execute(interaction) {
        const target = interaction.options.getUser('target');
        const reason = interaction.options.getString('reason');
        if (target == interaction.user) {
            await interaction.reply({ content: 'You cannot ban yourself!', ephemeral: true });
        }
        else {
            const confirm = new ButtonBuilder()
                .setCustomId('confirm')
                .setLabel('Confirm ban')
                .setStyle(ButtonStyle.Danger);

            const cancel = new ButtonBuilder()
                .setCustomId('cancel')
                .setLabel('Cancel')
                .setStyle(ButtonStyle.Secondary);

            const row = new ActionRowBuilder()
                .addComponents(cancel, confirm);

            const response = await interaction.reply({
                content: `Are you sure you want to ban ${target} for reason: ${reason}?`,
                ephemeral: true,
                components: [row],
            });

            const collectorFilter = i => i.user.id === interaction.user.id;

            try {
                const confirmation = await response.awaitMessageComponent({ filter: collectorFilter, time: 60_000 });

                if (confirmation.customId === 'confirm') {
                    await interaction.guild.members.ban(target);
                    await confirmation.update({ content: `Banned ${target} for reason: ${reason}`, components: [] });
                }
                else if (confirmation.customId === 'cancel') {
                    await confirmation.update({ content: 'Action cancelled', components: [] });
                }

            }
            catch (e) {
                await interaction.editReply({ content: 'Confirmation not received within 1 minute, cancelling.', components: [] });
            }
        }
    },
};