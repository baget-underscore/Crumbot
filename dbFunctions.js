const mysql = require('mysql');
const { host, port, user, password, database } = require('./config.js').db;

const db_pool = mysql.createPool({
    host, port, user, password, database
});
module.exports = {
    query: async function(sqlQuery, parameters=null) {
        return new Promise((resolve, reject) => {
            db_pool.query(sqlQuery, parameters, (err, elem) => {
                if (err) return reject(err);
                return resolve(elem);
                }
            );
        });
    },
    
    queries: async function(sqlQueries, parameters=null) {
        const response = [];
        for (const sql of sqlQueries) {
            let res = await query(sql, parameters);
            response.push(res);
        }
        return response;
    }
}