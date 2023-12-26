const { ChannelType, Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (oldState.channelId === newState.channelId) {
        }
        else if (oldState.channelId == null) {
            if (newState.channel.name === "Join to create vc") {
                const newRoom = await newState.guild.channels.create({
                    name: `${newState.member.displayName}'s room`,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel.parent
                });
                await newState.setChannel(newRoom);
            }
        }
        else if (newState.channelId == null) {
            if (oldState.channel.members.size == 0 && oldState.channel.name.endsWith('\'s room')) {
                await oldState.channel.delete();
            }
        }
        else if (oldState.channelId !== newState.channelId) {
            if (oldState.channel.members.size == 0 && oldState.channel.name.endsWith('\'s room')) {
                await oldState.channel.delete();
            }
            if (newState.channel.name === "Join to create vc") {
                const newRoom = await newState.guild.channels.create({
                    name: `${newState.member.displayName}'s room`,
                    type: ChannelType.GuildVoice,
                    parent: newState.channel.parent
                });
                await newState.setChannel(newRoom);
            }
        }
    },
};