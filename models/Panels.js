module.exports = (sequelize, DataTypes) => {
    return sequelize.define('panels', {
        id: {
            type: DataTypes.TEXT,
            primaryKey: true,
        },
        name: DataTypes.TEXT,
        category_1: DataTypes.TEXT,
        category_2: DataTypes.TEXT,
        category_3: DataTypes.TEXT,
        category_4: DataTypes.TEXT,
        category_5: DataTypes.TEXT,
    }, {
        timestamps: false,
    });
};