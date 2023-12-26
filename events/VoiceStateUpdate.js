const { Events } = require('discord.js');

module.exports = {
    name: Events.VoiceStateUpdate,
    async execute(oldState, newState) {
        if (oldState.channelId === newState.channelId) {
            console.log('User stayed in channel')
        }
        else if (oldState.channelId == null) {
            console.log(`User joined "${newState.channel.name}"`)
        }
        else if (newState.channelId == null) {
            console.log(`User left "${oldState.channel.name}"`)
        }
        else if (oldState.channelId !== newState.channelId) {
            console.log(`User moved from "${oldState.channel.name}" to "${newState.channel.name}"`)
        }
    },
};