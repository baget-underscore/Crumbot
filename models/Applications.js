module.exports = (sequelize, DataTypes) => {
    return sequelize.define('applications', {
        app_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        user_id: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        app_name: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        finished: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        },
        mc_name: DataTypes.TEXT,
        join_reason: DataTypes.TEXT,
        rules_accept: DataTypes.TEXT,
        avail_dates: DataTypes.TEXT,
        passed: DataTypes.BOOLEAN,
    }, {
        timestamps: false,
    });
};