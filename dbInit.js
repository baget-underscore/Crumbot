const Sequelize = require('sequelize');
const logger = require('./logger');

const sequelize = new Sequelize('database', 'username', 'password', {
    host: 'localhost',
    dialect: 'sqlite',
    logging: false,
    storage: 'database.sqlite',
});

require('./models/Applications.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/Tickets.js')(sequelize, Sequelize.DataTypes);
require('./models/TicketSettings.js')(sequelize, Sequelize.DataTypes);
const Panels = require('./models/Panels.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');
const alter = !(process.argv.includes('--alter') || process.argv.includes('-a'));


sequelize.sync({ force, alter }).then(async () => {
    const queries = [
        await Panels.upsert({ id: '1236567', name: 'your mom', category_1: 'Complaints', category_2: 'Questions' }),
    ];

    await Promise.all(queries);
    logger.info('Database synced');
    sequelize.close();
}).catch(logger.error);