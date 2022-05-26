"use strict";


const mainElement = document.querySelector(`main`);

const postList = { posts: [] };
const SERVER = `http://127.0.0.1:3000`;

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

//upvote, downvote

//modify

//delete


///////////////////////////
//implementation 
function fetchAllPosts(e) {
    console.log(e);

    fetch(SERVER + `/posts/`)
    //examine response for statuses...
        .then(response => response.json())
    //examine the post list
        .then(returnObject => {
            console.log(returnObject)
            postList.posts = []; //make sure it's empty
            returnObject.posts.forEach(post => { 
                //foreach - create element and save it to the variable for future reference
                let newPost = createPostElement(post);
                postList.posts.push(newPost);
            });
        })
        .catch(problem => console.error(problem));
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
    postLink.setAttribute(`href`, post.url);
    postLink.textContent = post.url;
    containerDiv.appendChild(postLink);

    //score
    let scoreField = document.createElement(`div`);
    scoreField.textContent = post.score;
    scoreField.classList.add(`scoreField`);
    containerDiv.appendChild(scoreField);

    //timestamp
    let timestampField = document.createElement(`time`);
    timestampField.textContent = `last modified: ` + howLongAgo(post.timestamp);
    containerDiv.appendChild(timestampField);

    //owner
    let ownerField = document.createElement(`div`);
    ownerField.textContent = post.owner || `anonymous`;
    ownerField.classList.add(`ownerField`);
    containerDiv.appendChild(ownerField);
    
    //decorations (upboat, downboat,
    let upvoteImg = document.createElement(`img`);
    upvoteImg.classList.add(`up`);
    upvoteImg.setAttribute(`src`, `/static/assets/upvote.png`); //todo check logged in user
    upvoteImg.setAttribute(`alt`, `upvote the post ${post.id}`); //
    containerDiv.appendChild(upvoteImg);

    let downvoteImg = document.createElement(`img`);
    downvoteImg.classList.add(`down`);
    downvoteImg.setAttribute(`src`, `/static/assets/downvote.png`); //todo check logged in user
    downvoteImg.setAttribute(`alt`, `downvote the post ${post.id}`); //
    containerDiv.appendChild(downvoteImg);

    // modify, delete)



    //compare owner with username


    //prepend to main
    mainElement.prepend(containerDiv);
    return containerDiv;

}

function howLongAgo(timestamp) {
    const now = new Date();
    let diff = now - timestamp;

    const second = 1000;
    const minute = 60 * second;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff <= second) return `just now`;

    const ref = [day, hour, minute, second, 1];

    const ago = ref.map(period => {
        let periodInDiff = Math.floor(diff/period);
        diff -= periodInDiff * period;
        return periodInDiff;
    });

    return `${ago[0]!==0 ? ago[0] + " days " : ""}${ago[1]!==0 ? ago[1] + " hours " : ""}`+
           `${ago[2]!==0 ? ago[2] + " minutes " : ""}${ago[3]!==0 ? ago[3] + " seconds " : ""}`

    //const ago = {}
    // ago.days = Math.floor(diff / day);
    // diff -= ago.days * day;

    // ago.hours = Math.floor(diff / hour);
    // diff -= ago.hours * hour;
    
}