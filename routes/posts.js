"use strict";

const express = require(`express`);
const { rawListeners } = require("../db");
const router = express.Router();

const connection = require(`../db`);


//get posts
router.get('/', listPosts);

//post posts


//put upvote

//put downvote

//delete

//put (patch?) edit


//retrieves ALL the posts.
function listPosts(req, res) {
    const mysql = `SELECT * FROM Post ORDER BY postedOn DESC`;

    connection.query(mysql, (error, result) => {
        if(error) {
            console.error(error);
            res.status(500).json({ error: 'error connecting to the database'});
        } else {
            //compose array of objects to be returned
            res.status(200).json({posts: composeReturnedPosts(result)});
        }
    })
}


module.exports = router;

function composeReturnedPosts(sqlOutput) {
    let postObjectsArray = [];

    sqlOutput.forEach(row => {

        //he was not kidding.
        // console.log(row.postedOn)
        let timestamp = new Date(row.postedOn).valueOf();
        // console.log(myDate);        
        // console.log(myDate.getMilliseconds());
        // console.log(myDate.valueOf());

        let post = {
            id: row.Id,
            title: row.title,
            url: `http://localhost:3000/posts/${row.Id}`,
            timestamp: timestamp,
            score: row.score, //todo refactor
            // (Optional) "owner": null, //todo 
            // (Optional) "vote": 1 //todo
        }

        postObjectsArray.push(post);

    });

    return postObjectsArray;
}