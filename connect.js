const mysql = require('mysql');

let con = mysql.createConnection({
    host: '34.101.195.31',
    user: 'root',
    password: 'c23@ps261',
    database: 'botaniplan'
});

con.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
  });