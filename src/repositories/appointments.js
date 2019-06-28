'use strict';

let path = require('path');

require(path.resolve(__dirname, '../services/finally.js'));

module.exports = class {
    constructor(databasePool) {
        this.db = databasePool;
    }

    get(startDate, endDate) {

        let sql = `SELECT timestamp FROM appointments WHERE timestamp >= ${startDate} 
			AND timestamp <= ${endDate} ORDER BY timestamp;`;

        return this.db.query(sql);

    }

    async getAll(startDate, endDate) {
        let connection = await this.db.getConnection();

        let sql = `SELECT timestamp FROM appointments WHERE timestamp >= ${startDate} 
			AND timestamp <= ${endDate} ORDER BY timestamp;`;


        return this.db.execute(connection, sql)
                .finally(() => connection.release());
    }

    create(timestamp, name, email, phone) {
        
        let sql = `INSERT IGNORE INTO appointments (timestamp, name, email, phone)
            VALUES(${timestamp},'${name}','${email}','${phone}');`

        return this.db.query(sql);    

    }
};