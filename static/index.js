"use strict";


const mainElement = document.querySelector(`main`);
const submissionForm = document.forms.submissionForm;
const loginContainer = document.querySelector(`#loginContainer`);
const loginForm = document.forms.loginForm;

const postMap = {};

let openModification = undefined;

//let username = undefined;

//let user = 'anonymous'

console.log(`script loaded`)

//just because I love that picture
document.querySelector(`header`).addEventListener(`click`, (e) => {
    document.querySelector(`header`).classList.toggle(`expanded`);
})

////////////////////////////
//register even listeners

//on load - check if user is logged in
document.addEventListener(`DOMContentLoaded`, checkCredentials);
//on load - grab all the available posts and dump them onto the page
document.addEventListener(`DOMContentLoaded`, fetchAllPosts);

//login form
loginForm.addEventListener(`submit`, loginAttempt);

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

function checkCredentials() {

    if(localStorage.getItem(`username`)) {
        loginFormReplaceWithLogout();
    }

    // console.log(`identity crisis - fetch`)
    // fetch(`/whoami`)
    //     .then(
    //         response => {
    //             // console.log(`identity crisis - resolve`);
    //             // console.log(response);
    //             return response.json();
    //         },
    //         problem => console.error(problem)
    //     ).then( answer => {
    //         // console.log(answer);
    //         localStorage.getItem(`username`) = answer.username;
    //         if(username !== undefined) {
    //             loginFormReplaceWithLogout();
    //             console.log(`hello, ${localStorage.getItem(`username`)}`);
    //         } else {
    //             console.log(`hello, signature illegible`);
    //         }
    //     })
    //     .catch(error => console.error(error));
    
}

//retrieve all posts from the database by accessing the appropriate GET endpoint of backend.
function fetchAllPosts(e) {
    //console.log(e);
    //console.log(localStorage.getItem(`username`));

    fetch(`/posts/`, {
        headers: {
            "username": localStorage.getItem(`username`)
        }
    })
    //examine response for statuses...
        .then(response => {
            //console.log(response.headers)
            return response.json();
        })
    //examine the post list
        .then(returnObject => {
            //console.log(returnObject)
            postMap.posts = {}; //make sure it's empty
            mainElement.innerHTML = ``;
            returnObject.posts.forEach(post => { 
                //foreach - create element and save it to the variable for future reference
                let newPost = createPostElement(post);
                postMap[post.id] = {
                    postElement: newPost,
                    postData: post
                }
            });
            //console.log(submissionForm);
            //console.log(postMap);
        })
        .catch(problem => console.error(problem));
}

//TODO something that works
function loginAttempt(e) {
    e.preventDefault();
    localStorage.setItem(`username`, loginForm.username.value )

    location.reload(true);
    //username = loginForm.username.value;
    // loginForm.username.value = ``;
    // loginForm.password.value = ``;

    // loginFormReplaceWithLogout();

    // e.preventDefault();

    // fetch(`/login`)
    //     .then(response => {
    //         console.log(response);
    //         checkCredentials();
    //     },
    //         problem => console.error(problem));

}

//TODO something that works
function logout(e) {
    
    localStorage.removeItem(`username`);
    location.reload(true);

    

    // fetch(`/logout`, {
    //     headers: { //ugly, but seems to work.
    //         "authorization": "Basic bG9nb3V0OmxvZ291dA==" //logout:logout
    //     }
    // })
    //     .then(response => {
    //         document.execCommand("ClearAuthenticationCache");
    //         location.reload(true);
    //         // console.log(response)
    //         // checkCredentials();
    //         // loginFormReinstate();
    //     },
    //     problem => console.error(problem));
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
            "Content-Type": "application/json",
            "username": localStorage.getItem(`username`)
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
    if(e.target.classList.contains(`voted`)) {
        console.log(`upvoting post ${e.target.getAttribute(`data-postId`)} :)`);
        cancelVote(e.target.getAttribute(`data-postId`));
    } else if (e.target.classList.contains(`up`)) {
        console.log(`upvoting post ${e.target.getAttribute(`data-postId`)} :)`);
        upVote(e.target.getAttribute(`data-postId`));
    } else if (e.target.classList.contains(`down`)) {
        console.log(`downvoting post ${e.target.getAttribute(`data-postId`)} >:(`);
        downVote(e.target.getAttribute(`data-postId`));
    } else if (e.target.classList.contains(`modify`)) {
        console.log(`attempting to edit post ${e.composedPath()[2].getAttribute(`data-id`)}`);
        preparePostModification(e.composedPath()[2]);
    } else if (e.target.classList.contains(`delete`)) {
        console.log(`attempting to delete post ${e.composedPath()[2].getAttribute(`data-id`)}`);
        deletePost(e.composedPath()[2].getAttribute(`data-id`));
    }
}


///////////////////////////
//helper functions

//replaces the login form with username and logout button
function loginFormReplaceWithLogout() {
    loginContainer.innerHTML=``;
    const greetingElement = document.createElement(`h3`);
    greetingElement.textContent = `Hello, ${localStorage.getItem(`username`)}`;

    const logoutButton = document.createElement(`button`);
    logoutButton.textContent = `Logout`;
    logoutButton.addEventListener(`click`, logout);

    loginContainer.appendChild(greetingElement);
    loginContainer.appendChild(logoutButton);

}

function loginFormReinstate() {
    loginContainer.innerHTML=``;
    loginContainer.appendChild(loginForm);
}



//accepts object with all post related data required to generate an element
function createPostElement(post) {
    //console.log(post);

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

    if(post.vote === 1) {
        upvoteImg.classList.add(`voted`);
        upvoteImg.setAttribute(`src`, `/static/assets/upvoted.png`); 
    }
    else {
        upvoteImg.setAttribute(`src`, `/static/assets/upvote.png`); 
    }

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

    if(post.vote === -1) {
        downvoteImg.classList.add(`voted`);
        downvoteImg.setAttribute(`src`, `/static/assets/downvoted.png`);
    }
    else {
        downvoteImg.setAttribute(`src`, `/static/assets/downvote.png`);
    }

    downvoteImg.setAttribute(`alt`, `downvote the post ${post.id}`); //
    downvoteImg.setAttribute(`data-postId`, post.id)
    voteField.appendChild(downvoteImg);

    containerDiv.appendChild(voteField);


    // modify, delete)
    let toolDiv = document.createElement(`div`);
    toolDiv.classList.add(`tools`);

    let modifyLink = document.createElement(`a`);
    modifyLink.classList.add(`modify`);
    if (post.owner === localStorage.getItem(`username`))
        modifyLink.classList.add(`accessible`);
    modifyLink.textContent = `Modify`;
    toolDiv.appendChild(modifyLink);

    let deleteLink = document.createElement(`a`);
    deleteLink.classList.add(`delete`);
    deleteLink.textContent = `Delete`;
    toolDiv.appendChild(deleteLink);

    containerDiv.appendChild(toolDiv);


    //append to main
    mainElement.appendChild(containerDiv);
    return containerDiv;

}

//cancels vote on a post
function cancelVote(id) {
    vote(id, `cancel`);
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
        method: `PUT`,
        //headers
        headers: {
            "username": localStorage.getItem(`username`)
        }
    }).then(
        () => {
            location.reload(true);
        },
        problem => console.error(problem)
    );
}

//receives handle to container element of a post to be modified. Should substitute the container for a modification form.
function preparePostModification(postContainer) {

    if(openModification) { //there can be only one open modification
        mainElement.replaceChild(postMap[openModification.getAttribute(`data-id`)].postElement, openModification);
    }

    console.log(postContainer);
    //make substitute container
    let modifyContainer = assembleModifyForm(postContainer.getAttribute(`data-id`));
    console.log(modifyContainer);
    //swap it in
    mainElement.replaceChild(modifyContainer, postContainer);
    openModification = modifyContainer;

    //register event handler for submit
    document.forms.modifyForm.addEventListener(`submit`, (e) => {
        e.preventDefault();
        console.log(e);
        //modifyPost()
    })


    //register event handler for cancel -- replace the form with the container it previously replaced
    document.querySelector(`#cancelModify`).addEventListener(`click`, (e) => {
        mainElement.replaceChild(postContainer, modifyContainer);
        openModification = null;
    })


}

function assembleModifyForm (id) {

    console.log(`assembling form for post ${id}`);

    let formElement = document.createElement(`form`);
    formElement.classList.add(`container`);
    formElement.setAttribute(`name`,`modifyForm`);
    formElement.setAttribute(`data-id`, id);

    let titleInputElement = document.createElement(`input`);
    titleInputElement.setAttribute(`type`, `text`);
    titleInputElement.setAttribute(`required`, ``);
    titleInputElement.setAttribute(`name`, `newTitle`);
    titleInputElement.setAttribute(`id`, `modifyTitle`);
    titleInputElement.value = postMap[id].postData.title;

    let modifyTitleLabelElement = document.createElement(`label`);
    modifyTitleLabelElement.setAttribute(`for`,`modifyTitle`);
    modifyTitleLabelElement.setAttribute(`id`, `modifyTitleLabel`);
    modifyTitleLabelElement.textContent = `Title: `;

    formElement.appendChild(modifyTitleLabelElement)
    formElement.appendChild(titleInputElement);

    let urlInputElement = document.createElement(`input`);
    urlInputElement.setAttribute(`type`, `url`);
    urlInputElement.setAttribute(`required`, ``);
    urlInputElement.setAttribute(`id`, `modifyUrl`);
    urlInputElement.value = postMap[id].postData.url;
    

    let urlLabelElement = document.createElement(`label`);
    urlLabelElement.setAttribute(`for`,`modifyUrl`);
    urlLabelElement.setAttribute(`id`, `urlLabel`);
    urlLabelElement.textContent = `Url: `;

    formElement.appendChild(urlLabelElement)
    formElement.appendChild(urlInputElement);

    //modifyPost
    let modifyButtonElement = document.createElement(`button`);
    modifyButtonElement.setAttribute(`type`, `submit`);
    modifyButtonElement.setAttribute(`id`, `modifyPost`);
    modifyButtonElement.textContent = `Submit`;
    formElement.appendChild(modifyButtonElement);

    //cancelModify
    let cancelModifyButtonElement = document.createElement(`button`);
    cancelModifyButtonElement.setAttribute(`type`, `button`);
    cancelModifyButtonElement.setAttribute(`id`, `cancelModify`);
    cancelModifyButtonElement.textContent = `X`;
    formElement.appendChild(cancelModifyButtonElement);

    console.log(document.forms);
    console.log(formElement);

    return formElement;

}

//receives id of post to be deleted
function deletePost(id) {
    fetch(`/posts/${id}`, {
        method: `DELETE`,
        //headers
        headers: {
            "username": localStorage.getItem(`username`)
        }
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
           `${ago[2]!==0 ? ago[2] + " minutes " : ""}${ago[3]!==0 ? ago[3] + " seconds " : ""} ago`
    
}