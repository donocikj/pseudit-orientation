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
        .then(posts => {
            console.log(posts)
            postList.posts = []; //make sure it's empty
            posts.forEach(post => { 
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
    //title
    let postTitle = document.createElement(`h3`);
    postTitle.textContent = 
    //link
    //score
    //decorations (upboat, downboat, modify, delete)

}