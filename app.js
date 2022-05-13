"use strict";

require('dotenv').config();
const PORT = process.env.PORT;

const express = require('express');
const app = express();

app.get(`/`, (req, res)=> {
    res.send(`aok`);
});

app.listen(PORT, (error)=> {
    if(error) {
        console.error(error);
    } else {
        console.log(`app is listening`);
    }
});