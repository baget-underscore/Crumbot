const Sequelize = require('sequelize');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

const Users = require('./models/Users.js')(sequelize, Sequelize.DataTypes);
const Applications = require('./models/Applications.js')(sequelize, Sequelize.DataTypes);
const Tickets = require('./models/Tickets.js')(sequelize, Sequelize.DataTypes);
const TicketSettings = require('./models/TicketSettings.js')(sequelize, Sequelize.DataTypes);
const Panels = require('./models/Panels.js')(sequelize, Sequelize.DataTypes);

module.exports = { Users, Applications, Tickets, TicketSettings, Panels };