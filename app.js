"use strict";

require('dotenv').config();
const PORT = process.env.PORT;

const express = require('express');
const app = express();

const postRoutes = require(`./routes/posts`)

app.use(`/posts`, postRoutes)

app.use(`/static`, express.static(`./static`));

// app.use(express.json());
// serve the main page at root path
app.get(`/`, (req, res)=> {
    //console.log(req.headers)
    //console.log(req.headers);
    //res.set(`username`, authenticateUser(req));
    res.status(200).sendFile(__dirname + `/static/index.html`);
});

/////////////////////////

app.get(`/whoami`, (req, res) => {

    // let username = authenticateUser(req);
    // console.log(username);

    // res.status(200).json({ username: username });

    res.status(501).send(`not implemented`);

})


app.get(`/login`, (req, res) => {

//     let username = authenticateUser(req);
//     let testCase = (username === 'username')

//     if(testCase) {
//         //login successful
//         res.status(200).json({message: `welcome, ${username} `});
//     } else {
//         //login failed
//         res.set(`WWW-Authenticate`, `Basic realm="pseudit"`);
//         res.status(401).json({message: `begone, interloper`});
//     }
// })

    res.status(501).send(`not implemented`);

});


app.get(`/logout`, (req, res) => {
    // console.log(req.headers);
    
    // let testCase = (authenticateUser(req) === 'logout')

    // if(testCase) {
    //     //logout successful
    //     res.status(200).redirect(`/`);
    // } else {
    //     console.log(req.headers);
    //     res.status(400).json({message: "Wat."});
    // }
    res.status(501).send(`not implemented`);

})


function authenticateUser(req) {
    const credentials = decodeAuthHeaders(req);

    //todo add database query

    return credentials.username;
}


function decodeAuthHeaders(req) {
    const encodedAuthString = (req.headers.authorization || '').split(' ')[1] || '';
    const decodedAuthString = Buffer.from(encodedAuthString, 'base64').toString();
    const [_, login, password] = decodedAuthString.match(/(.*?):(.*)/) || [];

    return { 
        username: login,
        password: password
    }
}


//////////////////////////////

app.listen(PORT, (error)=> {
    if(error) {
        console.error(error);
    } else {
        console.log(`app is listening`);
    }
});