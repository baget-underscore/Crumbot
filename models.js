module.exports = {
    User: class {
        constructor(id, name, pastEventCount=null, modLogs=null) {
            this.id = id,
            this.name = name,
            this.pastEventCount = pastEventCount,
            this.modLogs = modLogs
        }
    },
    Application: class {
        constructor(id, userId, eventName, completed, passed) {
            this.id = id,
            this.userId = userId,
            this.eventName = eventName,
            this.completed = completed,
            this.passed = passed
        }
    },
    Ticket: class {
        constructor(id, ownerId, name, members, closed) {
            this.id = id,
            this.ownerId = ownerId,
            this.name = name,
            this.members = members,
            this.closed = closed
        }
    },
    creatorEmbed: class {
    constructor() {
        
    }
}
}