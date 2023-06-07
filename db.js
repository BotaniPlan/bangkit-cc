const mysql = require('mysql');
const config = require('./config');

const pool = mysql.createPool(config.dbConfig);

module.exports = pool;