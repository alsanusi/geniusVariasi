// SingleUse Database Connection
const mysql = require('mysql')
const dbConfig = require('../config')
exports.con = mysql.createConnection({
    host: dbConfig.database.host,
    user: dbConfig.database.user,
    password: dbConfig.database.password,
    port: dbConfig.database.port,
    database: dbConfig.database.database,
    supportBigNumbers: true,
    bigNumberStrings: true
})
