"use strict";

const mysql = require('mysql');

const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        database: process.env.DB_DATABASE,
        password: process.env.DB_PASSWORD,
});

connection.connect((error) => {

    if(error) {
        console.error(error);
    } else {
        console.log(`connection to database established`);
    }

});



module.exports = connection;