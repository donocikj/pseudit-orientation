"use strict";

const express = require(`express`);
const { send } = require("express/lib/response");
const router = express.Router();

const connection = require(`../db`);

router.use(express.json());
//get posts
router.get('/', listPosts);

//post posts
router.post('/', submitPost);


//put upvote
router.put(`/:id/upvote`, upVote);


//put downvote
router.put(`/:id/downvote`, downVote);


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

    const insertStatement = `INSERT INTO Post (postedOn, title, url, postOwner) VALUES (${connection.escape(post.postedOn.toISOString().slice(0, 19).replace('T', ' '))}, ${post.title}, ${post.url}, ${post.owner});`

    sqlQueryWithErrorHandler(insertStatement, result => {

        retrieveImpactedPost(res, result.insertId);

        // const selectStatement = `SELECT * FROM Post WHERE Id = ${connection.escape(result.insertId)}`;
        // sqlQueryWithErrorHandler(selectStatement, result => {
        //     res.status(200).json(rowToPostObject(result[0])); 
        // });
    });
}


//retrieves ALL the posts.
function listPosts(req, res) {
    const selectStatement = `SELECT * FROM Post ORDER BY postedOn DESC`;

    sqlQueryWithErrorHandler(selectStatement, (result)=> {
        //compose array of objects to be returned
        res.status(200).json({posts: composeReturnedPosts(result)});
    });
}


module.exports = router;

//turns array of row objects into array of post objects
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

function upVote(req, res) {
    putVote(req, res, 1);
}

function downVote(req, res) {
    putVote(req, res, -1);
}


//processes the request to cast a vote
function putVote(req, res, vote) {
    //first implementation - free for all
    // console.log(req.params.id);
    const updateStatement = `UPDATE Post SET score = score + ${vote} WHERE Id = ${connection.escape(req.params.id)}`;

    sqlQueryWithErrorHandler(updateStatement, result => {
        // res.send(result);
        retrieveImpactedPost(res, req.params.id);
    });

   

}

//select the last impacted post and return it as an object
function retrieveImpactedPost(res, id) {
    const selectStatement = `SELECT * FROM Post WHERE Id = ${connection.escape(id)}`;
        sqlQueryWithErrorHandler(selectStatement, result => {
            //todo check if result is not empty?
            res.status(200).json(rowToPostObject(result[0])); 
    });
}


//outsourcing of error handling
function sqlQueryWithErrorHandler(query, resultHandler) {
    connection.query(query, (error, result)=> {
        if(error) {
            console.error(error);
            res.status(500).json({ error: 'error connecting to the database'});
        } else {
            resultHandler(result);
        }
    })
}