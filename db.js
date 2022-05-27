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


//takes the promise, waits for it and checks it for errors
function handleSqlWithError(sqlStatement, res) {
    return sqlPromise(sqlStatement)
            .then(result => result)
            .catch(error => databaseError(error));

}


//makes a promise out of the connection.query call
function sqlPromise(sqlStatement) {
    return new Promise((resolve, reject) => {
        connection.query(sqlStatement, (error, result) => {
            if(error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

//sends database error if something went wrong while making db query
function databaseError(error, res) {
    console.error(error);
    res.status(500).json({ error: 'error connecting to the database'});
    connection.end();
    connection.connect();
}




module.exports = {
    connection,
    handleSqlWithError
}