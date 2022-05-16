"use strict";

const express = require(`express`);
const { connect } = require("../db");
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
    }

    console.log(post);

    let timestamp = connection.escape(post.postedOn.toISOString().slice(0, 19).replace('T', ' '));
    let username = connection.escape(req.headers.username);

    const insertStatement = `INSERT INTO Post (postedOn, title, url, postOwner) ` +
                                `VALUES (${timestamp}, `+
                                        `${post.title}, `+
                                        `${post.url}, `+
                                        //`${post.owner});`
                                        //once again ugly but no point bothering with it without proper authentication
                                        `(SELECT pseuditor.Id FROM pseuditor WHERE pseuditor.username = ${username}) )` 

    sqlQueryWithErrorHandler(insertStatement, result => {

        retrieveImpactedPost(res, result.insertId, username);
    });
}


//retrieves ALL the posts.
function listPosts(req, res) {
    //const selectStatement = `SELECT * FROM Post ORDER BY postedOn DESC`;

    //retrieve username from headers
    let username = connection.escape(req.headers.username);
    console.log(username);

    //oh boy.
    const selectStatement = `SELECT Post.Id as POST_ID, ` +
                                    `title, `+
                                    `url, `+
                                    `postedOn,  `+
                                    `username,  `+
                                    `SUM(Vote) AS score, `+
                                    `(select Vote ` + //subquery for "My" posts
                                    `    FROM Post ` + 
                                    `    INNER JOIN vote ON post.Id = vote.PostId ` +
                                    `    INNER JOIN pseuditor ON vote.userID = pseuditor.Id ` +
                                    `    WHERE pseuditor.username=${username} AND POST_ID=vote.PostId) as myvote `+
    //that last part could probably use some work but I ain't touching it unless I get around to some proper authentication.
                                    `FROM Post `+
                                    `   LEFT JOIN pseuditor ON post.postOwner=pseuditor.Id `+
                                    `   LEFT JOIN vote ON post.Id = vote.PostID `+
                                    `GROUP BY Post.Id ` +
                                    `ORDER BY postedOn DESC`;

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

        id: rowData.POST_ID,
        title: rowData.title,
        url: rowData.url,
        timestamp: new Date(rowData.postedOn).valueOf(),
        score: (rowData.score=== null? 0 : rowData.score),
        owner: rowData.username,
        vote:  (rowData.myvote === null? 0 : rowData.myvote)
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
    //const updateStatement = `UPDATE Post SET score = score + ${vote} WHERE Id = ${connection.escape(req.params.id)}`;
    //let username = connection.escape(req.headers.username);

    //sqlQueryWithErrorHandler(updateStatement, () => {
        // res.send(result);
    //    retrieveImpactedPost(res, req.params.id, username);
    //});

    
    // if(!isUsernameValid(req.headers.username)) {
    //     // user check (invalid username)?
    //     res.status(403).json({error: "not authorized to vote"});
    // } else if(!isPostNumberValid(req.params.id)) {
    //     // post check (nonexistent post)
    //     res.status(404).json({error: "post not found"});
    // } else {

    isUsernameValid(req.headers.username, (usernameOk)=> { //this sounds like a horrible, horrible, horrible idea
        if(!usernameOk) {
            res.status(403).json({error: "not authorized to vote"});
        } else {
            isPostNumberValid(req.params.id, (idOk) => {
                if(!idOk) {
                    res.status(404).json({error: "post not found"});
                } else {
                    //this is where checking callbacks allow for the query proper


                    
                    
                    // insert into .. on duplicate key update for votes table
                    let postId = connection.escape(req.params.id);
                    let username = connection.escape(req.headers.username);
                    
                    const insertStatement = `INSERT INTO vote (PostId, UserID, Vote) `+
                    `VALUES ( `+
                    `   ${postId}, `+
                    `   (SELECT Id FROM pseuditor WHERE username = ${username}), `+
                    `   ${vote} `+
                    `) ` +
                    `ON DUPLICATE KEY UPDATE vote = ${vote}`;
                    
                    sqlQueryWithErrorHandler(insertStatement, (result)=> {
                        console.log(result);
                        retrieveImpactedPost(res, req.params.id, username);
                    });
                
                    
                    //thi is where checking callbacks end
                }
            });
        }
    });

}

//select the last impacted post and return it as an object
function retrieveImpactedPost(res, id, username) {
    //const selectStatement = `SELECT * FROM Post WHERE Id = ${connection.escape(id)}`;

    const selectStatement = `SELECT Post.Id as POST_ID, ` +
                                    `title, `+
                                    `url, `+
                                    `postedOn,  `+
                                    `username,  `+
                                    `SUM(Vote) AS score, `+
                                    `(select Vote ` + //subquery for "My" posts
                                    `    FROM Post ` + 
                                    `    INNER JOIN vote ON post.Id = vote.PostId ` +
                                    `    INNER JOIN pseuditor ON vote.UserID = pseuditor.Id ` +
                                    `    WHERE pseuditor.username=${username} AND POST_ID=vote.PostId) as myvote `+
    //that last part could probably use some work but I ain't touching it unless I get around to some proper authentication.
                                    `FROM Post `+
                                    `   LEFT JOIN pseuditor ON post.postOwner=pseuditor.Id `+
                                    `   LEFT JOIN vote ON post.Id = vote.PostID `+
                                    `WHERE Post.Id = ${id} ` +
                                    `GROUP BY Post.Id `;


        sqlQueryWithErrorHandler(selectStatement, result => {
            //todo check if result is not empty?
            console.log(result);
            res.status(200).json(rowToPostObject(result[0])); 
    });
}


//outsourcing of error handling
function sqlQueryWithErrorHandler(query, resultHandler) {
    connection.query(query, (error, result)=> {
        if(error) {
            databaseError(error);
        } else {
            resultHandler(result);
        }
    });
}

//this is getting a bit long, maybe I should break this up?
//nah.

//TODO deal with the query delay.

//returns true if database has a user in it, false otherwise
function isUsernameValid (username, callback) {
    const select = `SELECT COUNT(*) FROM pseuditor WHERE pseuditor.username = ${connection.escape(username)}`;
    let outcome = false;
    connection.query(select, (error, result) =>{
    //sqlQueryWithErrorHandler(select, result => {
        if(error) databaseError(error);
        console.log(result);
        outcome = result[0]['COUNT(*)'] !== 0;
        
        callback(outcome);
    });
}

//returns true if database has post with given id in it, false otherwise
function isPostNumberValid (id, callback) {
    const select = `SELECT COUNT(*) FROM post WHERE post.Id = ${connection.escape(id)}`;
    let outcome = false;
    connection.query(select, (error, result) =>{
        //sqlQueryWithErrorHandler(select, result => {
        if(error) databaseError(error);
        console.log(result);
        outcome = result[0]['COUNT(*)'] !== 0;
        callback(outcome);
    });
}

function databaseError(error) {
    console.error(error);
    res.status(500).json({ error: 'error connecting to the database'});
}