"use strict";


const mainElement = document.querySelector(`main`);
const submissionForm = document.querySelector(`#submissionForm`);

const postList = { posts: [] };


//let user = 'anonymous'

console.log(`script loaded`)

//just because I love that picture
document.querySelector(`header`).addEventListener(`click`, (e) => {
    document.querySelector(`header`).classList.toggle(`expanded`);
})

////////////////////////////
//register even listeners

//on load - grab all the available posts and dump them onto the page
document.addEventListener(`DOMContentLoaded`, fetchAllPosts)

//submit button - create form for entering new post
document.querySelector(`#submissionFormButton`).addEventListener(`click`, showSubmissionForm);
//submit button in the form for actually sending the data
submissionForm.addEventListener(`submit`,submitPost);
//cancel button in the form for hiding the form
document.querySelector(`#cancelSubmission`).addEventListener(`click`,hideSubmissionForm);



//upvote, downvote
mainElement.addEventListener(`click`, mainAreaClick);




//modify


//delete



///////////////////////////
//implementation 

//retrieve all posts from the database by accessing the appropriate GET endpoint of backend.
function fetchAllPosts(e) {
    console.log(e);

    fetch(`/posts/`)
    //examine response for statuses...
        .then(response => response.json())
    //examine the post list
        .then(returnObject => {
            console.log(returnObject)
            postList.posts = []; //make sure it's empty
            mainElement.innerHTML = ``;
            returnObject.posts.forEach(post => { 
                //foreach - create element and save it to the variable for future reference
                let newPost = createPostElement(post);
                postList.posts.push(newPost);
            });
            console.log(submissionForm);
        })
        .catch(problem => console.error(problem));
}

//creates a form element on top of existing posts to fill in.
function showSubmissionForm(e) {
    console.log(e);

    // let submitFormElement = document.createElement(`form`);
    // submitFormElement.classList.add(`container`);
    mainElement.prepend(submissionForm);
}

//gathers the information and sends it to the server to appropriate endpoint for insertion
function submitPost(e) {
    e.preventDefault();
    const newPost = {
        title: document.forms.submissionForm.title.value,
        url: document.forms.submissionForm.url.value
    }

    // submissionForm.checkValidity();
    // let okToSend = submissionForm.reportValidity()
    // if(okToSend) {

    fetch(`/posts`, {
        method: `POST`,
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newPost)
    })
    .then(response => {   
            location.reload(true);         
        }, problem => console.error(problem));

    // }

    // if(okToSend) location.reload();
}

//makes the main element disown the form
function hideSubmissionForm() {
    mainElement.removeChild(submissionForm);
}

//click has been registered in the main area, possible vote
function mainAreaClick(e) {
    console.log(e.composedPath());
    if(e.target.classList.contains(`up`)) {
        console.log(`upvoting post ${e.target.getAttribute(`data-postId`)} :)`);
        upVote(e.target.getAttribute(`data-postId`));
    } else if (e.target.classList.contains(`down`)) {
        console.log(`downvoting post ${e.target.getAttribute(`data-postId`)} >:(`);
        downVote(e.target.getAttribute(`data-postId`));
    } else if (e.target.classList.contains(`modify`)) {
        console.log(`attempting to edit post ${e.composedPath()[2].getAttribute(`data-id`)}`);
        modifyPost(e.composedPath()[2]);
    } else if (e.target.classList.contains(`delete`)) {
        console.log(`attempting to delete post ${e.composedPath()[2].getAttribute(`data-id`)}`);
        deletePost(e.composedPath()[2].getAttribute(`data-id`));
    }
}


///////////////////////////
//helper functions

//accepts object with all post related data required to generate an element
function createPostElement(post) {
    //container div
    let containerDiv = document.createElement(`div`);
    containerDiv.classList.add(`container`);
    containerDiv.setAttribute(`data-id`, post.id);

    //title
    let postTitle = document.createElement(`h3`);
    postTitle.textContent = post.title;
    containerDiv.appendChild(postTitle);

    //link
    let postLink = document.createElement(`a`);
    postLink.classList.add(`postUrl`);
    postLink.setAttribute(`href`, post.url);
    postLink.textContent = post.url;
    containerDiv.appendChild(postLink);

    //timestamp
    let timestampField = document.createElement(`time`);
    timestampField.textContent = `last modified: ` + howLongAgo(post.timestamp);
    containerDiv.appendChild(timestampField);

    //owner
    let ownerField = document.createElement(`div`);
    ownerField.textContent = post.owner || `anonymous`;
    ownerField.classList.add(`ownerField`);
    containerDiv.appendChild(ownerField);
    
    //score
    let voteField = document.createElement(`div`);
    voteField.classList.add(`votes`);

    //upvote
    let upvoteImg = document.createElement(`img`);
    upvoteImg.classList.add(`up`);
    upvoteImg.setAttribute(`src`, `/static/assets/upvote.png`); //todo check logged in user
    upvoteImg.setAttribute(`alt`, `upvote the post ${post.id}`); //
    upvoteImg.setAttribute(`data-postId`, post.id)
    voteField.appendChild(upvoteImg);

    //score count
    let scoreField = document.createElement(`div`);
    scoreField.textContent = post.score;
    scoreField.classList.add(`scoreField`);
    voteField.appendChild(scoreField);

    //downvote
    let downvoteImg = document.createElement(`img`);
    downvoteImg.classList.add(`down`);
    downvoteImg.setAttribute(`src`, `/static/assets/downvote.png`); //todo check logged in user
    downvoteImg.setAttribute(`alt`, `downvote the post ${post.id}`); //
    downvoteImg.setAttribute(`data-postId`, post.id)
    voteField.appendChild(downvoteImg);

    containerDiv.appendChild(voteField);


    // modify, delete)
    let toolDiv = document.createElement(`div`);
    toolDiv.classList.add(`tools`);

    let modifyLink = document.createElement(`a`);
    modifyLink.classList.add(`modify`);
    modifyLink.textContent = `Modify`;
    toolDiv.appendChild(modifyLink);

    let deleteLink = document.createElement(`a`);
    deleteLink.classList.add(`delete`);
    deleteLink.textContent = `Delete`;
    toolDiv.appendChild(deleteLink);

    containerDiv.appendChild(toolDiv);



    //compare owner with username


    //append to main
    mainElement.appendChild(containerDiv);
    return containerDiv;

}

//upvotes a post
function upVote(id) {
    vote(id, `up`);
}

//downvotes a post
function downVote(id) {
    vote(id, `down`);
}

function vote(id, direction) {
    fetch(`/posts/${id}/${direction}vote`, {
        method: `PUT`
        //headers
    }).then(
        result => console.log(result),
        problem => console.error(problem)
    );
}

//receives handle to container element of a post to be modified. Should substitute the container for a modification form.
function modifyPost(postContainer) {

}

//receives id of post to be deleted
function deletePost(id) {
    fetch(`/posts/${id}`, {
        method: `DELETE`
        //headers
    }).then(
        result => {
            console.log(result);
            location.reload(true);
        },
        problem => console.error(problem)
    );
}

//this hideous monstrosity generates a string describing how long ago something happened... sort of.
function howLongAgo(timestamp) {
    const now = new Date();
    
    let diff = now - timestamp;

    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    diff += now.getTimezoneOffset() * minute;

    if (diff <= second) return `just now`;

    const ref = [day, hour, minute, second, 1];

    const ago = ref.map(period => {
        let periodInDiff = Math.floor(diff/period);
        diff -= periodInDiff * period;
        return periodInDiff;
    });

    return `${ago[0]!==0 ? ago[0] + " days " : ""}${ago[1]!==0 ? ago[1] + " hours " : ""}`+
           `${ago[2]!==0 ? ago[2] + " minutes " : ""}${ago[3]!==0 ? ago[3] + " seconds " : ""}`
    
}