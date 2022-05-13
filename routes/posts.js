"use strict";

const express = require(`express`);
const router = express.Router();

const connection = require(`../db`);

router.use(express.json());
//get posts
router.get('/', listPosts);

//post posts
router.post('/', submitPost);


//put upvote

//put downvote

//delete

//put (patch?) edit

//inserts post into the database
function submitPost(req, res) {

    console.log(req.body);

    let post = {
        postedOn: new Date(),
        title: connection.escape(req.body.title),
        url: connection.escape(req.body.url),
        owner: null
    }

    console.log(post);

    const sql = `INSERT INTO Post (postedOn, title, url, postOwner) VALUES (${connection.escape(post.postedOn.toISOString().slice(0, 19).replace('T', ' '))}, ${post.title}, ${post.url}, ${post.owner});`

    connection.query(sql, post, (error, result) => {
        if(error) {
            console.error(error);
            res.status(500).json({ error: 'error connecting to the database'});
        } else {
            res.status(200).json({result}) //todo select the new row to return
        }
    })

}


//retrieves ALL the posts.
function listPosts(req, res) {
    const sql = `SELECT * FROM Post ORDER BY postedOn DESC`;

    connection.query(sql, (error, result) => {
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
        postObjectsArray.push(rowToPostObject(row));
    });

    return postObjectsArray;
}


function rowToPostObject(rowData) {
    return {

        //he was not kidding.
        // console.log(row.postedOn)
        // let timestamp = new Date(row.postedOn).valueOf();
        // console.log(myDate);        
        // console.log(myDate.getMilliseconds());
        // console.log(myDate.valueOf());

        id: rowData.Id,
        title: rowData.title,
        url: rowData.url,
        timestamp: new Date(rowData.postedOn).valueOf(),
        score: rowData.score, //todo refactor
        // (Optional) "owner": null, //todo 
        // (Optional) "vote": 1 //todo
    }
}