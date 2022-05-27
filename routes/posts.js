"use strict";

const express = require(`express`);
const router = express.Router();

const db = require(`../db`);

router.use(express.json());


//get posts
router.get('/', listPosts);

//post posts
router.post('/', submitPost);

//put upvote
router.put(`/:id/upvote`, upVote);

//put downvote
router.put(`/:id/downvote`, downVote);

//put vote cancel
router.put(`/:id/cancelvote`, cancelVote)

//delete
router.delete(`/:id/`, deletePost);

//put (patch?) edit
router.put(`/:id/`, updatePost);


/////////////////////////////////////////////////////////
///////////////////////////////////////////////////////
//endpoint functions

//retrieves ALL the posts.
function listPosts(req, res) {
    //const selectStatement = `SELECT * FROM Post ORDER BY postedOn DESC`;

    //retrieve username from headers
    let username = db.connection.escape(req.headers.username);
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

    // sqlQueryWithErrorHandler(selectStatement, (result)=> {
    //     //compose array of objects to be returned
    //     res.status(200).json({posts: rowListToObjectList(result)});
    // });

    db.handleSqlWithError(selectStatement, res)
        .then(result => sendToFrontend(200, {posts: rowListToObjectList(result)}, res));
}

//inserts post into the database
function submitPost(req, res) {

    console.log(req.body);

    let post = {
        postedOn: new Date(),
        title: db.connection.escape(req.body.title),
        url: db.connection.escape(req.body.url),
    }

    console.log(post);

    let timestamp = db.connection.escape(post.postedOn.toISOString().slice(0, 19).replace('T', ' '));
    let username = db.connection.escape(req.headers.username);

    const insertStatement = `INSERT INTO Post (postedOn, title, url, postOwner) ` +
                                `VALUES (${timestamp}, `+
                                        `${post.title}, `+
                                        `${post.url}, `+
                                        //`${post.owner});`
                                        //once again ugly but no point bothering with it without proper authentication
                                        `(SELECT pseuditor.Id FROM pseuditor WHERE pseuditor.username = ${username}) )` 

    // sqlQueryWithErrorHandler(insertStatement, result => {

    //     retrieveImpactedPost(res, result.insertId, username);
    // });

    db.handleSqlWithError(insertStatement, res)
        .then(result=> {
            retrieveImpactedPost(res, result.insertId, username);
    });

}

//adds a +1 vote from logged in user
function upVote(req, res) {
    putVoteAsync(req, res, 1);
}

//adds a -1 vote from logged in user
function downVote(req, res) {
    putVoteAsync(req, res, -1);
}

//replaces previous vote by logged in user to 0 (he will never be freed of shame of being associated with this particular post)
function cancelVote(req, res) {
    putVoteAsync(req, res, 0);
}

//delete the post with given identifier... if it's yours. Alright maybe the user who cancelled a vote may be released after all by the power of CASCADE
function deletePost(req, res) {
    //confirm that post exists
    

    //check user authority?
    //delete post
    const deleteStatement = `DELETE FROM Post WHERE Id = ${db.connection.escape(req.params.id)}`;

    db.handleSqlWithError(deleteStatement, res)
    console.log(deleteStatement);
}

//update the post with given identifier

async function updatePost(req, res) {

    let username = req.headers.username;
    let id = req.params.id

    //confirm that post exists
    if(!(await isPostNumberValidAsync(id, res))) {

        sendToFrontend(404, { error: "post not found" }, res);

    } else {
        let accessedPost = await retrievePostCompoundById(db.connection.escape(id), res, username);

        let update = req.body;
        console.log(accessedPost);
        console.log(update);

        if (!username === accessedPost[0].username) {
            sendToFrontend(403, { error: "not authorized to make the change" }, res);
        } else {

            let timestamp = db.connection.escape(new Date().toISOString().slice(0, 19).replace('T', ' '));



            const updateStatement = `UPDATE Post SET title = ${db.connection.escape(update.title)}, `+
                                                    ` url = ${db.connection.escape(update.url)}, ` +
                                                    ` postedOn = ${timestamp} ` +
                                                    `WHERE id = ${db.connection.escape(id)}`;

            db.handleSqlWithError(updateStatement, res)
                .then(result => {
                    console.log(result);
                    retrieveImpactedPost(res, id, username);
            });

            //sendToFrontend(200, { message: "implementation pending" }, res);
        }

        
        
    }
}


///////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////
//helper functions

//turns array of row objects into array of post objects
function rowListToObjectList(sqlOutput) {
    let postObjectsArray = [];

    sqlOutput.forEach(row => {
        postObjectsArray.push(rowToPostObject(row));
    });

    return postObjectsArray;
}

//converts table output row to object defined by API
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

//cast vote, +1, -1 or 0
async function putVoteAsync(req, res, vote) {

    //todo - retrieve user from headers

    if(!(await isUsernameValidAsync(req.headers.username, res))) {
        
        sendToFrontend(403, { error: "not authorized to vote" }, res);
    } else {

        if(!(await isPostNumberValidAsync(req.params.id, res))) {
            sendToFrontend(404, { error: "post not found" }, res);
        } else {

            let postId = db.connection.escape(req.params.id);
            let username = db.connection.escape(req.headers.username);

            const insertStatement = `INSERT INTO vote (PostId, UserID, Vote) `+
                                        `VALUES ( `+
                                        `   ${postId}, `+
                                        `   (SELECT Id FROM pseuditor WHERE username = ${username}), `+
                                        `   ${vote} `+
                                        `) ` +
                                        `ON DUPLICATE KEY UPDATE vote = ${vote}`;

            db.handleSqlWithError(insertStatement, res)
                .then(result => {
                    console.log(result);
                    retrieveImpactedPost(res, req.params.id, req.headers.username)
            });
                    
        }
    }
}

async function retrievePostCompoundById(id, res, username) {
    username = db.connection.escape(username);

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

    return await db.handleSqlWithError(selectStatement, res);

}

//select the last impacted post and return it as an object
function retrieveImpactedPost(res, id, username) {
    //const selectStatement = `SELECT * FROM Post WHERE Id = ${db.connection.escape(id)}`;
    // username = db.connection.escape(username);

    // const selectStatement = `SELECT Post.Id as POST_ID, ` +
    //                                 `title, `+
    //                                 `url, `+
    //                                 `postedOn,  `+
    //                                 `username,  `+
    //                                 `SUM(Vote) AS score, `+
    //                                 `(select Vote ` + //subquery for "My" posts
    //                                 `    FROM Post ` + 
    //                                 `    INNER JOIN vote ON post.Id = vote.PostId ` +
    //                                 `    INNER JOIN pseuditor ON vote.UserID = pseuditor.Id ` +
    //                                 `    WHERE pseuditor.username=${username} AND POST_ID=vote.PostId) as myvote `+
    // //that last part could probably use some work but I ain't touching it unless I get around to some proper authentication.
    //                                 `FROM Post `+
    //                                 `   LEFT JOIN pseuditor ON post.postOwner=pseuditor.Id `+
    //                                 `   LEFT JOIN vote ON post.Id = vote.PostID `+
    //                                 `WHERE Post.Id = ${id} ` +
    //                                 `GROUP BY Post.Id `;

    // db.handleSqlWithError(selectStatement, res)
    retrievePostCompoundById(id, res, username)
        .then(result=> {
            console.log(result);
            sendToFrontend(200, rowToPostObject(result[0]), res); //dangerous assumption?
        });

    // sqlQueryWithErrorHandler(selectStatement, result => {
    //     //todo check if result is not empty?
    //     console.log(result);
    //     res.status(200).json(rowToPostObject(result[0])); 
    // });
}


//returns true if database has a user in it, false otherwise

async function isUsernameValidAsync (username, res) {
    const select = `SELECT COUNT(*) FROM pseuditor WHERE pseuditor.username = ${db.connection.escape(username)}`;
    return ((await db.handleSqlWithError(select,res))[0]['COUNT(*)'] !== 0);
}

//returns true if database has post with given id in it, false otherwise
async function isPostNumberValidAsync(id, res) {
    const select = `SELECT COUNT(*) FROM post WHERE post.Id = ${db.connection.escape(id)}`;
    return ((await db.handleSqlWithError(select,res))[0]['COUNT(*)'] !== 0);
}


function sendToFrontend(status, delivery, res) {
    res.status(status).json(delivery);
}








module.exports = router;


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//old implementation

// // outsourcing of error handling
// function sqlQueryWithErrorHandler(query, resultHandler) {
//     db.connection.query(query, (error, result)=> {
//         if(error) {
//             databaseError(error);
//         } else {
//             resultHandler(result);
//         }
//     });
// }

// //returns true if database has a user in it, false otherwise
// function isUsernameValid (username, callback) {
//     const select = `SELECT COUNT(*) FROM pseuditor WHERE pseuditor.username = ${db.connection.escape(username)}`;
//     let outcome = false;
//     db.connection.query(select, (error, result) =>{
//     //sqlQueryWithErrorHandler(select, result => {
//         if(error) databaseError(error);
//         console.log(result);
//         outcome = result[0]['COUNT(*)'] !== 0;
        
//         callback(outcome);
//     });
// }


// //returns true if database has post with given id in it, false otherwise
// function isPostNumberValid (id, callback) {
//     const select = `SELECT COUNT(*) FROM post WHERE post.Id = ${db.connection.escape(id)}`;
//     let outcome = false;
//     db.connection.query(select, (error, result) =>{
//         //sqlQueryWithErrorHandler(select, result => {
//         if(error) databaseError(error);
//         console.log(result);
//         outcome = result[0]['COUNT(*)'] !== 0;
//         callback(outcome);
//     });
// }


// //processes the request to cast a vote
// function putVote(req, res, vote) {
    

//     isUsernameValid(req.headers.username, (usernameOk)=> { //this sounds like a horrible, horrible, horrible idea
//         if(!usernameOk) {
//             res.status(403).json({error: "not authorized to vote"});
//         } else {
//             isPostNumberValid(req.params.id, (idOk) => {
//                 if(!idOk) {
//                     res.status(404).json({error: "post not found"});
//                 } else {
//                     //this is where checking callbacks allow for the query proper


                    
                    
//                     // insert into .. on duplicate key update for votes table
//                     let postId = db.connection.escape(req.params.id);
//                     let username = db.connection.escape(req.headers.username);
                    
//                     const insertStatement = `INSERT INTO vote (PostId, UserID, Vote) `+
//                                                 `VALUES ( `+
//                                                 `   ${postId}, `+
//                                                 `   (SELECT Id FROM pseuditor WHERE username = ${username}), `+
//                                                 `   ${vote} `+
//                                                 `) ` +
//                                                 `ON DUPLICATE KEY UPDATE vote = ${vote}`;
                                            
//                     sqlQueryWithErrorHandler(insertStatement, (result)=> {
//                         console.log(result);
//                         retrieveImpactedPost(res, postId, username);
//                     });
                
                    
//                     //thi is where checking callbacks end
//                 }
//             });
//         }
//     });

// }