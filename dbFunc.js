const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const logger = require('./logger');

module.exports = {
    async load() {
        try {
            sqlite3.verbose();
            const db = await connectDb('./database.sqlite');
            const query = 'SELECT * FROM ?';
            const users = await queryDb(db, query, 'users');
            const applications = await queryDb(db, query, 'applications');
            console.log(users);
            console.log(applications);

            return [users, applications];
        }
        catch (e) {
            logger.error(e);
        }
    },

    async queryDb(db, query, vars = [null]) {
        try {
            logger.info(`Starting queryDb() with ${db}:${table}`);
            const rows = await db.all(query, vars);
            logger.info(rows);
            return rows;
        }
        catch (e) {
            logger.error(e);
        }
    },

    async connectDb(database) {
        return open({
            database,
            model: sqlite3.Database,
        });
    },
};