let mysql = require('mysql');

let pool = mysql.createPool({
    connectionLimit: 100,
    host: 'localhost',
    user: 'user',
    password: 'pass',
    database: 'calendar'
});

let myPool = {
    pool,
    getConnection() {
        return new Promise((resolve, reject) => {
            this.pool.getConnection((err, connection) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(connection);
                }
            });
        });
    },
    query(sql) {
        return new Promise((resolve, reject) => {
            this.pool.query(sql, (err, rows, fields) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    },
    execute(connection, sql) {
        return new Promise((resolve, reject) => {
            connection.query(sql, (err, rows, fields) => {
                if (err)
                    reject(err);
                else
                    resolve(rows);
            });
        });
    }
};

module.exports = myPool;

myPool.query("CREATE DATABASE IF NOT EXISTs calendar;");
myPool.query("use calendar;");
myPool.query(`CREATE TABLE IF NOT EXISTs appointments(
    id INTEGER AUTO_INCREMENT PRIMARY KEY,
    timestamp INTEGER NOT NULL,
    name CHAR(255),
    email CHAR(255),
    phone CHAR(12),
    UNIQUE(timestamp)
);`);