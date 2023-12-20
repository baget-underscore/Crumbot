module.exports = (sequelize, DataTypes) => {
    return sequelize.define('tickets', {
        id: {
            type: DataTypes.TEXT,
            primaryKey: true,
        },
        name: DataTypes.TEXT,
        owner: DataTypes.TEXT,
        participants: DataTypes.TEXT,
        closed: {
            type: DataTypes.BOOLEAN,
            'default' : false,
        },
    }, {
        timestamps: false,
    });
};