"use strict";

require('dotenv').config();
const PORT = process.env.PORT;

const express = require('express');
const app = express();

const postRoutes = require(`./routes/posts`)
app.use(`/posts`, postRoutes)
// app.use(express.json());

app.get(`/`, (req, res)=> {
    console.log(req.headers);
    res.send(`aok`);
});

app.listen(PORT, (error)=> {
    if(error) {
        console.error(error);
    } else {
        console.log(`app is listening`);
    }
});