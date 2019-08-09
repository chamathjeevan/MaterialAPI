var mysql = require('mysql');

var dbConnection = mysql.createConnection({
    host: 'mysql-bridge-ap.c8ug87x2cehw.ap-southeast-1.rds.amazonaws.com',
    port: '3306',
    user: 'rebirth',
    password: '9ijnBGT5',
    database: 'BRIDGE'
});

dbConnection.connect(function (err) {
    if (err) {
        console.log(err);
    }
    else {
        console.log('Connected');
    }
});

module.exports = dbConnection;