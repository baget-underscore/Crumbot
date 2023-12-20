module.exports = (sequelize, DataTypes) => {
    return sequelize.define('ticketsettings', {
        guild: {
            type: DataTypes.TEXT,
            primaryKey: true,
        },
        staff: DataTypes.TEXT,
        transcript_channel: DataTypes.TEXT,
    }, {
        timestamps: false,
    });
};